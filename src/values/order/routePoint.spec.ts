// @ts-nocheck
import dayjs from 'dayjs'
import { describe, it, expect } from '@jest/globals'
import { RoutePoint } from './routePoint'

describe('RoutePoint value-object', () => {
  const unloadingDurationInMinutes = 15
  const fixedMinDate = new Date('2023-05-27')
  const arrivalDate = new Date('2023-05-27')
  const departureDate = new Date('2023-05-28')

  let point1
  let point2
  let point3

  beforeEach(() => {
    point1 = new RoutePoint({ type: 'loading', address: 'address' })

    point2 = new RoutePoint({
      type: 'loading',
      address: 'address',
      arrivalDate,
    })

    point3 = new RoutePoint({
      type: 'loading',
      address: 'address',
      arrivalDate,
      departureDate,
    })
  })

  it('autofillDates: should update point last date and set "isAutofilled" true', () => {
    const expectedDate = new Date(
      dayjs(fixedMinDate)
        .add(unloadingDurationInMinutes, 'minutes')
        .toISOString()
    )

    const res = point1.autofillDates({
      minDate: fixedMinDate,
      unloadingDurationInMinutes,
    })
    expect(res).toEqual(expectedDate)
    expect(point1.isAutofilled).toBeTruthy()
  })

  it('autofillDates: should fill departure date and return updated "minDate"', () => {
    const expectedTmpDate = new Date(
      dayjs(arrivalDate)
        .add(unloadingDurationInMinutes, 'minutes')
        .toISOString()
    )

    const res = point2.autofillDates({
      minDate: fixedMinDate,
      unloadingDurationInMinutes,
    })

    expect(res).toEqual(expectedTmpDate)
    expect(point2.isAutofilled).toBeTruthy()
  })

  it('autofillDates: should skip fill dates and return departure date', () => {
    const expectedTmpDate = new Date(dayjs(departureDate).toISOString())

    const res = point3.autofillDates({
      minDate: fixedMinDate,
      unloadingDurationInMinutes,
    })

    expect(res).toEqual(expectedTmpDate)
    expect(point2.isAutofilled).toBeFalsy()
  })

  it('autofillDates: should throw error: minDate is null', () => {
    expect(() => {
      point3.autofillDates({
        minDate: null,
        unloadingDurationInMinutes,
      })
    }).toThrowError()
  })

  it('autofillDates: should throw error: unloadingDurationInMinutes is string', () => {
    expect(() => {
      point3.autofillDates({
        minDate: fixedMinDate,
        unloadingDurationInMinutes: 'some string',
      })
    }).toThrowError()
  })

  it('getDurationInMinutes: should return 0, if dates is missing', () => {
    const point = new RoutePoint({
      type: 'loading',
      address: 'id',
    })
    expect(point.getDurationInMinutes).toBe(0)
  })

  it('getDurationInMinutes: should return 60', () => {
    const point = new RoutePoint({
      type: 'loading',
      address: 'id',
      arrivalDateDoc: new Date('2023-06-06T08:00:00.000Z'),
      departureDateDoc: new Date('2023-06-06T09:00:00.000Z'),
    })
    expect(point.getDurationInMinutes).toBe(60)
  })
  it('getDurationInMinutes: should return 0, departure date is missing', () => {
    const point = new RoutePoint({
      type: 'loading',
      address: 'id',
      arrivalDateDoc: new Date('2023-06-06T08:00:00.000Z'),
    })
    expect(point.getDurationInMinutes).toBe(0)
  })
})
