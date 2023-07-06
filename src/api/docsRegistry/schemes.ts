// @ts-nocheck
export const getListSchema = {
  type: 'object',
  properties: {
    limit: {
      type: 'string',
    },
    skip: {
      type: 'string',
    },
  },
  required: ['limit', 'skip'],
  additionalProperties: true,
}

export const addOrdersToRegistrySchema = {
  type: 'object',
  properties: {
    orders: {
      type: 'array',
    },
    docsRegistryId: {
      type: 'string',
    },
  },
  required: ['orders', 'docsRegistryId'],
  additionalProperties: true,
}
