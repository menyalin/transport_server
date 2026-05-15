export function sanitizeFilename(filename: string): string {
  // Убираем/заменяем недопустимые символы
  return filename
    .replace(/[\\/:*?"<>|]/g, '') // недопустимые символы Windows
    .replace(/\s+/g, '_') // пробелы → подчеркивание
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1f\x80-\x9f]/g, '') // управляющие символы
    .replace(/^\.+/, '') // точки в начале имени
    .replace(/\.+$/, '') // точки в конце имени
    .slice(0, 255) // ограничение длины (обычно 255)
}
