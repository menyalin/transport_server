// @ts-nocheck
import { BadRequestError } from '../../helpers/errors'
import { Partner } from '../../models'
import { emitTo } from '../../socket'
import IService from '../iService'
import ChangeLogService from '../changeLog'
import { IdleTruckNotify } from '../../domain/partner/idleTruckNotify'
import { Partner as PartnerDomain } from '../../domain/partner/partner.domain'
import PartnerRepository from '../../repositories/partner/partner.repository'
import { bus } from '../../eventBus'

class PartnerService extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
  }

  async addPlaceForTransferDocs(partnerId, place, user) {
    const partner = await this.model.findById(partnerId)
    if (!partner)
      throw new BadRequestError(
        'partner:addPlaceForTransferDocs: partner not found'
      )

    partner.placesForTransferDocs.push(place)
    await partner.save()

    if (this.logService)
      await this.logService.add({
        docId: partner._id.toString(),
        coll: this.modelName,
        opType: 'add place for transfer documents',
        user,
        company: partner.company.toString(),
        body: JSON.stringify(place),
      })
    this.emitter(
      partner.company.toString(),
      `${this.modelName}:updated`,
      partner
    )
    return partner
  }

  async deletePlaceForTransferDocs(partnerId, placeId, user) {
    const partner = await this.model.findById(partnerId)
    if (!partner)
      throw new BadRequestError(
        'partner:deletePlaceForTransferDocs: partner not found'
      )

    if (!placeId)
      throw new BadRequestError(
        'partner:deletePlaceForTransferDocs: placeId is not available'
      )

    partner.placesForTransferDocs = partner.placesForTransferDocs.filter(
      (i) => i._id.toString() !== placeId
    )

    await partner.save()

    if (this.logService)
      await this.logService.add({
        docId: partner._id.toString(),
        coll: this.modelName,
        opType: 'delete place for transfer documents',
        user,
        company: partner.company.toString(),
        body: JSON.stringify({ placeId }),
      })
    this.emitter(
      partner.company.toString(),
      `${this.modelName}:updated`,
      partner
    )
    return partner
  }

  async updatePlaceForTransferDocs(partnerId, placeId, body, user) {
    const partner = await this.model.findById(partnerId)
    if (!partner)
      throw new BadRequestError(
        'partner:updatePlaceForTransferDocs: partner not found'
      )

    if (!placeId)
      throw new BadRequestError(
        'partner:updatePlaceForTransferDocs: placeId is not available'
      )

    const idx = partner.placesForTransferDocs.findIndex(
      (i) => i._id.toString() === placeId
    )
    if (idx === -1) return partner

    partner.placesForTransferDocs.splice(idx, 1, body)

    await partner.save()

    if (this.logService)
      await this.logService.add({
        docId: partner._id.toString(),
        coll: this.modelName,
        opType: 'update place for transfer documents',
        user,
        company: partner.company.toString(),
        body: JSON.stringify({ place: body }),
      })
    this.emitter(
      partner.company.toString(),
      `${this.modelName}:updated`,
      partner
    )
    return partner
  }

  async addIdleTruckNotify(
    partnerId: string,
    notify: IdleTruckNotify,
    userId: string
  ): Promise<PartnerDomain> {
    const partner: PartnerDomain = await PartnerRepository.getById(partnerId)

    partner.addIdleTruckNotify(notify)

    partner.events.forEach((event) => {
      bus.publish(event)
    })
    partner.clearEvents()

    await ChangeLogService.add({
      docId: partner.id,
      company: partner.company.toString(),
      coll: 'partner',
      user: userId,
      opType: 'addIdleTruckNotify',
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
