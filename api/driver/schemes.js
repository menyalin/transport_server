export const getProfileDriversSchema = {
  type: 'object',
  properties: {
    profile: {
      type: 'string'
    }
  },
  required: ['profile'],
  additionalProperties: false
}

export const createDriverSchema = {
  type: 'object',
  properties: {
    company: {
      type: 'string'
    },
    surname: {
      type: ['string', 'null']
    },
    name: {
      type: ['string', 'null']
    },
    patronymic: {
      type: ['string', 'null']
    },
    tkName: {
      type: ['string', 'null']
    },
    passportId: {
      type: ['string', 'null']
    },
    passportIssued: {
      type: ['string', 'null']
    },
    passportDate: {
      type: ['string', 'null'],
      formats: ['date', 'date-time']
    },
    licenseId: {
      type: 'string'
    },
    licenseDate: {
      type: ['string', 'null'],
      formats: ['date', 'date-time']
    },
    licenseCategory: {
      type: ['string', 'null']
    },
    driverCardId: {
      type: ['string', 'null']
    },
    driverCardPeriod: {
      type: ['string', 'null'],
      formats: ['date', 'date-time']
    },
    hasScans: { type: 'boolean' },
    employmentDate: {
      type: ['string', 'null'],
      formats: ['date', 'date-time']
    },
    dismissalDate: {
      type: ['string', 'null'],
      formats: ['date', 'date-time']
    },
    recommender: { type: ['string', 'null'] },

    birthday: {
      type: ['string', 'null'],
      formats: ['date', 'date-time']
    },
    phone: {
      type: ['string', 'null']
    },
    phone2: {
      type: ['string', 'null']
    }
  },
  required: ['company', 'surname'],
  additionalProperties: false
}
//
