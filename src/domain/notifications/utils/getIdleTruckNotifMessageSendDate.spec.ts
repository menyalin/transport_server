import { getIdleTruckNotificationMessageSendDate } from './getIdleTruckNotifMessageSendDate' // замените на имя вашего модуля
import MockDate from 'mockdate'
import { IdleTruckNotification } from '../../partner/idleTruckNotification'
import { RoutePoint } from '@/domain/order/route/routePoint'

describe('getIdleTruckNotificationMessageSendDate', () => {
  let notification: IdleTruckNotification
  let point: RoutePoint

  beforeEach(() => {
    MockDate.set(new Date())
    notification = new IdleTruckNotification({
      addresses: ['1'],
      emails: '1@1.ru',
      idleHoursBeforeNotify: 1,
      templateName: '1',
      title: 'a',
      usePlannedDate: false,
      isActive: true,
    })
    point = new RoutePoint({
      type: 'loading',
      address: '1',
      plannedDate: new Date('2023-01-01'),
      arrivalDate: new Date('2023-01-02'),
    })
  })

  afterEach(() => {
    MockDate.reset()
  })

  it('arrival date greater than planned date, should return arrival date + idleHoursBeforeNotify', () => {
    notification.idleHoursBeforeNotify = 24
    const expectedDate = new Date('2023-01-03')

    expect(
      getIdleTruckNotificationMessageSendDate(notification, point)
    ).toEqual(expectedDate)
  })

  it('planned date greater than arrival date, should return planned date + idleHoursBeforeNotify', () => {
    notification.idleHoursBeforeNotify = 24
    point.arrivalDate = new Date('2022-12-31')
    const expectedDate = new Date('2023-01-02')
    expect(
      getIdleTruckNotificationMessageSendDate(notification, point)
    ).toEqual(expectedDate)
  })

  it('usePalnnedDate is true, use only planned date in point', () => {
    notification.idleHoursBeforeNotify = 24
    notification.usePlannedDate = true
    point.plannedDate = new Date('2024-01-01')
    point.arrivalDate = new Date('2024-01-02')
    const expectedDate = new Date('2024-01-02')
    expect(
      getIdleTruckNotificationMessageSendDate(notification, point)
    ).toEqual(expectedDate)
  })
  it('nullable dates in point. should return null', () => {
    notification.idleHoursBeforeNotify = 24
    notification.usePlannedDate = false
    point.plannedDate = null
    point.arrivalDate = null
    const expectedDate = null
    expect(
      getIdleTruckNotificationMessageSendDate(notification, point)
    ).toEqual(expectedDate)
  })
})
