// @ts-nocheck
export const getListSchema = {
  type: 'object',
  properties: {
    company: {
      type: 'string',
    },
    startDate: {
      type: 'string',
    },
    endDate: {
      type: 'string',
    },
    limit: {
      type: 'string',
    },
    skip: {
      type: 'string',
    },
  },
  required: ['company', 'limit', 'skip'],
  additionalProperties: true,
}

export const getListForSchedule = {
  type: 'object',
  properties: {
    company: {
      type: 'string',
    },
    startDate: {
      type: 'string',
    },
    endDate: {
      type: 'string',
    },
  },
  required: ['company', 'startDate', 'endDate'],
  additionalProperties: true,
}
