import { PipelineStage, Types } from 'mongoose'
import { GetListPropsDTO } from '../dto/getListProps.dto'
import { INCOMING_INVOICE_STATUSES_ENUM } from '@/constants/incomingInvoice'

const getSortingStage = (
  sortBy: string[] = [],
  sortDesc: boolean[] = []
): PipelineStage.Sort => {
  if (!Array.isArray(sortBy) || !sortBy.length)
    return { $sort: { createdAt: -1 } }

  let result = {}

  sortBy.forEach((fieldName, idx) => {
    result = { ...result, [fieldName]: sortDesc[idx] ? -1 : 1 }
  })
  return { $sort: result }
}

export const getListPipeline = (props: GetListPropsDTO): PipelineStage[] => {
  //#region: firstMatcher
  const firstMatcher: PipelineStage.Match = {
    $match: {
      company: new Types.ObjectId(props.company),
      $expr: {
        $and: [
          { $gte: ['$date', props.period.start] },
          { $lt: ['$date', props.period.end] },
        ],
      },
    },
  }

  if (props.carriers?.length)
    firstMatcher.$match.$expr?.$and.push({
      $in: ['$carrier', props.carriers.map((i) => new Types.ObjectId(i))],
    })

  if (props.statuses?.length)
    firstMatcher.$match.$expr?.$and.push({ $in: ['$status', props.statuses] })
  if (props.agreements?.length)
    firstMatcher.$match.$expr?.$and.push({
      $in: ['$agreement', props.agreements.map((i) => new Types.ObjectId(i))],
    })

  if (props.search)
    firstMatcher.$match.$expr?.$and.push({
      $regexMatch: {
        input: '$number',
        regex: props.search,
        options: 'i',
      },
    })
  //#endregion

  const carrierLookup: PipelineStage.Lookup = {
    $lookup: {
      from: 'tknames',
      localField: 'carrier',
      foreignField: '_id',
      as: 'carrier',
    },
  }

  const aggrementLookup: PipelineStage.Lookup = {
    $lookup: {
      from: 'carrierAgreements',
      localField: 'agreement',
      foreignField: '_id',
      as: 'agreement',
    },
  }

  const addFields: PipelineStage.AddFields = {
    $addFields: {
      agreementName: {
        $getField: { field: 'name', input: { $first: '$agreement' } },
      },
      carrierName: {
        $getField: { field: 'name', input: { $first: '$carrier' } },
      },
      status: {
        $switch: {
          branches: [
            {
              case: {
                $eq: ['$status', INCOMING_INVOICE_STATUSES_ENUM.preparing],
              },
              then: 'Подготовка',
            },
            {
              case: { $eq: ['$status', INCOMING_INVOICE_STATUSES_ENUM.toPay] },
              then: 'К оплате',
            },
            {
              case: { $eq: ['$status', INCOMING_INVOICE_STATUSES_ENUM.paid] },
              then: 'Оплачен',
            },
          ],
          default: '_статус не определен_',
        },
      },
    },
  }

  const finalGroup: PipelineStage.Facet = {
    $facet: {
      totalCount: [{ $count: 'count' }],
      items: [
        getSortingStage(props.sortBy, props.sortDesc),
        { $skip: props.skip },
        { $limit: props.limit },
      ],
    },
  }

  return [firstMatcher, aggrementLookup, carrierLookup, addFields, finalGroup]
}
