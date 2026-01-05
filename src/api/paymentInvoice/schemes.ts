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

export const getAllowedPFSchema = {
  type: 'object',
  properties: {
    agreement: {
      type: 'string',
    },
    client: {
      type: 'string',
    },
  },
  required: ['agreement', 'client'],
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

export const getInvoiceOrdersSchema = {
  type: 'object',
  properties: {
    limit: { type: 'string' },
    skip: { type: 'string' },
  },
  additionalProperties: true,
}
