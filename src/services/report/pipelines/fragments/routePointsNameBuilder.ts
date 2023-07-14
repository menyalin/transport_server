// @ts-nocheck
import { POINT_TYPE_VALUES } from '../../../../constants/enums'

export default (pointType) => {
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
