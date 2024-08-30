import mongoose, { PipelineStage } from 'mongoose'
import getAddressesLookupFragment from './fragments/getAddressesLookupFragment'
import getBaseSalaryTariffFragment from './fragments/getBaseSalaryTariffFragment'
import getDriverOrdersFragment from './fragments/getDriverOrdersFragment'
import getWaitingSalaryTariffFragment from './fragments/getWaitingSalaryTariffFragment'
import getReturnSalaryTariff from './fragments/getReturnSalaryTariff'
import getAdditionalPointsTariff from './fragments/getAdditionPointsSalaryTariff'
import { DateRange } from '@/classes/dateRange'

interface IProps {
  company: string
  period: [string, string]
  driver?: string
  clients?: string[]
  consigneeType?: string
  orderType?: string
  allData?: boolean
  tks?: string[]
}

export default ({
  company,
  period,
  driver,
  clients,
  consigneeType,
  orderType,
  allData,
  tks,
}: IProps) => {
  const parsedPeriod = new DateRange(period[0], period[1])
  const partnerFilter = []

  const orderPeriodDate = {
    $getField: {
      field: 'plannedDate',
      input: {
        $first: '$route',
      },
    },
  }

  const firstMatcher: PipelineStage.Match = {
    $match: {
      company: new mongoose.Types.ObjectId(company),
      isActive: true,
      'state.status': 'completed',
      $expr: {
        $and: [
          { $lt: [orderPeriodDate, parsedPeriod.end] },
          { $gte: [orderPeriodDate, parsedPeriod.start] },
          { $ne: [{ $ifNull: ['$confirmedCrew.driver', null] }, null] },
        ],
      },
    },
  }
  if (tks && tks.length)
    firstMatcher.$match.$expr.$and.push({
      $in: [
        '$confirmedCrew.tkName',
        tks.map((tk) => new mongoose.Types.ObjectId(tk)),
      ],
    })
  if (orderType)
    firstMatcher.$match.$expr.$and.push({
      $eq: ['$analytics.type', orderType],
    })

  if (clients && clients.length)
    firstMatcher.$match.$expr.$and.push({
      $in: [
        '$client.client',
        clients.map((client) => new mongoose.Types.ObjectId(client)),
      ],
    })

  if (driver)
    firstMatcher.$match.$expr.$and.push({
      $eq: ['$confirmedCrew.driver', new mongoose.Types.ObjectId(driver)],
    })

  const driverFilter: PipelineStage[] = [
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
    {
      $addFields: {
        _driverFullName: {
          $trim: {
            input: {
              $concat: [
                '$_driver.surname',
                ' ',
                '$_driver.name',
                ' ',
                '$_driver.patronymic',
              ],
            },
          },
        },
      },
    },
  ]

  const agreementLookup = [
    {
      $lookup: {
        from: 'agreements',
        localField: 'client.agreement',
        foreignField: '_id',
        as: 'agreement',
      },
    },
    {
      $addFields: {
        _clientAgreement: { $first: '$agreement' },
      },
    },
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

  const addFields: PipelineStage[] = [
    {
      $addFields: {
        _orderTKNameId: '$confirmedCrew.tkName',
        _orderPeriodDate: orderPeriodDate,
      },
    },
  ]

  const addressesLookup = getAddressesLookupFragment()

  if (consigneeType)
    partnerFilter.push({
      $match: {
        '_consigneeType.value': consigneeType,
      },
    })
  const baseTariffs = getBaseSalaryTariffFragment(company)
  const waitingTariff = getWaitingSalaryTariffFragment(company)
  const returnTariff = getReturnSalaryTariff(company)
  const additionalPointsTariff = getAdditionalPointsTariff(company)
  const driverOrdersDetailes: PipelineStage[] = getDriverOrdersFragment()

  const group: PipelineStage[] = [
    {
      $group: {
        _id: '$confirmedCrew.driver',
        _driverFullName: { $first: '$_driverFullName' },
        payment: {
          $sum: '$paymentToDriver.sum',
        },
        totalCount: {
          $count: {},
        },
        base: { $sum: '$_baseTariff.tariff.sum' },
        waiting: { $sum: '$_waitingSum' },
        avgGrade: { $avg: '$grade.grade' },
        duration: { $sum: '$_routeDuration' },
        returnSum: { $sum: { $ifNull: ['$_returnSum', 0] } },
        additionalPointsSum: {
          $sum: { $ifNull: ['$_additionalPointsSum', 0] },
        },
      },
    },
    {
      $addFields: {
        avgGrade: { $round: ['$avgGrade', 2] },
        totalSum: {
          $add: [
            '$payment',
            '$base',
            '$waiting',
            '$returnSum',
            '$additionalPointsSum',
          ],
        },
      },
    },
    { $sort: { _driverFullName: 1 } },
  ]

  const pipeline = [
    firstMatcher,
    ...driverFilter,
    ...truckLookup,
    ...addFields,
    ...addressesLookup,
    ...partnerFilter,
    ...agreementLookup,
    ...baseTariffs,
    ...waitingTariff,
    ...returnTariff,
    ...additionalPointsTariff,
  ]
  if (allData || driver) pipeline.push(...driverOrdersDetailes)
  else pipeline.push(...group)

  return pipeline
}
