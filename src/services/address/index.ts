// @ts-nocheck
/* eslint-disable no-unused-vars */
import axios from 'axios'
import { ChangeLogService } from '../../services'
import { Address } from '../../models'
import { emitTo } from '../../socket'

const URL =
  'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address'

const dadataApi = axios.create()
axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.headers.post.Accept = 'application/json'
dadataApi.defaults.headers.common.Authorization =
  'Token ' + process.env.DADATA_API_KEY

class AddressService {
  _convertCoordinatesStr(str) {
    if (!str) return null
    return str.split(',').reverse()
  }

  async getSuggestions(query, userId) {
    const {
      data: { suggestions },
    } = await dadataApi.post(URL, { query })

    return suggestions
  }

  async create({ body, user }) {
    if (body.geo)
      body.geo = {
        type: 'Point',
        coordinates: this._convertCoordinatesStr(body.geo),
      }

    const newAddress = await Address.create(body)
    emitTo(newAddress.company.toString(), 'address:created', newAddress)
    await ChangeLogService.add({
      docId: newAddress._id.toString(),
      company: newAddress.company.toString(),
      user,
      coll: 'addresses',
      body: JSON.stringify(newAddress.toJSON()),
      opType: 'create',
    })
    return newAddress
  }

  async updateOne({ id, body, user }) {
    if (body.geo)
      body.geo = {
        type: 'Point',
        coordinates: this._convertCoordinatesStr(body.geo),
      }
    const address = await Address.findByIdAndUpdate(id, body, { new: true })
    emitTo(address.company.toString(), 'address:updated', address)
    await ChangeLogService.add({
      docId: address._id.toString(),
      company: address.company.toString(),
      user,
      coll: 'addresses',
      body: JSON.stringify(address.toJSON()),
      opType: 'update',
    })
    return address
  }

  async search(str, profile) {
    const res = await Address.find(
      {
        company: profile,
        isActive: true,
        $text: {
          $search: str,
          $language: 'russian',
        },
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(5)
    return res
  }

  async getByProfile(profile) {
    const addresses = await Address.find({
      isActive: true,
      company: profile,
    }).lean()
    const preparedAddresses = addresses.map((item) => ({
      ...item,
      geo: item.geo.coordinates.reverse().join(', '),
    }))
    return preparedAddresses
  }

  async getById(id) {
    const address = await Address.findById(id).lean()
    return address
  }

  async deleteById({ id, user }) {
    const address = await Address.findByIdAndUpdate(id, { isActive: false })
    emitTo(address.company.toString(), 'address:deleted', id)
    await ChangeLogService.add({
      docId: address._id.toString(),
      company: address.company.toString(),
      user,
      coll: 'addresses',
      body: JSON.stringify(address.toJSON()),
      opType: 'delete',
    })
    return address
  }
}

export default new AddressService()
