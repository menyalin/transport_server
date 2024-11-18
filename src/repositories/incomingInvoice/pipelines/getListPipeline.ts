import { PipelineStage, Types } from 'mongoose'
import { GetListPropsDTO } from '../dto/getListProps.dto'
import { INCOMING_INVOICE_STATUSES_ENUM } from '@/constants/incomingInvoice'

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

  if (props.statuses?.length)
    firstMatcher.$match.$expr?.$and.push({ $in: ['$status', props.statuses] })
  if (props.agreements?.length)
    firstMatcher.$match.$expr?.$and.push({
      $in: ['$agreement', props.agreements.map((i) => new Types.ObjectId(i))],
    })

  if (props.number)
    firstMatcher.$match.$expr?.$and.push({
      $regexMatch: {
        input: '$number',
        regex: new RegExp(props.number, 'i'),
        options: 'i',
      },
    })
  //#endregion

  const aggrementLookup: PipelineStage.Lookup = {
    $lookup: {
      from: 'agreements',
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
      items: [{ $skip: props.skip }, { $limit: props.limit }],
    },
  }
  return [firstMatcher, aggrementLookup, addFields, finalGroup]
}
