import mongoose from 'mongoose'
const { Types } = mongoose

const getAddressFilterBlock = ({ field, filter }) => {
  if (filter.cond === 'in')
    return {
      $anyElementTrue: [
        {
          $map: {
            input: field,
            in: {
              $in: ['$$this', filter?.values.map((i) => Types.ObjectId(i))],
            },
          },
        },
      ],
    }
  else
    return {
      $not: {
        $anyElementTrue: [
          {
            $map: {
              input: field,
              in: {
                $in: ['$$this', filter?.values.map((i) => Types.ObjectId(i))],
              },
            },
          },
        ],
      },
    }
}

export const secondMatcher = ({ filters }) => {
  const secondMatcher = {
    $match: {
      $expr: {
        $and: [],
      },
    },
  }
  if (filters.loadingRegions?.values.length)
    secondMatcher.$match.$expr.$and.push(
      getAddressFilterBlock({
        field: '$loadingRegions',
        filter: filters.loadingRegions,
      }),
    )
  // Регионы разгрузки
  if (filters.unloadingRegions?.values.length)
    secondMatcher.$match.$expr.$and.push(
      getAddressFilterBlock({
        field: '$unloadingRegions',
        filter: filters.unloadingRegions,
      }),
    )
  // Зоны погрузки
  if (filters.loadingZones?.values.length)
    secondMatcher.$match.$expr.$and.push(
      getAddressFilterBlock({
        field: '$loadingZones',
        filter: filters.loadingZones,
      }),
    )
  // Зоны разгрузки
  if (filters.unloadingZones?.values.length)
    secondMatcher.$match.$expr.$and.push(
      getAddressFilterBlock({
        field: '$unloadingZones',
        filter: filters.unloadingZones,
      }),
    )
  return secondMatcher
}
