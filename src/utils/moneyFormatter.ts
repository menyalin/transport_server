export const moneyFormatter = (value: number, locale = 'ru-RU'): string => {
  if (value === 0) return '0'
  if (!value || !Number.isFinite(value)) return 'Пусто'

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value)
}
