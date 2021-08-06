/* eslint-disable no-undef */
import { getById } from './address.controllers'

describe('Тестирование address controllers', () => {
  it('Контроллер является функцией', () => {
    expect(typeof getById).toBe('function')
  })
})
