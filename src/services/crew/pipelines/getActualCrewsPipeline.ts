import { Types } from 'mongoose'

export default (profile: string) => {
  const today = new Date()
  if (!profile) throw new Error('profile id not exist')
  return [
    {
      $match: {
        isActive: true,
        company: new Types.ObjectId(profile),
        transport: {
          $elemMatch: {
            startDate: {
              $lte: today,
            },
            $or: [{ endDate: null }, { endDate: { $gt: today } }],
          },
        },
      },
    },
    { $unwind: { path: '$transport' } },
    {
      $match: {
        'transport.startDate': { $lte: today },
        $or: [
          { 'transport.endDate': null },
          { 'transport.endDate': { $gt: today } },
        ],
      },
    },
  ]
}
