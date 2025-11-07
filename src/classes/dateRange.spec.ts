import { DateRange } from './dateRange'

describe('DateRange', () => {
  test('should correctly determine if a date is within the range', () => {
    const range = new DateRange('2022-01-01', '2022-12-31')
    expect(range.contains(new Date('2022-06-01'))).toBe(true)
    expect(range.contains(new Date('2023-01-01'))).toBe(false)
  })

  test('should correctly handle date ranges where the start date is after the end date', () => {
    const range = new DateRange('2022-12-31', '2022-01-01')
    expect(range.contains(new Date('2022-06-01'))).toBe(true)
    expect(range.contains(new Date('2023-01-01'))).toBe(false)
    expect(range.start).toEqual(new Date('2022-01-01'))
  })

  test('should throw an error for invalid date formats', () => {
    expect(() => new DateRange('invalid date', '2022-12-31')).toThrow(
      'Invalid date format'
    )
    expect(() => new DateRange('2022-01-01', 'invalid date')).toThrow(
      'Invalid date format'
    )
  })
})
