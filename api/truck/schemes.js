export const getProfileTrucksSchema = {
  type: 'object',
  properties: {
    profile: {
      type: 'string'
    }
  },
  required: ['profile'],
  additionalProperties: false
}

export const createTruckSchema = {
  type: 'object',
  properties: {
    company: {
      type: 'string'
    },
    name: {
      type: 'string'
    },
    brand: {
      type: ['string', 'null']
    },
    model: {
      type: ['string', 'null']
    },
    issueYear: {
      type: ['string', 'null']
    },
    endServiceDate: {
      type: ['string', 'null'],
      formats: ['date', 'date-time']
    },
    startServiceDate: {
      type: ['string', 'null'],
      formats: ['date', 'date-time']
    },
    tkName: { type: ['string', 'null'] },
    regNum: { type: ['string', 'null'] },
    win: { type: ['string', 'null'] },
    sts: { type: ['string', 'null'] },
    stsDate: {
      type: ['string', 'null'],
      formats: ['date', 'date-time']
    },
    pts: { type: ['string', 'null'] },
    owner: { type: ['string', 'null'] },
    note: { type: ['string', 'null'] },
    volumeFuel: { type: ['number', 'null'] },
    volumeRef: { type: ['number', 'null'] },
    liftCapacity: {
      type: ['number', 'null'],
      message: 'не верный формат грузоподъемности'
    },
    pltCount: { type: ['number', 'null'] },
    type: {
      type: 'string'
    }
  },
  required: ['company', 'name', 'type'],
  additionalProperties: true
}
//