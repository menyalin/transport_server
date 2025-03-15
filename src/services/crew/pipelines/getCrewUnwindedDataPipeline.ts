import { objectIdSchema } from '@/shared/validationSchemes'
import { PipelineStage, Types } from 'mongoose'
import { z } from 'zod'

export const getCrewUnwindedDataPipeline = (
  props: unknown
): PipelineStage[] => {
  const formattedDate = (fieldName: string) => {
    return {
      $dateToString: {
        format: '%d.%m.%Y %H:%M:%S',
        date: fieldName,
        timezone: '+03',
      },
    }
  }
  const propsSchema = z.object({
    profile: objectIdSchema,
    period: z
      .array(z.string().datetime())
      .length(2)
      .transform((v) => v.map((i) => new Date(i))),
  })
  const p = propsSchema.parse(props)
  const firstMatcher: PipelineStage.Match = {
    $match: {
      isActive: true,
      company: new Types.ObjectId(p.profile),
      $expr: {
        $and: [
          {
            $and: [
              { $lt: ['$startDate', p.period[1]] },
              {
                $or: [
                  { $eq: ['$endDate', null] },
                  { $gte: ['$endDate', p.period[0]] },
                ],
              },
            ],
          },
        ],
      },
    },
  }
  const carrierLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'tknames',
        localField: 'tkName',
        foreignField: '_id',
        as: 'carrier',
      },
    },
    {
      $addFields: {
        carrierName: {
          $getField: {
            field: 'name',
            input: { $first: '$carrier' },
          },
        },
      },
    },
    {
      $unset: 'carrier',
    },
  ]
  const driverLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'drivers',
        localField: 'driver',
        foreignField: '_id',
        as: 'driver',
      },
    },
    {
      $addFields: {
        driver: { $first: '$driver' },
      },
    },
    {
      $addFields: {
        driverFullName: {
          $trim: {
            input: {
              $concat: [
                '$driver.surname',
                ' ',
                '$driver.name',
                ' ',
                '$driver.patronymic',
              ],
            },
          },
        },
      },
    },
    {
      $unset: 'driver',
    },
  ]
  const transportUnwind: PipelineStage = {
    $unwind: {
      path: '$transport',
      preserveNullAndEmptyArrays: true,
    },
  }
  const truckLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'trucks',
        localField: 'transport.truck',
        foreignField: '_id',
        as: 'truck',
      },
    },
    {
      $addFields: {
        truckNumber: {
          $getField: {
            field: 'regNum',
            input: { $first: '$truck' },
          },
        },
      },
    },
    {
      $unset: 'truck',
    },
  ]
  const trailerLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'trucks',
        localField: 'transport.trailer',
        foreignField: '_id',
        as: 'trailer',
      },
    },
    {
      $addFields: {
        trailerNumber: {
          $getField: {
            field: 'regNum',
            input: { $first: '$trailer' },
          },
        },
      },
    },
    {
      $unset: 'trailer',
    },
  ]

  const finalProject: PipelineStage = {
    $addFields: {
      startDate: formattedDate('$startDate'),
      endDate: formattedDate('$endDate'),
      transportStartDate: formattedDate('$transport.startDate'),
      transportEndDate: formattedDate('$transport.endDate'),
    },
  }
  return [
    firstMatcher,
    ...carrierLookup,
    ...driverLookup,
    transportUnwind,
    ...truckLookup,
    ...trailerLookup,
    finalProject,
  ]
}
