export const orderDateFragmentBuilder = (routePath = 'route') => ({
  $getField: {
    field: 'plannedDate',
    input: {
      $ifNull: [
        {
          $first: {
            $filter: {
              input: `$${routePath}`,
              cond: '$$this.isMainLoadingPoint',
            },
          },
        },
        { $first: `$${routePath}` },
      ],
    },
  },
})
