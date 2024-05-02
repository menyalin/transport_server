import { Order } from '../order/order.domain'
import { TariffContract } from '../tariffContract'
import {
  DirectDistanceZonesBaseTariff,
  ZonesBaseTariff,
} from '../tariffContract/types/tarriffs'

type BaseTariff = ZonesBaseTariff | DirectDistanceZonesBaseTariff

export class OrderPriceCalculator {
  contractsComparator(a: TariffContract, b: TariffContract): number {
    if (+a.startDate > +b.startDate) return -1
    if (+a.startDate < +b.startDate) return 1
    if (!a.createdAt || !b.createdAt) return 0
    if (+a.createdAt > +b.createdAt) return -1
    if (+a.createdAt < +b.createdAt) return 1
    return 0
  }

  basePricePrioritySorter(contracts: TariffContract[]): BaseTariff[] {
    let res: BaseTariff[] = []
    contracts
      .slice()
      .sort(this.contractsComparator)
      .forEach((contract) => {
        res.push(...contract.sortedZoneTariffs)
        res.push(...contract.directDistanceZonesTariffs)
      })
    return res
  }

  basePrice(order: Order, contracts: TariffContract[]) {
    const tariffs = this.basePricePrioritySorter(contracts)
    const tariff = tariffs.find((t) => t.canApplyToOrder(order))
    if (!tariff) return 0

    return tariff.calculateForOrder(order)
  }
}
