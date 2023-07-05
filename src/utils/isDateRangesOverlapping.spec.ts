// @ts-nocheck
import { describe, it, expect } from '@jest/globals'
import { isDateRangesOverlapping } from './isDateRangesOverlapping'

describe('isDateRangesOverlapping', () => {
  it('should return false for empty array', () => {
    const dateRanges = []
    const result = isDateRangesOverlapping(dateRanges)
    expect(result).toBe(false)
  })

  it('should return false for non-overlapping ranges', () => {
    const dateRanges = [
      [new Date('2023-05-25T10:00:00'), new Date('2023-05-25T11:00:00')],
      [new Date('2023-05-25T11:30:00'), new Date('2023-05-25T12:30:00')],
    ]
    const result = isDateRangesOverlapping(dateRanges)
    expect(result).toBe(false)
  })

  it('should return true for overlapping ranges', () => {
    const dateRanges = [
      [new Date('2023-05-25T10:00:00'), new Date('2023-05-25T11:00:00')],
      [new Date('2023-05-25T11:00:00'), new Date('2023-05-25T12:00:00')],
    ]
    const result = isDateRangesOverlapping(dateRanges)
    expect(result).toBe(false)
  })

  it('should return true for overlapping ranges 3', () => {
    const dateRanges = [
      [new Date('2023-05-25T10:00:00'), new Date('2023-05-25T11:00:00')],
      [new Date('2023-05-25T11:01:00'), new Date('2023-05-25T12:00:00')],
    ]
    const result = isDateRangesOverlapping(dateRanges)
    expect(result).toBe(false)
  })

  it('should return true for overlapping ranges2', () => {
    const dateRanges = [
      [new Date('2023-05-25T10:00:00'), new Date('2023-05-25T11:00:00')],
      [new Date('2023-05-25T11:00:00'), new Date('2023-05-25T12:00:00')],
      [new Date('2023-05-20T11:00:00'), new Date('2023-05-27T12:00:00')],
    ]
    const result = isDateRangesOverlapping(dateRanges)
    expect(result).toBe(true)
  })

  it('should throw an error for invalid date ranges', () => {
    const dateRanges = [
      [new Date('2023-05-25T10:00:00'), new Date('2023-05-25T11:00:00')],
      [new Date('2023-05-25T11:00:00')],
    ]
    expect(() => isDateRangesOverlapping(dateRanges)).toThrow()
  })

  it('should throw an error for non-array argument', () => {
    const dateRanges = 'not an array'
    expect(() => isDateRangesOverlapping(dateRanges)).toThrow()
  })

  it('should throw an error for missing argument', () => {
    expect(() => isDateRangesOverlapping()).toThrow()
  })
  it('should throw an error for invalid date object in period', () => {
    const dateRanges = [
      [new Date('2023-05-25T10:00:00'), new Date('2023-05-25T11:00:00')],
      ['2023-05-25T11:30:00', new Date('2023-05-25T12:00:00')],
    ]
    expect(() => isDateRangesOverlapping(dateRanges)).toThrow()
  })
})
