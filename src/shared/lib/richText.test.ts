import { htmlToText, sanitizeHtml } from './richText';

describe('rich text', () => {
  it('keeps formatting and drops anything unsafe', () => {
    expect(
      sanitizeHtml(
        '<b>Bold</b> <u>under</u> <span style="background-color: #fef08a; color: red">hi</span>' +
          '<img src=x onerror="alert(1)"><script>alert(1)</script><a href="javascript:x">link</a>',
      ),
    ).toBe(
      '<b>Bold</b> <u>under</u> <span style="background-color: rgb(254, 240, 138);">hi</span>link',
    );
  });

  it('shows plain text saved before formatting with its line breaks', () => {
    expect(sanitizeHtml('a < b\nnext')).toBe('a &lt; b<br>next');
  });

  it('reads the words of formatted text', () => {
    expect(htmlToText('<ul><li>One</li><li><b>Two</b></li></ul>')).toBe('One Two');
    expect(htmlToText('<br>')).toBe('');
  });
});
