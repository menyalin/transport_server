/* eslint-disable no-unused-vars */
import axios from 'axios'

const URL =
  'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address'

const dadataApi = axios.create()
axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.headers.post.Accept = 'application/json'
dadataApi.defaults.headers.common.Authorization =
  'Token ' + process.env.DADATA_API_KEY

class AddressService {
  async getSuggestions(query, userId) {
    const {
      data: { suggestions }
    } = await dadataApi.post(URL, { query })
    return suggestions
  }
}

export default new AddressService()
