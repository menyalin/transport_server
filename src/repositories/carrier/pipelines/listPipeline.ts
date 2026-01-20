import { PipelineStage, Types } from 'mongoose'
import z from 'zod'

const propSchema = z.object({
  company: z.string(),
  type: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? +v : undefined)),
  skip: z
    .string()
    .optional()
    .transform((v) => (v ? +v : undefined)),
  search: z.string().optional(),
})

export const createGetListPipeline = (params: unknown): PipelineStage[] => {
  const p = propSchema.parse(params)
  const unsetFields = { $unset: ['bankAccountInfo', 'companyInfo', 'contacts'] }
  const firstMatcher: PipelineStage.Match = {
    $match: {
      $expr: {
        $and: [
          { $eq: ['$company', new Types.ObjectId(p.company)] },
          { $eq: ['$isActive', true] },
        ],
      },
    },
  }

  if (p.search) {
    firstMatcher.$match?.$expr?.$and.push({
      $regexMatch: {
        input: '$name',
        regex: p.search,
        options: 'i',
      },
    })
  }

  if (p.type === 'outsource') {
    firstMatcher.$match?.$expr?.$and.push({
      $eq: ['$outsource', true],
    })
  } else if (p.type === 'own')
    firstMatcher.$match?.$expr?.$and.push({
      $ne: ['$outsource', true],
    })

  const agreementData = [
    {
      $lookup: {
        from: 'carrierAgreements',
        localField: 'agreements.agreement',
        foreignField: '_id',
        as: 'agreementsData',
      },
    },
    {
      $unset: [
        'agreement',
        'agreementsData.paymentDescription',
        'agreementsData.orderContractNote',
        'agreementsData.company',
        'agreementsData.isActive',
        'agreementsData.paymentOfDays',
        'agreementsData.note',
        'agreementsData.createdAt',
        'agreementsData.updatedAt',
        'agreementsData.__v',
        'agreementsData.usePriceWithVat',
        'agreementsData.usePriceWithVAT',
      ],
    },
  ]

  const finalFacet: PipelineStage.Facet = {
    $facet: {
      items: [
        { $skip: p.skip || 0 },
        { $limit: p.limit || 10000 },
        ...agreementData,
      ],
      count: [{ $count: 'count' }],
    },
  }

  return [firstMatcher, unsetFields, finalFacet]
}
