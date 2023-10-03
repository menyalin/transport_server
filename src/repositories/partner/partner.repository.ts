import { EventBus } from 'ts-bus'
import {
  IPartnerWithIdProps,
  Partner as PartnerDomain,
} from '../../domain/partner/partner.domain'
import { UpdatePartnerEvent } from '../../domain/partner/domainEvents'
import { bus } from '../../eventBus'
import { BadRequestError } from '../../helpers/errors'
import { Partner as PartnerModel } from '../../models'

class PartnerRepository {
  partnerModel: typeof PartnerModel
  bus: EventBus
  constructor({
    partnerModel,
    bus,
  }: {
    partnerModel: typeof PartnerModel
    bus: EventBus
  }) {
    this.partnerModel = partnerModel
    this.bus = bus
    this.bus.subscribe(UpdatePartnerEvent, async ({ payload: partner }) => {
      try {
        await this.updatePartner(partner)
      } catch (e) {
        console.log(
          'PartnerRepository : bus.subscribe: UpdatePartnerEvent: error!'
        )
        console.log(e)
      }
    })
  }

  async updatePartner(partner: PartnerDomain) {
    if (partner.events.length) partner.clearEvents()
    await this.partnerModel.findByIdAndUpdate(partner.id, partner.toObject())
  }

  async getById(partnerId: string): Promise<PartnerDomain> {
    const partnerItem: IPartnerWithIdProps | null =
      await this.partnerModel.findById(partnerId)
    if (!partnerItem)
      throw new BadRequestError(
        `PartnerRepository : getById : partner ${partnerId} is missing`
      )
    return new PartnerDomain(partnerItem)
  }
}

export default new PartnerRepository({ partnerModel: PartnerModel, bus: bus })
