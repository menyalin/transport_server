export const createSchema = {
  type: 'object',
  properties: {
    company: {
      type: 'string'
    },
    startPositionDate: {
      type: ['string', 'null'],
      formats: ['date', 'date-time']
    }
  },
  required: ['company', 'startPositionDate'],
  additionalProperties: true
}

export const getListForScheduleSchema = {
  type: 'object',
  properties: {
    profile: {
      type: 'string'
    },
    startDate: {
      type: ['string', 'null'],
      formats: ['date', 'date-time']
    },
    endDate: {
      type: ['string', 'null'],
      formats: ['date', 'date-time']
    }
  },
  required: ['profile', 'startDate'],
  additionalProperties: true
}

export const getListSchema = {
  type: 'object',
  properties: {
    profile: {
      type: 'string'
    },
    startDate: {
      type: ['string', 'null'],
      formats: ['date', 'date-time']
    },
    endDate: {
      type: ['string', 'null'],
      formats: ['date', 'date-time']
    },
    skip: {
      type: 'string'
    },
    limit: {
      type: 'string'
    }
  },
  required: ['profile', 'startDate', 'endDate', 'skip', 'limit'],
  additionalProperties: true
}
