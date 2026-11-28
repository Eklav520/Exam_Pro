import clsx from 'clsx';
import {
  Bold,
  Eraser,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { sanitizeHtml } from '@/shared/lib/richText';

/** Styles for formatted text, shared by the editor and the read-only view. */
export const richTextClass =
  '[&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-0.5 [&_mark]:rounded-sm [&_mark]:bg-yellow-200 [&_mark]:px-0.5';

const HIGHLIGHT = '#fef08a';

interface Tool {
  label: string;
  shortcut?: string;
  icon: LucideIcon;
  command: string;
  /** Shows as pressed while the selection has this format. */
  state?: string;
  value?: string;
}

const toolGroups: Tool[][] = [
  [
    { label: 'Bold', shortcut: 'Ctrl+B', icon: Bold, command: 'bold', state: 'bold' },
    { label: 'Italic', shortcut: 'Ctrl+I', icon: Italic, command: 'italic', state: 'italic' },
    {
      label: 'Underline',
      shortcut: 'Ctrl+U',
      icon: Underline,
      command: 'underline',
      state: 'underline',
    },
    {
      label: 'Strikethrough',
      icon: Strikethrough,
      command: 'strikeThrough',
      state: 'strikeThrough',
    },
    { label: 'Highlight', icon: Highlighter, command: 'hiliteColor', value: HIGHLIGHT },
  ],
  [
    {
      label: 'Bulleted list',
      icon: List,
      command: 'insertUnorderedList',
      state: 'insertUnorderedList',
    },
    {
      label: 'Numbered list',
      icon: ListOrdered,
      command: 'insertOrderedList',
      state: 'insertOrderedList',
    },
  ],
  [
    { label: 'Undo', shortcut: 'Ctrl+Z', icon: Undo2, command: 'undo' },
    { label: 'Redo', shortcut: 'Ctrl+Y', icon: Redo2, command: 'redo' },
    { label: 'Clear formatting', icon: Eraser, command: 'removeFormat' },
  ],
];

/** True when the selection is already highlighted, so the button turns it off. */
function isHighlighted(editor: HTMLElement) {
  let node = window.getSelection()?.anchorNode ?? null;
  while (node && node !== editor) {
    if (node instanceof HTMLElement) {
      const color = node.style.backgroundColor;
      if (node.tagName === 'MARK' || (color && color !== 'transparent')) return true;
    }
    node = node.parentNode;
  }
  return false;
}

interface RichTextEditorProps {
  label: string;
  /** HTML, or plain text saved before formatting existed. */
  value: string;
  onChange: (html: string) => void;
  required?: boolean;
  error?: string | undefined;
  hint?: string;
  placeholder?: string;
}

/** A text box with a formatting toolbar. Its HTML is sanitized wherever it is shown. */
export function RichTextEditor({
  label,
  value,
  onChange,
  required = false,
  error,
  hint,
  placeholder,
}: RichTextEditorProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const messageId = `${id}-message`;
  const editorRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Set<string>>(new Set());
  const [isEmpty, setIsEmpty] = useState(!value);
  const message = error ?? hint;

  // The editor owns its content while typing; only the first value is written in.
  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = sanitizeHtml(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const update = () => {
      const editor = editorRef.current;
      if (!editor || !editor.contains(document.getSelection()?.anchorNode ?? null)) return;
      const states = new Set<string>();
      for (const tool of toolGroups.flat()) {
        try {
          if (tool.state && document.queryCommandState(tool.state)) states.add(tool.state);
        } catch {
          // Not supported here.
        }
      }
      if (isHighlighted(editor)) states.add('hiliteColor');
      setActive(states);
    };
    document.addEventListener('selectionchange', update);
    return () => document.removeEventListener('selectionchange', update);
  }, []);

  const emit = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const text = editor.textContent?.trim() ?? '';
    setIsEmpty(!text && !editor.querySelector('li'));
    onChange(text || editor.querySelector('li') ? editor.innerHTML : '');
  };

  const run = (tool: Tool) => {
    editorRef.current?.focus();
    try {
      if (tool.command === 'hiliteColor') {
        document.execCommand('styleWithCSS', false, 'true');
        document.execCommand(
          'hiliteColor',
          false,
          active.has('hiliteColor') ? 'transparent' : HIGHLIGHT,
        );
        document.execCommand('styleWithCSS', false, 'false');
      } else {
        document.execCommand(tool.command, false, tool.value);
      }
    } catch {
      // Formatting is unavailable; the text is still kept.
    }
    emit();
  };

  return (
    <div className="space-y-1.5">
      <span id={labelId} className="block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      <div
        className={clsx(
          'overflow-hidden rounded-lg border bg-surface focus-within:ring-2 focus-within:ring-brand-700/30',
          error ? 'border-danger' : 'border-line focus-within:border-brand-700',
        )}
      >
        <div
          role="toolbar"
          aria-label={`${label} formatting`}
          className="flex flex-wrap items-center gap-1 border-b border-line bg-canvas px-2 py-1.5"
        >
          {toolGroups.map((group, index) => (
            <div
              key={index}
              className={clsx('flex gap-0.5', index > 0 && 'border-l border-line pl-1.5')}
            >
              {group.map((tool) => {
                const key = tool.state ?? tool.command;
                const pressed = tool.state || tool.command === 'hiliteColor';
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.command}
                    type="button"
                    title={tool.shortcut ? `${tool.label} (${tool.shortcut})` : tool.label}
                    aria-label={tool.label}
                    aria-pressed={pressed ? active.has(key) : undefined}
                    // Keep the text selection while clicking the toolbar.
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => run(tool)}
                    className={clsx(
                      'flex size-8 items-center justify-center rounded-md text-ink transition-colors hover:bg-line',
                      active.has(key) && 'bg-brand-50 text-brand-800',
                    )}
                  >
                    <Icon aria-hidden className="size-4" />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="relative">
          {isEmpty && placeholder && (
            <span
              aria-hidden
              className="pointer-events-none absolute top-3 left-4 text-muted/80 select-none"
            >
              {placeholder}
            </span>
          )}
          <div
            ref={editorRef}
            role="textbox"
            aria-multiline="true"
            aria-labelledby={labelId}
            aria-required={required || undefined}
            aria-invalid={Boolean(error)}
            aria-describedby={message ? messageId : undefined}
            contentEditable
            suppressContentEditableWarning
            tabIndex={0}
            onInput={emit}
            onBlur={emit}
            className={clsx(
              'max-h-[50dvh] min-h-64 overflow-y-auto px-4 py-3 leading-relaxed outline-none',
              richTextClass,
            )}
          />
        </div>
      </div>
      {message && (
        <p id={messageId} className={error ? 'text-sm text-danger' : 'text-sm text-muted'}>
          {message}
        </p>
      )}
    </div>
  );
}

/** Shows formatted text safely. */
export function RichText({ value, className }: { value: string; className?: string }) {
  return (
    <div
      className={clsx(richTextClass, className)}
      // Sanitized: only basic formatting tags survive.
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
    />
  );
}
