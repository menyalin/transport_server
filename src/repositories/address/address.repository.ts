import { RoutePoint } from '@/values/order/routePoint'
import { Address as AddressModel } from '@/models'
import { TtlMap } from '@/utils/ttlMap'

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
}
export default new AddressRepository({ addressModel: AddressModel })
