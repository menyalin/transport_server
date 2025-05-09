import { IdleTruckNotificationMessage } from '../../../domain/notifications/idleTruckNotificationMessage'
import {
  IDefaultIdleTruckNotification,
  IIdleTruckNotificationMessageProps,
  MESSAGE_STATUS_ENUM,
} from '../../../domain/notifications/interfaces'
import { isNeedUpdateNotificationMessage } from './isNeedUpdateNotificationMessage'

describe('notifications utils - isNeedUpdateNotificationMessage', () => {
  let existedMessage: IdleTruckNotificationMessage
  let newMessage: IdleTruckNotificationMessage

  beforeEach(() => {
    const body: IDefaultIdleTruckNotification = {
      to: '1',
      cc: '1',
      bcc: '1',
      companyName: '1',
      driverPhones: '1',
      emailTitle: '1',
      isLoading: true,
      orderNum: '1',
      fullDriverName: '1',
      plannedDate: '1',
      routeAddressesString: '1',
      truckBrand: '1',
      truckNum: '1',
      templateName: '1',
      currentAddressString: '12',
      waybills: '121',
      showPointStatus: false,
    }

    const props: IIdleTruckNotificationMessageProps = {
      key: '1',
      orderId: '1',
      pointId: '1',
      status: MESSAGE_STATUS_ENUM.created,
      sendDate: new Date('2023-01-01'),
      body,
      notificationId: '1',
    }

    newMessage = new IdleTruckNotificationMessage(props)
    existedMessage = new IdleTruckNotificationMessage(props)
  })

  it('existedMessage is null: should return true', () => {
    expect(isNeedUpdateNotificationMessage(newMessage, null)).toBeTruthy()
  })

  it('true if existed message has "sended" status, but sendDate is changed', () => {
    existedMessage.sendDate = new Date('2023-01-02')
    existedMessage.status = MESSAGE_STATUS_ENUM.sended

    newMessage.sendDate = new Date('2023-01-03')
    expect(
      isNeedUpdateNotificationMessage(newMessage, existedMessage)
    ).toBeTruthy()
  })

  it('false if existed message has "sended" status and new message is canceled', () => {
    existedMessage.status = MESSAGE_STATUS_ENUM.sended
    newMessage.status = MESSAGE_STATUS_ENUM.canceled
    expect(
      isNeedUpdateNotificationMessage(newMessage, existedMessage)
    ).toBeFalsy()
  })
  it('true if new message has "canceled" status and existed message is "created"', () => {
    existedMessage.status = MESSAGE_STATUS_ENUM.created
    newMessage.status = MESSAGE_STATUS_ENUM.canceled
    expect(
      isNeedUpdateNotificationMessage(newMessage, existedMessage)
    ).toBeTruthy()
  })

  it('true if new message has "created" status and existed message is "created"', () => {
    existedMessage.status = MESSAGE_STATUS_ENUM.created
    newMessage.status = MESSAGE_STATUS_ENUM.canceled
    expect(
      isNeedUpdateNotificationMessage(newMessage, existedMessage)
    ).toBeTruthy()
  })
})
