import dayjs from 'dayjs'

export function truckIdsValidator(truckIds) {
  if (!Array.isArray(truckIds) || truckIds.length === 0)
    throw new Error('AutoSetRouteDatesDTO: invalid params: truckIds')
  if (truckIds.some((id) => typeof id !== 'string'))
    throw new Error('AutoSetRouteDatesDTO: invalid params: truckIds not string')
  return null
}

export function parsePeriod(period) {
  if (!Array.isArray(period) || period.length !== 2)
    throw new Error('AutoSetRouteDatesDTO: invalid params: period')
  if (period.some((date) => !dayjs(date).isValid()))
    throw new Error(
      'AutoSetRouteDatesDTO: invalid params: period dates not valid'
    )
  return period.map((p) => new Date(p)).sort((a, b) => a - b)
}

export class AutoSetRouteDatesDTO {
  constructor({
    truckIds,
    period,
    tripDurationInMinutes,
    unloadingDurationInMinutes,
    operationToken,
  }) {
    truckIdsValidator(truckIds)
    this.operationToken = operationToken
    this._truckIds = truckIds
    this._period = parsePeriod(period)
    if (
      Number.isNaN(Number.parseInt(tripDurationInMinutes)) ||
      Number.isNaN(Number.parseInt(unloadingDurationInMinutes))
    )
      throw new Error('AutoSetRouteDatesDTO: invalid params: duration is NaN')
    this._tripDurationInMinutes = Number.parseInt(tripDurationInMinutes)
    this._unloadingDurationInMinutes = Number.parseInt(
      unloadingDurationInMinutes
    )
  }

  get truckIds() {
    return this._truckIds
  }

  get period() {
    return this._period
  }

  get tripDurationInMinutes() {
    return this._tripDurationInMinutes
  }

  get unloadingDurationInMinutes() {
    return this._unloadingDurationInMinutes
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
