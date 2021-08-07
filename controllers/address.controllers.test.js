/* eslint-disable no-undef */
import { getById } from './address.controllers.js'
import { AddressService } from '../services/index.js'
import httpMocks from 'node-mocks-http'
import { describe } from '@jest/globals'

// const mockAddress = {}

AddressService.getById = jest.fn()

describe('Тестирование address controllers', () => {
  it('Контроллер getById является функцией', () => {
    expect(typeof getById).toBe('function')
  })
  it('Вызов метода getById в AddressService', async () => {
    const req = httpMocks.createRequest()
    const res = httpMocks.createResponse()
    await getById(req, res)
    expect(AddressService.getById).toBeCalled()
  })
})

