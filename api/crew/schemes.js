export const getListSchema = {
  type: 'object',
  properties: {
    profile: {
      type: 'string'
    },
    limit: {
      type: 'string'
    },
    skip: {
      type: 'string'
    }
  },
  required: ['profile', 'limit', 'skip'],
  additionalProperties: true
}

export const getByDriverScheme = {
  type: 'object',
  properties: {
    driver: {
      type: 'string'
    },
    date: {
      type: ['string', 'null']
    }
  },
  required: ['driver'],
  additionalProperties: false
}

export const getByTruckScheme = {
  type: 'object',
  properties: {
    truck: {
      type: 'string'
    },
    date: {
      type: ['string', 'null']
    }
  },
  required: ['truck'],
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
    transport: {
      type: 'array'
    },
    driver: {
      type: 'string'
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
  additionalProperties: false
}

export const closeCrewSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string'
    },
    endDate: {
      type: 'string',
      formats: ['date', 'date-time']
    }
  },
  required: ['type', 'endDate'],
  additionalProperties: false
}
