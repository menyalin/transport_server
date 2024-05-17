import { Expression } from 'mongoose'
import { BadRequestError } from '@/helpers/errors'

export const orderSearchByNumberFragmentBuilder = (
  search: string
): Expression => {
  if (!search)
    throw new BadRequestError(
      'orderSearchByNumberFragmentBuilder. search text is missing!!'
    )

  return {
    $or: [
      { $regexMatch: { input: '$client.num', regex: search, options: 'i' } },
      {
        $regexMatch: {
          input: '$client.auctionNum',
          regex: search,
          options: 'i',
        },
      },
      {
        $gte: [
          {
            $size: {
              $filter: {
                input: '$docs',
                cond: {
                  $regexMatch: {
                    input: '$$this.number',
                    regex: search,
                    options: 'i',
                  },
                },
              },
            },
          },
          1,
        ],
      },
    ],
  }
}
