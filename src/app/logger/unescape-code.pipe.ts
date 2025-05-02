import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unescape',
})
export class UnescapePipe implements PipeTransform {
  transform(value: string): string {
    return unescapeString(value);
  }
}

/**
 * Unescapes a c-escaped string
 * @param str The string to unescape
 * @returns The unescaped string
 */
function unescapeString(str: string): string {
  return str.replace(/\\(.)/g, (_, char) => {
    switch (char) {
      case 'n':
        return '\n';
      case 't':
        return '\t';
      case 'r':
        return '\r';
      case '"':
        return '"';
      case "'":
        return "'";
      case '\\':
        return '\\';
      default:
        return char;
    }
  });
}
