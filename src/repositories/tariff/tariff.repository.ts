import { Tariff as TariffModel } from '../../models'
import {
  UnionTariffType,
  UnionTariffTypeProps,
  createTariff,
} from '../../domain/tariff/tariff.creator'
import getListPipeline from './getListPipeline'
import { PipelineStage } from 'mongoose'

class TariffRepository {
  async create(props: UnionTariffTypeProps[]): Promise<UnionTariffType[]> {
    if (!Array.isArray(props))
      throw new Error('TariffRepository : create : prop must be an array')
    const data = await TariffModel.create(props.map((i) => createTariff(i)))
    return data.map((i) => createTariff(<UnionTariffTypeProps>(<unknown>i)))
  }

  async removeById(id: string): Promise<void> {
    try {
      await TariffModel.findByIdAndRemove(id)
    } catch (e) {
      throw new Error('TariffRepository : removeById : ' + e)
    }
  }

  async getList(params: any) {
    const pipeline: PipelineStage[] = getListPipeline(params)
    const res = await TariffModel.aggregate(pipeline)
    return {
      count: res[0].count,
      items: res[0].items.map((i: UnionTariffTypeProps) => createTariff(i)),
    }
  }
}
export default new TariffRepository()
