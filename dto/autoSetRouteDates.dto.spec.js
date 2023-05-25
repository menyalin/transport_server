import { describe, it, expect } from '@jest/globals'
// import dayjs from 'dayjs'
import { parsePeriod, truckIdsValidator, AutoSetRouteDatesDTO } from './autoSetRouteDates.dto'
describe('autoSetRouteDates.dto', () => {
    it('parsedPeriod: should return sorted dates in ascending order', () => {
        const period = ['2023-05-25T21:00:00.000Z', '2023-05-24T21:00:00.000Z']
        const parsedPeriod = parsePeriod(period)
        expect(parsedPeriod[0]).toEqual(new Date(period[1]))
    })  
    it('parsedPeriod: should throw an error if period is not an array', () => {
      expect(() => parsePeriod('2023-05-24T12:00:00Z')).toThrow('AutoSetRouteDatesDTO: invalid params: period')
    })
  
    it('parsedPeriod: should throw an error if period length is not 2', () => {
      expect(() => parsePeriod(['2023-05-24T12:00:00Z', '2023-05-24T12:00:00Z', '2023-05-24T12:00:00Z'])).toThrow('AutoSetRouteDatesDTO: invalid params: period')
    })
  
    it('parsedPeriod: should throw an error if any of the dates are not valid', () => {
      const period = ['2023-05-24T12:00:00Z', 'invalid date']
      expect(() => parsePeriod(period)).toThrow('AutoSetRouteDatesDTO: invalid params: period dates not valid')
    })

    it('truckIdsValidator: should return null if truckIds is valid', () => {
      const truckIds = ['truck-1', 'truck-2']
      const result = truckIdsValidator(truckIds)
      expect(result).toBeNull()
    })
  
    it('truckIdsValidator: should throw an error if truckIds is not an array', () => {
      expect(() => truckIdsValidator('truck-1')).toThrow('AutoSetRouteDatesDTO: invalid params: truckIds')
    })
  
    it('truckIdsValidator: should throw an error if truckIds is an empty array', () => {
      expect(() => truckIdsValidator([])).toThrow('AutoSetRouteDatesDTO: invalid params: truckIds')
    })
  
    it('truckIdsValidator: should throw an error if any of the truckIds is not a string', () => {
      const truckIds = ['truck-1', 2]
      expect(() => truckIdsValidator(truckIds)).toThrow('AutoSetRouteDatesDTO: invalid params: truckIds not string')
    })
  
    it('AutoSetRouteDatesDTO: should create a new DTO', () => {
      expect(() => new AutoSetRouteDatesDTO({
        truckIds: ['truck-1'], 
        period: ['2023-05-25T21:00:00.000Z', '2023-05-24T21:00:00.000Z'], 
        tripDurationInMinutes: 30, 
        unloadingDurationInMinutes: 30
      })).toBeDefined()
    })

    it('AutoSetRouteDatesDTO: should`t throw error', () => {
      expect(() => new AutoSetRouteDatesDTO({
        truckIds: ['truck-1'], 
        period: ['2023-05-25T21:00:00.000Z', '2023-05-24T21:00:00.000Z'], 
        tripDurationInMinutes: 30, 
        unloadingDurationInMinutes: 30
      })).not.toThrow()
    })

    it('AutoSetRouteDatesDTO: Should throw an error due to invalid number', () => {
      expect(() => new AutoSetRouteDatesDTO({
        truckIds: ['truck-1'], 
        period: ['2023-05-25T21:00:00.000Z', '2023-05-24T21:00:00.000Z'], 
        tripDurationInMinutes: 'invalid number', 
        unloadingDurationInMinutes: 30,
      })).toThrow()
    })
    
        
})
    