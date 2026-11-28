/** Formatting the rich text editor produces; anything else is dropped when shown. */
const allowedTags = new Set([
  'B',
  'STRONG',
  'I',
  'EM',
  'U',
  'S',
  'STRIKE',
  'MARK',
  'SPAN',
  'P',
  'DIV',
  'BR',
  'UL',
  'OL',
  'LI',
]);

/** Inline styles browsers write for these formats; others are dropped. */
const allowedStyles = ['background-color', 'font-weight', 'font-style', 'text-decoration-line'];

const escapeText = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Text saved before formatting existed is plain, with line breaks. */
export const isHtml = (value: string) => /<[a-z][\s\S]*>/i.test(value);

export const plainToHtml = (text: string) => escapeText(text).replace(/\r?\n/g, '<br>');

function clean(node: Node, doc: Document): Node[] {
  if (node.nodeType === Node.TEXT_NODE) return [doc.createTextNode(node.textContent ?? '')];
  if (!(node instanceof HTMLElement)) return [];
  const children = [...node.childNodes].flatMap((child) => clean(child, doc));
  // Unknown tags (scripts, links, images…) lose the tag; scripts lose their text too.
  if (!allowedTags.has(node.tagName)) {
    return ['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT'].includes(node.tagName) ? [] : children;
  }
  const copy = doc.createElement(node.tagName.toLowerCase());
  for (const property of allowedStyles) {
    const value = node.style.getPropertyValue(property);
    if (value) copy.style.setProperty(property, value);
  }
  // text-decoration shorthand, as some browsers write underline and strikethrough.
  const decoration = node.style.getPropertyValue('text-decoration');
  if (/underline|line-through/.test(decoration)) {
    copy.style.setProperty(
      'text-decoration-line',
      decoration.match(/underline|line-through/g)?.join(' ') ?? '',
    );
  }
  copy.append(...children);
  return [copy];
}

/** Keeps only safe formatting, so setter-written HTML can be shown to others. */
export function sanitizeHtml(value: string): string {
  if (!value) return '';
  if (!isHtml(value)) return plainToHtml(value);
  const doc = new DOMParser().parseFromString(`<body>${value}</body>`, 'text/html');
  const out = doc.createElement('div');
  out.append(...[...doc.body.childNodes].flatMap((node) => clean(node, doc)));
  return out.innerHTML;
}

/** The words of formatted text, for lists, searches and "is it empty" checks. */
export function htmlToText(value: string): string {
  if (!isHtml(value)) return value;
  const doc = new DOMParser().parseFromString(
    value.replace(/<(br|\/p|\/div|\/li)[^>]*>/gi, ' $&'),
    'text/html',
  );
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}
