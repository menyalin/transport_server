export const getProfileDriversSchema = {
  type: 'object',
  properties: {
    profile: {
      type: 'string'
    }
  },
  required: ['profile'],
  additionalProperties: false
}

export const createDriverSchema = {
  type: 'object',
  properties: {
    company: {
      type: 'string'
    },
    name: {
      type: 'string'
    },
    birthday: {
      type: ['string', 'null'],
      formats: ['date', 'date-time']
    },
    phone: {
      type: ['string', 'null']
    }
  },
  required: ['company', 'name'],
  additionalProperties: false
}
//
