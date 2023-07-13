// @ts-nocheck
/*
    calcWaitingByArrivalDateLoading: { type: Boolean, default: false },
    calcWaitingByArrivalDateUnloading: { type: Boolean, default: false },
    noWaitingPaymentForAreLateLoading: { type: Boolean, default: false },
    noWaitingPaymentForAreLateUnloading: { type: Boolean, default: false },

*/
const getAgreementField = (pointType) => {
  return pointType === 'loading'
    ? '$_clientAgreement.calcWaitingByArrivalDateLoading'
    : '$_clientAgreement.calcWaitingByArrivalDateUnloading'
}

// количество минут по фактическому времени
const actualTimeDiff = () => ({
  $dateDiff: {
    startDate: {
      $ifNull: ['$$this.arrivalDateDoc', '$$this.arrivalDate'],
    },
    endDate: {
      $ifNull: ['$$this.departureDateDoc', '$$this.departureDate'],
    },
    unit: 'minute',
  },
})

//  минут между планом прибытия и фактом убытия
const timeDiff = () => ({
  $dateDiff: {
    startDate: {
      $ifNull: [
        '$$this.plannedDateDoc',
        '$$this.plannedDate',
        '$$this.arrivalDateDoc',
        '$$this.arrivalDate',
      ],
    },
    endDate: {
      $ifNull: ['$$this.departureDateDoc', '$$this.departureDate'],
    },
    unit: 'minute',
  },
})

// если есть опоздание  и запрет оплаты при опоздании
const noPaymentForAreLateCondition = (pointType) => ({
  $and: [
    {
      eq: [
        pointType === 'loading'
          ? '$_clientAgreement.noWaitingPaymentForAreLateLoading'
          : '$_clientAgreement.noWaitingPaymentForAreLateUnloading',
        true,
      ],
    },
    {
      $ne: [
        { $ifNull: ['$$this.plannedDateDoc', '$$this.plannedDate', null] },
        null,
      ],
    },
    {
      $gt: [
        { $ifNull: ['$$this.arrivalDateDoc', '$$this.arrivalDate'] },
        { $ifNull: ['$$this.plannedDateDoc', '$$this.plannedDate'] },
      ],
    },
  ],
})

// если приехали во время и нет оплаты по факту прибытия
const inTimeArrivalCond = () => ({
  $and: [
    {
      $ne: [
        { $ifNull: ['$$this.plannedDateDoc', '$$this.plannedDate', null] },
        null,
      ],
    },
    {
      $lte: [
        { $ifNull: ['$$this.arrivalDateDoc', '$$this.arrivalDate'] },
        { $ifNull: ['$$this.plannedDateDoc', '$$this.plannedDate'] },
      ],
    },
  ],
})

// если расчет простоя по фактическому времени или опоздание без запрета оплаты
const actualTimeCond = (pointType) => ({
  $or: [
    { $eq: [getAgreementField(pointType), true] },
    {
      $eq: [
        { $ifNull: ['$$this.plannedDateDoc', '$$this.plannedDate', null] },
        null,
      ],
    },
  ],
})

export const getDurutationInPoints = (pointType) => {
  if (!['loading', 'unloading'].includes(pointType))
    throw new Error('getWaitingSalaryTariffFragment: unexpected pointType')
  return {
    $filter: {
      input: {
        $map: {
          input: {
            $filter: {
              input: '$route',
              as: 'point',
              cond: { $eq: ['$$point.type', pointType] },
            },
          },
          in: {
            $switch: {
              branches: [
                { case: noPaymentForAreLateCondition(pointType), then: 0 }, // если запрет оплаты простоя при опоздании и есть опоздание
                { case: actualTimeCond(pointType), then: actualTimeDiff() }, // если расчет простоя по фактическому времени или опоздание без запрета оплаты
                { case: inTimeArrivalCond(), then: timeDiff() }, // если нет опоздания
              ],
              default: 0,
            },
          },
        },
      },
      cond: { gt: ['$$this', 0] },
    },
  }
}
