import { describe, it, expect } from '@jest/globals'

import {
  truckIdsValidator,
  AutoSetRouteDatesDTO,
} from './autoSetRouteDates.dto'
describe('autoSetRouteDates.dto', () => {
  it('truckIdsValidator: should return null if truckIds is valid', () => {
    const truckIds = ['truck-1', 'truck-2']
    const result = truckIdsValidator(truckIds)
    expect(result).toBeNull()
  })

  it('truckIdsValidator: should throw an error if truckIds is not an array', () => {
    expect(() => truckIdsValidator('truck-1' as any)).toThrow(
      'AutoSetRouteDatesDTO: invalid params: truckIds'
    )
  })

  it('truckIdsValidator: should throw an error if truckIds is an empty array', () => {
    expect(() => truckIdsValidator([])).toThrow(
      'AutoSetRouteDatesDTO: invalid params: truckIds'
    )
  })

  it('truckIdsValidator: should throw an error if any of the truckIds is not a string', () => {
    const truckIds = ['truck-1', 2]
    expect(() => truckIdsValidator(truckIds as any)).toThrow(
      'AutoSetRouteDatesDTO: invalid params: truckIds not string'
    )
  })

  it('AutoSetRouteDatesDTO: should create a new DTO', () => {
    expect(
      () =>
        new AutoSetRouteDatesDTO({
          truckIds: ['truck-1'],
          period: ['2023-05-25T21:00:00.000Z', '2023-05-24T21:00:00.000Z'],
          tripDurationInMinutes: 30,
          unloadingDurationInMinutes: 30,
        } as any)
    ).toBeDefined()
  })

  it('AutoSetRouteDatesDTO: should`t throw error', () => {
    expect(
      () =>
        new AutoSetRouteDatesDTO({
          truckIds: ['truck-1'],
          period: ['2023-05-25T21:00:00.000Z', '2023-05-24T21:00:00.000Z'],
          tripDurationInMinutes: 30,
          unloadingDurationInMinutes: 30,
        } as any)
    ).not.toThrow()
  })
})
