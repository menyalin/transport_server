// @ts-nocheck
export const getListSchema = {
  type: 'object',
  properties: {
    company: {
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

export const getOrderPrePriceSchema = {
  type: 'object',
  properties: {
    company: {
      type: 'string',
    },
    date: {
      type: 'string',
    },
    agreement: {
      type: 'string',
    },
    route: {
      type: 'array',
    },
  },
  required: ['company', 'date', 'agreement'],
  additionalProperties: true,
}
