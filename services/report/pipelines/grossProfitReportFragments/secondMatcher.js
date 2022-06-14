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

export const secondMatcher = ({ mainFilters }) => {
  const secondMatcher = {
    $match: {
      $expr: {
        $and: [],
      },
    },
  }
  if (mainFilters.loadingRegions?.values.length)
    secondMatcher.$match.$expr.$and.push(
      getAddressFilterBlock({
        field: '$loadingRegions',
        filter: mainFilters.loadingRegions,
      }),
    )
  // Регионы разгрузки
  if (mainFilters.unloadingRegions?.values.length)
    secondMatcher.$match.$expr.$and.push(
      getAddressFilterBlock({
        field: '$unloadingRegions',
        filter: mainFilters.unloadingRegions,
      }),
    )
  // Зоны погрузки
  if (mainFilters.loadingZones?.values.length)
    secondMatcher.$match.$expr.$and.push(
      getAddressFilterBlock({
        field: '$loadingZones',
        filter: mainFilters.loadingZones,
      }),
    )
  // Зоны разгрузки
  if (mainFilters.unloadingZones?.values.length)
    secondMatcher.$match.$expr.$and.push(
      getAddressFilterBlock({
        field: '$unloadingZones',
        filter: mainFilters.unloadingZones,
      }),
    )
  return secondMatcher
}
