import { PipelineStage } from 'mongoose'

export const orderAddressesLookupBuilder = (
  pointType: 'loading' | 'unloading'
): PipelineStage[] => {
  const tmp_ids_field_name = `tmp_${pointType}_address_ids`
  const result_field_name = `${pointType}_addresses`
  return [
    {
      $addFields: {
        [tmp_ids_field_name]: {
          $map: {
            input: `$route`,
            as: 'point',
            in: {
              $cond: {
                if: { $eq: ['$$point.type', pointType] },
                then: '$$point.address',
                else: null,
              },
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'addresses',
        localField: tmp_ids_field_name,
        foreignField: '_id',
        as: result_field_name,
      },
    },
    {
      $addFields: {
        [pointType + '_addresses_str']: {
          $reduce: {
            input: `$${result_field_name}`,
            initialValue: '',
            in: { $concat: ['$$value', '$$this.shortName', ', '] },
          },
        },
      },
    },
    {
      $addFields: {
        [pointType + '_addresses_str']: {
          $trim: {
            chars: ', ',
            input: `$${pointType}_addresses_str`,
          },
        },
      },
    },
    {
      $unset: [tmp_ids_field_name],
    },
  ]
}
