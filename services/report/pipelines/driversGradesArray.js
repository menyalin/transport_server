import mongoose from 'mongoose'
import { ORDER_PRICE_TYPES_ENUM } from '../../../constants/priceTypes.js'
import routePointsNameBuilder from './fragments/routePointsNameBuilder.js'

export default ({ dateRange, company }) => {
  const firstPlannedDate = {
    $getField: {
      field: 'plannedDate',
      input: { $first: '$route' },
    },
  }

  const firstMatcher = {
    $match: {
      company: mongoose.Types.ObjectId(company),
      isActive: true,
      $expr: {
        $and: [
          { $eq: ['$state.status', 'completed'] },
          { $gte: [firstPlannedDate, new Date(dateRange[0])] },
          { $lt: [firstPlannedDate, new Date(dateRange[1])] },
        ],
      },
    },
  }

  const unwindRoute = {
    $unwind: '$route',
  }

  const lookupAddresses = [
    {
      $lookup: {
        from: 'addresses',
        localField: 'route.address',
        foreignField: '_id',
        as: 'route.address',
      },
    },
    {
      $addFields: {
        'route.address': {
          $first: '$route.address',
        },
      },
    },
  ]

  const groupRoute = {
    $group: {
      _id: '$_id',
      grade: { $first: '$grade' },
      route: { $push: '$route' },
      client: { $first: '$client' },
      confirmedCrew: { $first: '$confirmedCrew' },
      prePrices: { $first: '$prePrices' },
      prices: { $first: '$prices' },
      finalPrices: { $first: '$finalPrices' },
      outsourceCosts: { $first: '$outsourceCosts' },
    },
  }

  const lookupDriver = {
    $lookup: {
      from: 'drivers',
      localField: 'confirmedCrew.driver',
      foreignField: '_id',
      as: 'driver',
    },
  }

  const lookupTkName = {
    $lookup: {
      from: 'tknames',
      localField: 'truck.tkName',
      foreignField: '_id',
      as: 'tkName',
    },
  }

  const lookupTruck = {
    $lookup: {
      from: 'trucks',
      localField: 'confirmedCrew.truck',
      foreignField: '_id',
      as: 'truck',
    },
  }

  const lookupTrailer = {
    $lookup: {
      from: 'trucks',
      localField: 'confirmedCrew.trailer',
      foreignField: '_id',
      as: 'trailer',
    },
  }

  const priceArraysToObjects = {
    $addFields: {
      prices: {
        $arrayToObject: {
          $map: {
            input: '$prices',
            in: { k: '$$this.type', v: '$$this' },
          },
        },
      },
      prePrices: {
        $arrayToObject: {
          $map: {
            input: '$prePrices',
            in: { k: '$$this.type', v: '$$this' },
          },
        },
      },
      finalPrices: {
        $arrayToObject: {
          $map: {
            input: '$finalPrices',
            in: { k: '$$this.type', v: '$$this' },
          },
        },
      },
    },
  }

  const addPriceTypeFieldsBuilder = (priceTypes) => {
    let res = {}
    priceTypes.forEach((type) => {
      res = Object.assign(res, {
        [type]: {
          $ifNull: [
            '$finalPrices.' + type,
            '$prices.' + type,
            '$prePrices.' + type,
          ],
        },
      })
    })
    return { $addFields: { ...res } }
  }

  const sortByPlannedDate = [
    { $addFields: { firstPlannedDate } },
    { $sort: { firstPlannedDate: 1 } },
  ]

  const getTotalPrice = (priceTypes, withVat = true) => ({
    $add: priceTypes.map((type) => ({
      $ifNull: [`$${type}.${withVat ? 'price' : 'priceWOVat'}`, 0],
    })),
  })

  const finalProject = {
    $project: {
      'Плановая дата погрузки': {
        $dateToString: {
          date: '$firstPlannedDate',
          format: '%Y-%m-%d',
          timezone: '+03:00',
        },
      },
      Погрузка: routePointsNameBuilder('loading'),
      Выгрузка: routePointsNameBuilder('unloading'),
      ТК: {
        $getField: { field: 'name', input: { $first: '$tkName' } },
      },
      Грузовик: {
        $getField: {
          field: 'regNum',
          input: {
            $first: '$truck',
          },
        },
      },
      Прицеп: {
        $getField: {
          field: 'regNum',
          input: {
            $first: '$trailer',
          },
        },
      },
      Водитель: {
        $trim: {
          input: {
            $concat: [
              { $getField: { field: 'surname', input: { $first: '$driver' } } },
              ' ',
              { $getField: { field: 'name', input: { $first: '$driver' } } },
              ' ',
              {
                $getField: {
                  field: 'patronymic',
                  input: { $first: '$driver' },
                },
              },
              ' ',
            ],
          },
        },
      },
      Оценка: '$grade.grade',
      'Комментарий к оценке': '$grade.note',
      'Стоимость с НДС': getTotalPrice(ORDER_PRICE_TYPES_ENUM, true),
      'Стоимость без НДС': getTotalPrice(ORDER_PRICE_TYPES_ENUM, false),
      'Затраты привлеченный с НДС': {
        $reduce: {
          input: '$outsourceCosts',
          initialValue: 0,
          in: { $add: ['$$value', { $ifNull: ['$$this.price', 0] }] },
        },
      },
      'Затраты привлеченный без НДС': {
        $reduce: {
          input: '$outsourceCosts',
          initialValue: 0,
          in: { $add: ['$$value', { $ifNull: ['$$this.priceWOVat', 0] }] },
        },
      },
    },
  }

  return [
    firstMatcher,
    unwindRoute,
    ...lookupAddresses,
    groupRoute,
    lookupDriver,
    lookupTruck,
    lookupTkName,
    lookupTrailer,
    priceArraysToObjects,
    addPriceTypeFieldsBuilder(ORDER_PRICE_TYPES_ENUM),
    ...sortByPlannedDate,
    finalProject,
  ]
}
