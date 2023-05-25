export const createSchema = {
  type: 'object',
  properties: {
    company: {
      type: 'string',
    },
    startPositionDate: {
      type: ['string', 'null'],
      formats: ['date', 'date-time'],
    },
  },
  required: ['company', 'startPositionDate'],
  additionalProperties: true,
}

export const getListForScheduleSchema = {
  type: 'object',
  properties: {
    profile: {
      type: 'string',
    },
    startDate: {
      type: ['string', 'null'],
      formats: ['date', 'date-time'],
    },
    endDate: {
      type: ['string', 'null'],
      formats: ['date', 'date-time'],
    },
  },
  required: ['profile', 'startDate'],
  additionalProperties: true,
}

export const getListSchema = {
  type: 'object',
  properties: {
    profile: {
      type: 'string',
    },
    startDate: {
      type: ['string', 'null'],
      formats: ['date', 'date-time'],
    },
    endDate: {
      type: ['string', 'null'],
      formats: ['date', 'date-time'],
    },
    skip: {
      type: 'string',
    },
    limit: {
      type: 'string',
    },
  },
  required: ['profile', 'startDate', 'endDate', 'skip', 'limit'],
  additionalProperties: true,
}

export const saveFinalPricesSchema = {
  type: 'object',
  properties: {
    company: {
      type: 'string',
    },
    orderId: {
      type: 'string',
    },
    finalPrices: {
      type: 'array',
    },
  },
  required: ['company', 'orderId', 'finalPrices'],
  additionalProperties: true,
}

export const setDocsSchema = {
  type: 'object',
  properties: {
    docs: {
      type: 'array',
    },
  },
  required: ['docs'],
  additionalProperties: false,
}

export const setDocsStateSchema = {
  type: 'object',
  properties: {
    state: {
      type: 'boolean',
    },
  },
  required: ['state'],
  additionalProperties: false,
}

export const autoSetRouteDatesSchema = {
  type: 'object',
  properties: {
    truckIds:  { type: 'array' }, 
    period: { type: 'array' }, 
    tripDurationInMinutes: {type: 'number'}, 
    unloadingDurationInMinutes: { type: 'number'}
  },
  required: ['truckIds', 'period', 'tripDurationInMinutes', 'unloadingDurationInMinutes' ],
  additionalProperties: false,
}
