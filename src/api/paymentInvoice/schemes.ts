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

export const addOrdersToInvoiceSchema = {
  type: 'object',
  properties: {
    orders: {
      type: 'array',
    },
    rowIds: {
      type: 'array',
    },
    paymentInvoiceId: {
      type: 'string',
    },
  },
  required: ['paymentInvoiceId'],
  additionalProperties: true,
}

export const downloadDocsSchema = {
  type: 'object',
  properties: {
    templateName: { type: 'string' },
  },
  required: ['templateName'],
  additionalProperties: true,
}
