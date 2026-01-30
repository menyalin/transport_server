import { convertTimeToHours } from './convertTimeToHours'

describe('convertTimeToHours', () => {
  test('valid time strings', () => {
    expect(convertTimeToHours('14:00')).toBe(14)
    expect(convertTimeToHours('08:30')).toBe(8.5)
    expect(convertTimeToHours('9:00 pm')).toBe(21)
    expect(convertTimeToHours('0:00')).toBe(0)
    expect(convertTimeToHours('00:00')).toBe(0)
  })

  test('invalid time strings', () => {
    expect(() => convertTimeToHours('27:00')).toThrow('Invalid time string')
    expect(() => convertTimeToHours('14:75')).toThrow('Invalid time string')
    expect(() => convertTimeToHours('abc')).toThrow('Invalid time string')
    expect(() => convertTimeToHours('')).toThrow('Invalid time string')
  })
})
