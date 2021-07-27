export const getProfileDocsSchema = {
  type: 'object',
  properties: {
    profile: {
      type: 'string'
    }
  },
  required: ['profile'],
  additionalProperties: false
}

export const createDocSchema = {
  type: 'object',
  properties: {
    truck: {
      type: 'string'
    },
    trailer: {
      type: ['string', 'null']
    },
    driver: {
      type: 'string'
    },
    driver2: {
      type: ['string', 'null']
    },
    startDate: {
      type: 'string',
      formats: ['date', 'date-time']
    },
    endDate: {
      type: ['string', 'null'],
      formats: ['date', 'date-time']
    },
    note: {
      type: ['string', 'null']
    },
    company: {
      type: 'string'
    }
  },
  required: ['truck', 'driver', 'startDate', 'company'],
  additionalProperties: false
}
//
