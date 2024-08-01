import { RoutePoint } from '@/values/order/routePoint'
import { Address as AddressModel, Zone as ZoneModel } from '@/models'
import { TtlMap } from '@/utils/ttlMap'
import { AddressZone } from '@/domain/address'

interface ConstructorProps {
  addressModel: typeof AddressModel
}

class AddressRepository {
  addressModel: typeof AddressModel
  _zonesMap: TtlMap<string, string[]>

  constructor(p: ConstructorProps) {
    this._zonesMap = new TtlMap<string, string[]>(5 * 60 * 1000)
    this.addressModel = p.addressModel
  }

  async getPointsZones(points: RoutePoint[]): Promise<string[]> {
    const addresses = points.map((i) => i.address)
    const zones: string[] = []

    if (addresses.every((a) => this._zonesMap.has(a))) {
      addresses.forEach((i) => {
        zones.push(...(this._zonesMap.get(i) as string[]))
      })
      return zones
    }

    const addressDocs = await AddressModel.find({
      _id: { $in: addresses },
    })

    if (!addressDocs.length)
      throw new Error('AddressRepository : getPointsZones : address not found')

    addressDocs.forEach((doc) => {
      const tmpZonesStrings: string[] = doc.zones.map((i) => i.toString())
      this._zonesMap.set(doc._id.toString(), tmpZonesStrings)
      zones.push(...tmpZonesStrings)
    })
    return zones
  }

  async getZonesByIds(zoneIds: string[]): Promise<AddressZone[]> {
    const zones = await ZoneModel.find<AddressZone>({
      _id: { $in: zoneIds },
    }).lean()
    return zones.map((i) => new AddressZone(i))
  }
}

export default new AddressRepository({ addressModel: AddressModel })
