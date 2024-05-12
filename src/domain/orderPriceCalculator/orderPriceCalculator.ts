import { Order } from '../order/order.domain'
import { TariffContract } from '../tariffContract'
import {
  DirectDistanceZonesBaseTariff,
  ZonesBaseTariff,
} from '../tariffContract/types/tarriffs'
import { Agreement } from '../agreement/agreement.domain'
import { OrderPrice } from '../order/orderPrice'

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
        res.push(...contract.getSortedZoneTariffs())
        res.push(...contract.getDirectDistanceZonesTariffs())
      })
    return res
  }

  basePrice(
    order: Order,
    contracts: TariffContract[],
    agreement: Agreement | null
  ): OrderPrice[] {
    if (!agreement || contracts.length === 0 || order.analytics === undefined)
      return []

    const tariffs = this.basePricePrioritySorter(contracts)
    const tariff = tariffs.find((t: BaseTariff) => t.canApplyToOrder(order))
    if (tariff === undefined) return []

    return tariff.calculateForOrder(order, agreement)
  }
}
