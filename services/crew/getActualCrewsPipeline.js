import mongoose from 'mongoose'

export default (profile, date) => {
  const inputDate = new Date(date)
  if (!inputDate) throw new Error('wrong date format error')
  if (!profile) throw new Error('profile id not exist')
  return [
    {
      $match: {
        startDate: {
          $lte: inputDate
        },
        company: mongoose.Types.ObjectId(profile),
        isActive: true
      }
    },
    {
      $sort: {
        startDate: -1
      }
    },
    {
      $group: {
        _id: '$truck',
        crews: {
          $push: {
            _id: '$_id',
            truck: '$truck',
            trailer: '$trailer',
            driver: '$driver',
            startDate: '$startDate',
            tkName: '$tkName'
          }
        }
      }
    },
    {
      $addFields: {
        crew: { $first: '$crews' }
      }
    },
    {
      $project: {
        _id: '$crew._id',
        truck: '$crew.truck',
        trailer: '$crew.trailer',
        driver: '$crew.driver',
        startDate: '$crew.startDate',
        tkName: '$crew.tkName'
      }
    }
  ]
}
