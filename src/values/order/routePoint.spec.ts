// @ts-nocheck
import dayjs from 'dayjs'
import { describe, it, expect } from '@jest/globals'
import { RoutePoint } from './routePoint'
import { TemplateRoutePoint } from './templateRoutePoint'
import { POINT_TYPES_ENUM } from '../../constants/enums'

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

describe('RoutePointcreatefromTemplatePoint', () => {
  test('should throw error when orderDate is null', () => {
    const templatePoint = new TemplateRoutePoint({
      type: POINT_TYPES_ENUM.loading,
      address: '123 St',
      hourInterval: 2,
      useInterval: true,
    })

    expect(() => {
      RoutePoint.createFromTemplatePoint(templatePoint, null)
    }).toThrow('OrderDate is missing!')
  })

  test('should return RoutePoint object when function is passed with valid arguments', () => {
    const orderDate = new Date()
    const templatePoint = new TemplateRoutePoint({
      type: POINT_TYPES_ENUM.loading,
      address: '123 St',
      hoursInterval: 2.3,
      useInterval: true,
      fixedTime: 13.5,
      offsetDays: 0,
    })

    const result = RoutePoint.createFromTemplatePoint(templatePoint, orderDate)

    const expectedPlannedDate = new Date(
      dayjs(orderDate)
        .add(templatePoint.fixedTime, 'hours')
        .add(templatePoint.offsetDays, 'days')
    )

    const expectedEndDate = new Date(
      dayjs(orderDate)
        .add(templatePoint.fixedTime, 'hours')
        .add(templatePoint.hoursInterval, 'hours')
        .add(templatePoint.offsetDays, 'days')
    )

    expect(result).toMatchObject({
      plannedDate: expectedPlannedDate,
      intervalEndDate: expectedEndDate,
      useInterval: true,
    })
  })

  test('should return RoutePoint from template without fixedTime (first point)', () => {
    const orderDate = new Date()
    const templatePoint = new TemplateRoutePoint({
      type: POINT_TYPES_ENUM.loading,
      address: '123 St',
    })

    const result = RoutePoint.createFromTemplatePoint(
      templatePoint,
      orderDate,
      true
    )

    const expectedPlannedDate = new Date(dayjs(orderDate))

    expect(result).toMatchObject({
      plannedDate: expectedPlannedDate,
      intervalEndDate: null,
      useInterval: false,
    })
  })

  test('should return RoutePoint from template without fixedTime (second point)', () => {
    const orderDate = new Date()
    const templatePoint = new TemplateRoutePoint({
      type: POINT_TYPES_ENUM.loading,
      address: '123 St',
    })

    const result = RoutePoint.createFromTemplatePoint(
      templatePoint,
      orderDate,
      false
    )

    expect(result).toMatchObject({
      plannedDate: null,
      intervalEndDate: null,
      useInterval: false,
    })
  })
})
