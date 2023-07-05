// @ts-nocheck
export const firstPlannedDate = () => ({
  $getField: {
    field: 'plannedDate',
    input: { $first: '$route' },
  },
})
