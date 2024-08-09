import { DateRange } from '@/classes/dateRange'

export function truckIdsValidator(truckIds: string[]) {
  if (!Array.isArray(truckIds) || truckIds.length === 0)
    throw new Error('AutoSetRouteDatesDTO: invalid params: truckIds')
  if (truckIds.some((id) => typeof id !== 'string'))
    throw new Error('AutoSetRouteDatesDTO: invalid params: truckIds not string')
  return null
}

interface IProps {
  truckIds: string[]
  period: string[]
  tripDurationInMinutes: number
  unloadingDurationInMinutes: number
  operationToken: string
}

export class AutoSetRouteDatesDTO {
  operationToken: string
  truckIds: string[]
  period: DateRange
  tripDurationInMinutes: number
  unloadingDurationInMinutes: number

  constructor({
    truckIds,
    period,
    tripDurationInMinutes,
    unloadingDurationInMinutes,
    operationToken,
  }: IProps) {
    truckIdsValidator(truckIds)
    this.operationToken = operationToken
    this.truckIds = truckIds
    this.period = new DateRange(period[0] as string, period[1] as string)
    this.tripDurationInMinutes = tripDurationInMinutes
    this.unloadingDurationInMinutes = unloadingDurationInMinutes
  }

  toString() {
    return {
      truckIds: this.truckIds,
      period: this.period,
      tripDurationInMinutes: this.tripDurationInMinutes,
      unloadingDurationInMinutes: this.unloadingDurationInMinutes,
    }
  }
}
