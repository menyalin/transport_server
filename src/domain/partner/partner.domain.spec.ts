// import { PARTNER_GROUPS_ENUM } from '../../constants/partner'

import { IdleTruckNotification } from './idleTruckNotification'
import { Partner as PartnerDomain } from './partner.domain'
import * as utils from './helpers/index'
import { RoutePoint } from '../order/route/routePoint'

describe('Partner domain', () => {
  let partner1: PartnerDomain
  let notification: IdleTruckNotification
  let point: RoutePoint
  beforeEach(() => {
    notification = new IdleTruckNotification({
      emails: '1@1.ru',
      isActive: true,
      addresses: ['1'],
      title: '1',
      idleHoursBeforeNotify: 2,
      usePlannedDate: true,
      templateName: '1',
    })
    point = new RoutePoint({
      address: '1',
      type: 'loading',
      plannedDate: new Date('2023-01-01'),
    })
  })

  it('utils.isNeedCreateNotification: should return true, if notification.usePlannedDate && point.plannedDate', () => {
    expect(
      utils.isNeedCreateNotificationByPoint(notification, point)
    ).toBeTruthy()
  })
  it('utils.isNeedCreateNotification: should return false, if notification.usePlannedDate && point.plannedDate === null', () => {
    point.plannedDate = null
    expect(
      utils.isNeedCreateNotificationByPoint(notification, point)
    ).toBeFalsy()
  })
  it('utils.isNeedCreateNotification: should return false, if !notification.usePlannedDate && point.plannedDate === null', () => {
    point.plannedDate = null
    notification.usePlannedDate = false
    expect(
      utils.isNeedCreateNotificationByPoint(notification, point)
    ).toBeFalsy()
  })
  it('utils.isNeedCreateNotification: should return true, if !notification.usePlannedDate && point.isStarted', () => {
    point.plannedDate = new Date('2023-01-01')
    point.arrivalDate = new Date('2023-01-01')
    notification.usePlannedDate = false
    expect(
      utils.isNeedCreateNotificationByPoint(notification, point)
    ).toBeTruthy()
  })
})
