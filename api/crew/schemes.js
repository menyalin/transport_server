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

export const getActualCrewsSchema = {
  type: 'object',
  properties: {
    profile: {
      type: 'string'
    },
    date: {
      type: 'string',
      formats: ['date', 'date-time']
    }
  },
  required: ['profile', 'date'],
  additionalProperties: false
}

export const createDocSchema = {
  type: 'object',
  properties: {
    tkName: {
      type: 'string'
    },
    truck: {
      type: 'string'
    },
    trailer: {
      type: ['string', 'null']
    },
    driver: {
      type: 'string'
    },
    startDate: {
      type: 'string',
      formats: ['date', 'date-time']
    },
    note: {
      type: ['string', 'null']
    },
    company: {
      type: 'string'
    }
  },
  required: ['tkName', 'truck', 'driver', 'startDate', 'company'],
  additionalProperties: false
}
//
