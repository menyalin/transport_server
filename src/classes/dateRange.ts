export interface IDateRange {
  start: Date
  end: Date
  contains: (date: Date) => boolean
}

export class DateRange implements IDateRange {
  start: Date
  end: Date

  constructor(start: Date | string, end: Date | string) {
    if (typeof start === 'string' || typeof end === 'string') {
      // Пытаемся преобразовать строки в даты с помощью метода Date.parse
      const startDate =
        typeof start === 'string' ? Date.parse(start) : start.getTime()
      const endDate = typeof end === 'string' ? Date.parse(end) : end.getTime()

      if (isNaN(startDate) || isNaN(endDate))
        throw new Error('Invalid date format')

      // Присваиваем значения результатов преобразования свойствам класса
      this.start = new Date(startDate)
      this.end = new Date(endDate)
    } else {
      this.start = start
      this.end = end
    }

    // Проверяем, какая дата меньше - start или end.  и деструктуризацией меняем значения местами
    if (this.start > this.end) [this.start, this.end] = [this.end, this.start]
  }

  contains(date: Date): boolean {
    return date >= this.start && date <= this.end
  }
}
