// @ts-nocheck
export const getRouteDuration = () => ({
  $dateDiff: {
    startDate: {
      $ifNull: [
        { $getField: { field: 'arrivalDateDoc', input: { $first: '$route' } } },
        { $getField: { field: 'arrivalDate', input: { $first: '$route' } } },
      ],
    },
    endDate: {
      $ifNull: [
        {
          $getField: { field: 'departureDateDoc', input: { $last: '$route' } },
        },
        {
          $getField: { field: 'departureDate', input: { $last: '$route' } },
        },
      ],
    },
    unit: 'hour',
  },
})
