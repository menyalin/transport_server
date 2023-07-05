import mongoose from 'mongoose'

export default ({
  company,
  date,
  agreement,
  truckKind,
  liftCapacity,
  loadingZones,
  unloadingZones,
}) => {
  try {
    if (loadingZones.length === 0 || unloadingZones.length === 0)
      throw new Error('Bad request params. No zones!!!')
    const orderDate = new Date(date)
    const firstMatcher = {
      $match: {
        isActive: true,
        company: mongoose.Types.ObjectId(company),
        agreement: mongoose.Types.ObjectId(agreement),
        type: 'zones',
        date: { $lte: orderDate },
        truckKind: truckKind,
        liftCapacity: liftCapacity,
        $expr: {
          $and: [
            {
              $in: [
                '$loadingZone',
                loadingZones.map((i) => mongoose.Types.ObjectId(i)),
              ],
            },
            {
              $in: [
                '$unloadingZone',
                unloadingZones.map((i) => mongoose.Types.ObjectId(i)),
              ],
            },
          ],
        },
      },
    }
    return [
      firstMatcher,
      { $sort: { date: 1, createdAt: 1 } },
      {
        $group: {
          _id: {
            loadingZone: '$loadingZone',
            unloadingZone: '$unloadingZone',
          },
          tariff: {
            $last: '$$ROOT',
          },
        },
      },
      { $replaceRoot: { newRoot: '$tariff' } },
      { $sort: { price: -1 } },
      { $limit: 1 },
    ]
  } catch (e) {
    throw new Error(e)
  }
}
