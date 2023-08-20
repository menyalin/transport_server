import {
  Tariff as TariffModel,
  Agreement as AgreementModel,
} from '../../models'
import {
  UnionTariffType,
  UnionTariffTypeProps,
  createTariff,
} from '../../domain/tariff/tariff.creator'
import getListPipeline from './getListPipeline'
import { PipelineStage } from 'mongoose'
import { BadRequestError } from '../../helpers/errors'

class TariffRepository {
  async create(props: UnionTariffTypeProps[]): Promise<UnionTariffType[]> {
    if (!Array.isArray(props))
      throw new Error('TariffRepository : create : prop must be an array')
    const data = await TariffModel.create(props.map((i) => createTariff(i)))
    return data.map((i) =>
      createTariff(<UnionTariffTypeProps>(<unknown>i.toJSON()))
    )
  }

  async removeById(id: string): Promise<void> {
    try {
      await TariffModel.findByIdAndRemove(id)
    } catch (e) {
      throw new Error('TariffRepository : removeById : ' + e)
    }
  }

  async updateById(id: string, body: UnionTariffType): Promise<unknown> {
    const updatedData = await TariffModel.findByIdAndUpdate(id, body, {
      new: true,
    }).lean()

    if (!updatedData)
      throw new BadRequestError(
        'TariffRepository : updateById : updated tariff is missing'
      )

    const tariff = createTariff(<UnionTariffTypeProps>(<unknown>updatedData))

    const agreement = await AgreementModel.findById(tariff.agreement).lean()
    tariff.agreementName = agreement!.name
    return tariff
  }

  async getList(params: any) {
    const pipeline: PipelineStage[] = getListPipeline(params)
    const res = await TariffModel.aggregate(pipeline)
    return {
      count: res[0]?.count || 0,
      items:
        res[0]?.items.map((i: UnionTariffTypeProps) => createTariff(i)) || [],
    }
  }
}
export default new TariffRepository()
