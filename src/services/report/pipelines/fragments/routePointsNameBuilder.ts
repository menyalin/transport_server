import { POINT_TYPE_VALUES, POINT_TYPES_ENUM } from '@/constants/enums'

export default (pointType: POINT_TYPES_ENUM) => {
  if (!POINT_TYPE_VALUES.includes(pointType))
    throw new Error(`RoutePointsNameBuilder: bad params: ${pointType}`)

  return {
    $rtrim: {
      input: {
        $reduce: {
          input: {
            $filter: {
              input: '$route',
              cond: {
                $eq: ['$$this.type', pointType],
              },
            },
          },
          initialValue: '',
          in: {
            $concat: ['$$value', '$$this.address.shortName', ', '],
          },
        },
      },
      chars: ', ',
    },
  }
}
