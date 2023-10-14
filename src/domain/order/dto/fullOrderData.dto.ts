import { z } from 'zod'

const schema = z.object({
  _id: z.string(),
  orderNum: z.string().optional(),
  routeAddressesString: z.string(),
  companyName: z.string(),
  plannedDate: z.string(),
  fullDriverName: z.string(),
  driverPhones: z.string(),
  truckBrand: z.string(),
  truckNum: z.string(),
  trailerNum: z.string().optional(),
})

const getDriverFullName = (driver: any): string =>
  `${driver.surname} ${driver.name} ${driver.patronymic}`.trim()

const getDriverPhones = (driver: any): string =>
  `${driver.phone}${!!driver.phone2 ? ', ' + driver.phone2 : ''}`.trim()

const getAddressesString = (route: any[], addresses: any[]): string =>
  route
    .map((point) => {
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
  driverPhones: string
  truckNum: string
  truckBrand: string
  trailerNum?: string

  private constructor(props: FullOrderDataDTO) {
    this._id = props._id
    this.orderNum = props.orderNum
    this.routeAddressesString = props.routeAddressesString // дописать
    this.companyName = props.companyName
    this.plannedDate = props.plannedDate
    this.fullDriverName = props.fullDriverName
    this.driverPhones = props.driverPhones
    this.truckBrand = props.truckBrand
    this.truckNum = props.truckNum || ''
    this.trailerNum = props.trailerNum
  }

  static create(p: any): any {
    const inputdata = {
      _id: p._id?.toString(),
      orderNum: p?.orderNum || '',
      routeAddressesString: getAddressesString(p.route, p.addresses),
      companyName: p.companyName,
      plannedDate: new Date(p.plannedDate).toLocaleString('ru'),
      fullDriverName: getDriverFullName(p.driver),
      driverPhones: getDriverPhones(p.driver),
      truckBrand: p.truck?.brand,
      truckNum: p.truck?.regNum,
      trailerNum: p.trailer?.regNum,
    }

    return new FullOrderDataDTO(schema.parse(inputdata))
  }
}
