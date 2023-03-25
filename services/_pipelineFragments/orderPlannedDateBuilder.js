export const orderPlannedDateBuilder = () => ({
  $getField: {
    field: 'plannedDate',
    input: { $first: '$route' },
  },
})
