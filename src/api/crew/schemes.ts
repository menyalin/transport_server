export const getListSchema = {
  type: 'object',
  properties: {
    profile: {
      type: 'string',
    },
    limit: {
      type: 'string',
    },
    skip: {
      type: 'string',
    },
  },
  required: ['profile', 'limit', 'skip'],
  additionalProperties: true,
}

export const getByDriverScheme = {
  type: 'object',
  properties: {
    driver: {
      type: 'string',
    },
    date: {
      type: ['string', 'null'],
    },
  },
  required: ['driver'],
  additionalProperties: true,
}

export const getByTruckScheme = {
  type: 'object',
  properties: {
    truck: {
      type: 'string',
    },
    date: {
      type: ['string', 'null'],
    },
  },
  required: ['truck'],
  additionalProperties: true,
}

export const getActualCrewsSchema = {
  type: 'object',
  properties: {
    profile: {
      type: 'string',
    },
  },
  required: ['profile'],
  additionalProperties: true,
}

export const createDocSchema = {
  type: 'object',
  properties: {
    tkName: {
      type: 'string',
    },
    transport: {
      type: 'array',
    },
    driver: {
      type: 'string',
    },
    startDate: {
      type: 'string',
      // formats: ['date', 'date-time'],
    },
    endDate: {
      type: ['string', 'null'],
      // formats: ['date', 'date-time'],
    },
    note: {
      type: ['string', 'null'],
    },
    company: {
      type: 'string',
    },
  },
  additionalProperties: true,
}

export const closeCrewSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
    },
    endDate: {
      type: 'string',
      // formats: ['date', 'date-time'],
    },
  },
  required: ['type', 'endDate'],
  additionalProperties: true,
}
