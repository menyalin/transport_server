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
    }
  },
  required: ['company', 'name'],
  additionalProperties: false
}
//
