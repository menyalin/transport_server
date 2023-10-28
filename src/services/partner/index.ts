import { BadRequestError } from '../../helpers/errors'
import { Partner } from '../../models'
import { emitTo } from '../../socket'
import ChangeLogService from '../changeLog'
import { IdleTruckNotification } from '../../domain/partner/idleTruckNotification'
import { Partner as PartnerDomain } from '../../domain/partner/partner.domain'
import { Order as OrderDomain } from '../../domain/order/order.domain'
import PartnerRepository from '../../repositories/partner/partner.repository'
import { bus } from '../../eventBus'
import {
  IConstructorProps,
  ICreateProps,
  IDeleteByIdProps,
  IUpdateOneProps,
} from './interfaces'
import { LoadingDock } from '../../domain/partner/loadingDock.domain'
import { OrderUpdatedEvent } from '../../domain/order/domainEvents'
import { toCreateIdleTruckNotificationEvent } from '../notification/events/idleTruckNotifications'
import { ILoadingDockProps } from '../../domain/partner/interfaces'

class PartnerService {
  model: typeof Partner
  emitter: typeof emitTo
  modelName: string
  logService: typeof ChangeLogService

  constructor({ model, emitter, modelName, logService }: IConstructorProps) {
    this.model = model
    this.emitter = emitter
    this.modelName = modelName
    this.logService = logService
    bus.subscribe(OrderUpdatedEvent, ({ payload: order }) => {
      this.createIdleTruckNotification(order)
    })
  }

  private async createIdleTruckNotification(order: OrderDomain): Promise<void> {
    if (order.isInProgress || order.isCompleted) {
      const partner = await PartnerRepository.getById(order.client.client)

      const notifications = partner.notificationsByOrder(order)
      notifications.forEach((notification) => {
        bus.publish(
          toCreateIdleTruckNotificationEvent({ order, ...notification })
        )
      })
    }
  }

  async create({ body, user }: ICreateProps) {
    const partner = await PartnerRepository.create(new PartnerDomain(body))
    await this.logService.add({
      docId: partner.id,
      coll: this.modelName,
      opType: 'create',
      user,
      company: partner.company,
      body: JSON.stringify(partner.toObject()),
    })
    this.emitter(
      partner.company,
      `${this.modelName}:created`,
      partner.toObject()
    )
    return partner
  }

  async updateOne({ id, body, user }: IUpdateOneProps) {
    const partner = new PartnerDomain({
      _id: id,
      ...body,
    })
    await PartnerRepository.updatePartner(partner)

    await this.logService.add({
      docId: partner.id,
      coll: this.modelName,
      opType: 'update',
      user,
      company: partner.company,
      body: JSON.stringify(partner.toObject()),
    })
    this.emitter(
      partner.company,
      `${this.modelName}:updated`,
      partner.toObject()
    )
    return partner
  }

  async getByProfile(profile: string) {
    const data = await this.model
      .find({ company: profile, isActive: true })
      .lean()
    return data
  }

  async getById(id: string): Promise<PartnerDomain> {
    const partner = await PartnerRepository.getById(id)
    return partner
  }

  async deleteById({ id, user }: IDeleteByIdProps) {
    const partner = await PartnerRepository.getById(id)
    partner.isActive = false
    await PartnerRepository.updatePartner(partner)

    this.emitter(partner.company, `${this.modelName}:deleted`, partner.id)
    if (this.logService)
      await this.logService.add({
        docId: partner.id,
        coll: this.modelName,
        opType: 'delete',
        user,
        company: partner.company,
        body: JSON.stringify(partner.toObject()),
      })
    return partner
  }

  async addPlaceForTransferDocs(
    partnerId: string,
    place: ILoadingDockProps,
    user: string
  ) {
    const partner = await PartnerRepository.getById(partnerId)
    if (!partner)
      throw new BadRequestError(
        'partner:addPlaceForTransferDocs: partner not found'
      )

    const newPlace = new LoadingDock(place)
    partner.placesForTransferDocs.push(newPlace)
    await PartnerRepository.updatePartner(partner)

    await this.logService.add({
      docId: partner.id,
      coll: this.modelName,
      opType: 'add place for transfer documents',
      user,
      company: partner.company,
      body: JSON.stringify(newPlace),
    })

    this.emitter(
      partner.company,
      `${this.modelName}:updated`,
      partner.toObject()
    )
    return partner
  }

  async deletePlaceForTransferDocs(
    partnerId: string,
    placeId: string,
    user: string
  ) {
    const partner = await PartnerRepository.getById(partnerId)
    if (!partner)
      throw new BadRequestError(
        'partner:deletePlaceForTransferDocs: partner not found'
      )

    if (!placeId)
      throw new BadRequestError(
        'partner:deletePlaceForTransferDocs: placeId is not available'
      )

    partner.placesForTransferDocs = partner.placesForTransferDocs?.filter(
      (i) => i._id?.toString() !== placeId
    )

    await PartnerRepository.updatePartner(partner)

    if (this.logService)
      await this.logService.add({
        docId: partner.id,
        coll: this.modelName,
        opType: 'delete place for transfer documents',
        user,
        company: partner.company,
        body: JSON.stringify({ placeId }),
      })
    this.emitter(
      partner.company,
      `${this.modelName}:updated`,
      partner.toObject()
    )
    return partner
  }

  async updatePlaceForTransferDocs(
    partnerId: string,
    placeId: string,
    body: ILoadingDockProps,
    user: string
  ) {
    const partner = await PartnerRepository.getById(partnerId)

    if (!partner)
      throw new BadRequestError(
        'partner:updatePlaceForTransferDocs: partner not found'
      )

    if (!placeId)
      throw new BadRequestError(
        'partner:updatePlaceForTransferDocs: placeId is not available'
      )

    const idx = partner.placesForTransferDocs.findIndex(
      (i) => i?._id === placeId
    )
    if (idx === -1) return partner

    partner.placesForTransferDocs.splice(idx, 1, new LoadingDock(body))

    await PartnerRepository.updatePartner(partner)

    await this.logService.add({
      docId: partner.id,
      coll: this.modelName,
      opType: 'update place for transfer documents',
      user,
      company: partner.company,
      body: JSON.stringify({ place: body }),
    })
    this.emitter(
      partner.company,
      `${this.modelName}:updated`,
      partner.toObject()
    )
    return partner
  }

  async addIdleTruckNotification(
    partnerId: string,
    notification: IdleTruckNotification,
    userId: string
  ): Promise<PartnerDomain> {
    const partner: PartnerDomain = await PartnerRepository.getById(partnerId)
    partner.addIdleTruckNotify(notification)

    partner.events.forEach((event) => {
      bus.publish(event)
    })
    partner.clearEvents()

    await ChangeLogService.add({
      docId: partner.id,
      company: partner.company,
      coll: 'partner',
      user: userId,
      opType: 'addIdleTruckNotification',
      body: JSON.stringify(notification),
    })
    return partner
  }

  async updateIdleTruckNotify(
    partnerId: string,
    idleId: string,
    user: string,
    notify: IdleTruckNotification
  ): Promise<PartnerDomain> {
    const partner: PartnerDomain = await PartnerRepository.getById(partnerId)

    partner.updateIdleTruckNotify(idleId, notify)

    partner.events.forEach((event) => {
      bus.publish(event)
    })
    partner.clearEvents()

    await ChangeLogService.add({
      docId: partner.id,
      company: partner.company.toString(),
      coll: 'partner',
      user,
      opType: 'updateIdleTruckNotify',
      body: JSON.stringify(partner.toObject()),
    })
    return partner
  }

  async deleteIdleTruckNotify(partnerId: string, idleId: string, user: string) {
    const partner: PartnerDomain = await PartnerRepository.getById(partnerId)

    partner.deleteIdleTruckNotify(idleId)

    partner.events.forEach((event) => {
      bus.publish(event)
    })
    partner.clearEvents()

    await ChangeLogService.add({
      docId: partner.id,
      company: partner.company.toString(),
      coll: 'partner',
      user: user,
      opType: 'deleteIdleTruckNotify',
      body: JSON.stringify(partner.toObject()),
    })
    return partner
  }
}

export default new PartnerService({
  model: Partner,
  emitter: emitTo,
  modelName: 'partner',
  logService: ChangeLogService,
})
