import { PipelineStage, Types } from 'mongoose'
import z from 'zod'

const propSchema = z.object({
  company: z.string(),
  type: z.string().optional(),
  limit: z.string().transform((v) => +v),
  skip: z.string().transform((v) => +v),
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

  const agreementLookup: PipelineStage[] = [
    {
      $lookup: {
        from: 'carrierAgreements',
        localField: 'agreement',
        foreignField: '_id',
        as: '_agreement',
      },
    },
    {
      $addFields: {
        agreementName: {
          $getField: {
            field: 'name',
            input: {
              $first: '$_agreement',
            },
          },
        },
      },
    },
    { $unset: ['_agreement'] },
  ]

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
      items: [{ $skip: p.skip }, { $limit: p.limit }, ...agreementData],
      count: [{ $count: 'count' }],
    },
  }

  return [firstMatcher, unsetFields, ...agreementLookup, finalFacet]
}
