export const orderDateFragmentBuilder = () => ({
  $getField: {
    field: 'plannedDate',
    input: {
      $ifNull: [
        {
          $first: {
            $filter: { input: '$route', cond: '$$this.isMainLoadingPoint' },
          },
        },
        { $first: '$route' },
      ],
    },
  },
})
