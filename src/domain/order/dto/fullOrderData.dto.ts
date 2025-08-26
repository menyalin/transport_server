import { z } from 'zod'

const schema = z.object({
  _id: z.string(),
  orderNum: z.string().optional(),
  routeAddressesString: z.string(),
  companyName: z.string(),
  plannedDate: z.string(),
  fullDriverName: z.string(),
  shortDriverName: z.string(),
  driverPhones: z.string(),
  truckBrand: z.string().nullable().optional().default(''),
  truckNum: z.string(),
  trailerNum: z.string().optional(),
  addresses: z.array(z.unknown()),
  loadingAddresses: z.array(z.unknown()),
  unloadingAddresses: z.array(z.unknown()),
  note: z.string().optional().nullable(),
})

const getDriverFullName = (driver: any): string =>
  `${driver.surname} ${driver.name} ${driver.patronymic}`.trim()

const getShortDriverName = (driver: any): string =>
  `${driver.surname ?? ''} ${driver.name[0] ?? ''}.${driver?.patronymic[0] ?? ''}.`.trim()

const getDriverPhones = (driver: any): string =>
  `${driver.phone}${!!driver.phone2 ? ', ' + driver.phone2 : ''}`.trim()

const getAddressesString = (route: any[], addresses: any[]): string =>
  route
    ?.map((point) => {
      const adrs = addresses.find(
        (i) => i._id.toString() === point.address.toString()
      )
      return adrs?.shortName || ''
    })
    .join(' - ')

export class FullOrderDataDTO {
  _id: string
  orderNum?: string
  routeAddressesString: string
  companyName: string
  plannedDate: string
  fullDriverName: string
  shortDriverName: string
  driverPhones: string
  truckNum: string
  truckBrand: string | null = ''
  trailerNum?: string
  addresses: any[]
  loadingAddresses: any[]
  unloadingAddresses: any[]
  note?: string | null

  private constructor(
    props: Omit<FullOrderDataDTO, 'fullAddressesRouteString'>
  ) {
    this._id = props._id
    this.orderNum = props.orderNum
    this.routeAddressesString = props.routeAddressesString // дописать
    this.companyName = props.companyName
    this.plannedDate = props.plannedDate
    this.fullDriverName = props.fullDriverName
    this.shortDriverName = props.shortDriverName
    this.driverPhones = props.driverPhones
    this.truckBrand = props.truckBrand || ''
    this.truckNum = props.truckNum || ''
    this.trailerNum = props.trailerNum
    this.addresses = props.addresses
    this.loadingAddresses = props.loadingAddresses
    this.unloadingAddresses = props.unloadingAddresses
    this.note = props.note
  }

  get fullAddressesRouteString(): string {
    const loadingAddresses = this.loadingAddresses
      .map((i: any) => i.name)
      .join(', ')

    const unloadingAddresses = this.unloadingAddresses
      .map((i: any) => i.name)
      .join(', ')
    return `${loadingAddresses} - ${unloadingAddresses}`
  }

  static create(p: any): any {
    const inputdata = {
      _id: p._id?.toString(),
      orderNum: p?.orderNum || '',
      routeAddressesString: getAddressesString(p.route, p.addresses),
      companyName: p.companyName,
      plannedDate: new Date(p.plannedDate).toLocaleString('ru'),
      fullDriverName: getDriverFullName(p.driver),
      shortDriverName: getShortDriverName(p.driver),
      driverPhones: getDriverPhones(p.driver),
      truckBrand: p.truck?.brand || '',
      truckNum: p.truck?.regNum,
      trailerNum: p.trailer?.regNum,
      addresses: p.addresses,
      loadingAddresses: p.loadingAddresses,
      unloadingAddresses: p.unloadingAddresses,
      note: p.note,
    }

    return new FullOrderDataDTO(schema.parse(inputdata))
  }
}
