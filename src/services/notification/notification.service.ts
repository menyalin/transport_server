import { EventBus } from 'ts-bus'
import { bus } from '../../eventBus'
import path from 'node:path'
import nodemailer, { Transporter } from 'nodemailer'
import Email from 'email-templates'
import Mail from 'nodemailer/lib/mailer'
import {
  IAuthProps,
  IDefaultIdleTruckNotification,
} from '../../domain/notifications/interfaces'
import {
  toCancelIdleTruckNotificationMessagesEvent,
  toSendIdleTruckNotificationMessageEvent,
} from '../../domain/partner/domainEvents'
import { toCreateIdleTruckNotificationEvent } from './events/idleTruckNotifications'
import { FullOrderDataDTO } from '../../domain/order/dto/fullOrderData.dto'
import { IdleTruckNotification } from '../../domain/partner/idleTruckNotification'
import { RoutePoint } from '../../values/order/routePoint'
import { Order } from '../../domain/order/order.domain'
import OrderRepository from '../../repositories/order/order.repository'
import { IdleTruckNotificationMessage } from '../../domain/notifications/idleTruckNotificationMessage'
import NotificationRepository from '../../repositories/notification/notification.repository'
import { transporterConfig } from './transporterConfig'
import * as utils from './utils/index'
import { OrderRemoveEvent } from '../../domain/order/domainEvents'

class NotificationService {
  senderEmail?: string
  bus: EventBus
  transporter: Transporter

  constructor({ bus }: { bus: EventBus }) {
    this.bus = bus
    this.senderEmail =
      process.env.NODE_ENV === 'production'
        ? process.env.MAIL_USER
        : process.env.FAKE_MAIL_USER

    const config = transporterConfig()
    this.transporter = nodemailer.createTransport(config)
    this.bus.subscribe(OrderRemoveEvent, ({ payload: { orderId } }) => {
      this.deleteNotificationsByOrderId(orderId)
    })
    this.bus.subscribe(
      toCreateIdleTruckNotificationEvent,
      async ({ payload }) => {
        this.createIdleTruckNotificationMessage(
          payload.order,
          payload.notification,
          payload.point
        )
      }
    )
    this.bus.subscribe(
      toCancelIdleTruckNotificationMessagesEvent,
      async ({ payload }) => {
        await this.cancelIdleTruckNotificationMessages(payload)
      }
    )
    this.bus.subscribe(
      toSendIdleTruckNotificationMessageEvent,
      async ({ payload }) => {
        await this.sendIdleTruckNotificationMessage(payload)
      }
    )
  }

  async cancelIdleTruckNotificationMessages(notificationId: string) {
    await NotificationRepository.cancelIdleTruckNotificationMessages(
      notificationId
    )
  }
  async deleteNotificationsByOrderId(orderId: string): Promise<void> {
    const notifications: IdleTruckNotificationMessage[] =
      await NotificationRepository.getByOrderId(orderId)

    notifications.forEach(async (notification) => {
      notification.delete()
      await NotificationRepository.updateIdleTruckNotificationMessage(
        notification
      )
    })
  }

  async createIdleTruckNotificationMessage(
    order: Order,
    notification: IdleTruckNotification,
    point: RoutePoint
  ): Promise<void> {
    const orderData: FullOrderDataDTO =
      await OrderRepository.getFullOrderDataDTO(order.id)
    const message = IdleTruckNotificationMessage.create(
      orderData,
      notification,
      point
    )
    const existedMessage = await NotificationRepository.getByKey(message.key)

    if (utils.isNeedUpdateNotificationMessage(message, existedMessage))
      await NotificationRepository.updateIdleTruckNotificationMessage(message)
  }

  async sendRestorePasswordLink({ email, token }: IAuthProps) {
    const link = process.env.CLIENT_URL + '/auth/restore_password/' + token
    const message: Mail.Options = {
      from: `s4log notification<${this.senderEmail}>`,
      to: email,
      subject: 'Восстановления пароля',

      html: `
      <h2>s4log</h2>
      <p>Для восстановления пароля перейдите по <a target="_blank" href="${link}">ссылке</a></p>
      <br/>
      <small>Ссылка действительна 30 минут</small>
      `,
    }
    await this.transporter.sendMail(message)
  }

  async sendConfirmationEmailLink({ email, token }: IAuthProps) {
    const link = process.env.CLIENT_URL + '/auth/confirm_email/' + token
    const message: Mail.Options = {
      from: `s4log notification<${this.senderEmail}>`,
      to: email,
      subject: 'Подтверждение адреса электронной почты',

      html: `
      <h2>s4log</h2>
      <p>Для подтверждения email перейдите по <a target="_blank" href="${link}">ссылке*</a></p>
      <br/>
      <small>*Ссылка действительна 24 часа</small>
      `,
    }
    await this.transporter.sendMail(message)
  }

  async sendIdleTruckNotificationMessage(
    props: IDefaultIdleTruckNotification
  ): Promise<void> {
    const email = new Email({
      views: { root: path.join(process.cwd(), 'emailTemplates') },
    })
    const html = await email.render('defaultIdleTruckNotify', props)
    await this.transporter.sendMail({
      from: `${props.companyName} <${this.senderEmail}>`,
      to: props.to,
      cc: props.cc || ''.trim(),
      subject: props.emailTitle,
      html,
    })
  }
}

export default new NotificationService({ bus })
