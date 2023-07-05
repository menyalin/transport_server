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

export const getForOrderSchema = {
  type: 'object',
  properties: {
    company: {
      type: 'string',
    },
    date: {
      type: 'string',
    },
    client: {
      type: 'string',
    },
    tkNameId: {
      type: 'string',
    },
  },
  required: ['company', 'date'],
  additionalProperties: true,
}
