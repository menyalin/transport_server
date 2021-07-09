export const getProfileTrucksSchema = {
  type: 'object',
  properties: {
    profile: {
      type: 'string'
    }
  },
  required: ['profile'],
  additionalProperties: false
}

export const createTruckSchema = {
  type: 'object',
  properties: {
    company: {
      type: 'string'
    },
    name: {
      type: 'string'
    },
    model: {
      type: 'string'
    },
    type: {
      type: 'string'
    }
  },
  required: ['company', 'name', 'type'],
  additionalProperties: true
}
//
