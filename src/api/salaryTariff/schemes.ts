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

export const getDriverSalarySchema = {
  type: 'object',
  properties: {
    company: {
      type: 'string',
    },
  },
  required: ['company'],
  additionalProperties: true,
}

export const driversSalaryReportSchema = {
  type: 'object',
  properties: {
    company: {
      type: 'string',
    },
  },
  required: ['company'],
  additionalProperties: true,
}
