export const getProfileAddressesSchema = {
  type: 'object',
  properties: {
    profile: {
      type: 'string',
    },
  },
  required: ['profile'],
  additionalProperties: false,
}

export const getSuggestionsSchema = {
  type: 'object',
  properties: {
    address: {
      type: 'string',
    },
  },
  required: ['address'],
  additionalProperties: false,
}

export const createAddressSchema = {
  type: 'object',
  properties: {
    company: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    shortName: {
      type: ['string', 'null'],
    },
    note: {
      type: ['string', 'null'],
    },
    geo: {
      type: 'string',
    },
    label: {
      type: ['string', 'null'],
    },
    partner: {
      type: ['string', 'null'],
    },
    isShipmentPlace: {
      type: ['boolean', 'null'],
    },
    isDeliveryPlace: {
      type: ['boolean', 'null'],
    },
  },
  required: ['company', 'name'],
  additionalProperties: true,
}
//
