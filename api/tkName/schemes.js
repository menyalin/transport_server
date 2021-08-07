export const getProfileListSchema = {
  type: 'object',
  properties: {
    profile: {
      type: 'string'
    }
  },
  required: ['profile'],
  additionalProperties: false
}

export const createSchema = {
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
  additionalProperties: true
}
//
