import mongoose from 'mongoose'
import getAddressesLookupFragment from './fragments/getAddressesLookupFragment.js'
import getBaseSalaryTariffFragment from './fragments/getBaseSalaryTariffFragment.js'
import getDriverOrdersFragment from './fragments/getDriverOrdersFragment.js'

export default ({ company, period, driver }) => {
  const startPeriod = new Date(period[0])
  const endPeriod = new Date(period[1])

  const orderPeriodDate = {
    $getField: {
      field: 'plannedDate',
      input: {
        $first: '$route',
      },
    },
  }

  const firstMatcher = {
    $match: {
      company: mongoose.Types.ObjectId(company),
      isActive: true,
      $expr: {
        $and: [
          { $lt: [orderPeriodDate, endPeriod] },
          { $gte: [orderPeriodDate, startPeriod] },
          { $ne: [{ $ifNull: ['$confirmedCrew.driver', null] }, null] },
        ],
      },
    },
  }
  if (driver)
    firstMatcher.$match.$expr.$and.push({
      $eq: ['$confirmedCrew.driver', mongoose.Types.ObjectId(driver)],
    })

  const driverFilter = [
    {
      $lookup: {
        from: 'drivers',
        localField: 'confirmedCrew.driver',
        foreignField: '_id',
        as: '_driver',
      },
    },
    { $addFields: { _driver: { $first: '$_driver' } } },
    { $match: { '_driver.isCalcSalary': true, isActive: true } },
  ]

  const truckLookup = [
    {
      $lookup: {
        from: 'trucks',
        localField: 'confirmedCrew.truck',
        foreignField: '_id',
        as: '_truck',
      },
    },
    {
      $lookup: {
        from: 'trucks',
        localField: 'confirmedCrew.trailer',
        foreignField: '_id',
        as: '_trailer',
      },
    },
    {
      $addFields: {
        _truck: { $first: '$_truck' },
        _trailer: { $first: '$_trailer' },
      },
    },
  ]

  const addFields = [
    {
      $addFields: {
        _orderTKNameId: '$confirmedCrew.tkName',
        _orderPeriodDate: orderPeriodDate,
      },
    },
  ]

  const addressesLookup = getAddressesLookupFragment()

  const baseTariffs = getBaseSalaryTariffFragment(company)
  const driverOrdersDetailes = getDriverOrdersFragment()

  const group = [
    {
      $group: {
        _id: '$confirmedCrew.driver',
        payment: {
          $sum: '$paymentToDriver.sum',
        },
        // items: {
        //   $push: '$$ROOT._id',
        // },
        totalCount: {
          $count: {},
        },
        base: { $sum: '$_baseTariff.tariff.sum' },
        avgGrade: { $avg: '$grade.grade' },
      },
    },
    {
      $addFields: {
        avgGrade: { $round: ['$avgGrade', 2] },
      },
    },
    { $sort: { base: -1 } },
  ]

  const pipeline = [
    firstMatcher,
    ...driverFilter,
    ...truckLookup,
    ...addFields,
    ...addressesLookup,
    ...baseTariffs,
  ]

  if (driver) pipeline.push(...driverOrdersDetailes)
  else pipeline.push(...group)

  return pipeline
}
