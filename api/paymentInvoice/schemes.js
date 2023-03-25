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

export const addOrdersToInvoiceSchema = {
  type: 'object',
  properties: {
    orders: {
      type: 'array',
    },
    paymentInvoiceId: {
      type: 'string',
    },
  },
  required: ['orders', 'paymentInvoiceId'],
  additionalProperties: true,
}
