/* eslint-disable no-unused-vars */
import axios from 'axios'
import { Address } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'

const URL =
  'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address'

const dadataApi = axios.create()
axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.headers.post.Accept = 'application/json'
dadataApi.defaults.headers.common.Authorization =
  'Token ' + process.env.DADATA_API_KEY

class AddressService {
  _convertCoordinatesStr(str) {
    return str.split(',').reverse()
  }

  async getSuggestions(query, userId) {
    const {
      data: { suggestions }
    } = await dadataApi.post(URL, { query })

    return suggestions
  }

  async create(body) {
    const newAddress = await Address.create({
      company: body.company,
      shortName: body.shortName,
      note: body.note,
      name: body.name,
      geo: {
        type: 'Point',
        coordinates: this._convertCoordinatesStr(body.geo)
      },
      label: body.label,
      isShipmentPlace: body.isShipmentPlace,
      isDeliveryPlace: body.isDeliveryPlace
    })
    emitTo(newAddress.company.toString(), 'address:created', newAddress)
    return newAddress
  }

  async search(str) {
    const res = await Address.find(
      {
        $text: {
          $search: str,
          $language: 'russian'
        }
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(5)
    return res
  }

  async getByProfile(profile) {
    const addresses = await Address.find({ company: profile })
    return addresses
  }
}

export default new AddressService()
