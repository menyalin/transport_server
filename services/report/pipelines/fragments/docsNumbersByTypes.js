export default function (type) {
  return {
    $trim: {
      input: {
        $reduce: {
          input: {
            $map: {
              input: {
                $filter: {
                  input: '$docs',
                  as: 'item',
                  cond: { $eq: ['$$item.type', type] },
                },
              },
              as: 'item',
              in: '$$item.number',
            },
          },
          initialValue: '',
          in: { $concat: ['$$value', '$$this', ', '] },
        },
      },
      chars: ', ',
    },
  }
}
