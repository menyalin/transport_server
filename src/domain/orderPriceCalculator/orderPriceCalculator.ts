import { Order } from '../order/order.domain'
import { TariffContract } from '../tariffContract'
import {
  DirectDistanceZonesBaseTariff,
  ReturnPercentTariff,
  ZonesBaseTariff,
  IdleTimeTariff,
} from '../tariffContract/types/tarriffs'
import { Agreement } from '../agreement/agreement.domain'
import { OrderPrice } from '../order/orderPrice'
import { AddressZone } from '../address'

type ReturnTariff = ReturnPercentTariff
type BaseTariff = ZonesBaseTariff | DirectDistanceZonesBaseTariff
type IdleTariff = IdleTimeTariff

export class OrderPriceCalculator {
  private contractsComparator(a: TariffContract, b: TariffContract): number {
    if (+a.startDate > +b.startDate) return -1
    if (+a.startDate < +b.startDate) return 1
    if (!a.createdAt || !b.createdAt) return 0
    if (+a.createdAt > +b.createdAt) return -1
    if (+a.createdAt < +b.createdAt) return 1
    return 0
  }

  private baseZoneTariffComparator(
    a: ZonesBaseTariff,
    b: ZonesBaseTariff
  ): number {
    if (a.priority > b.priority) return -1
    if (+a.priority < +b.priority) return 1
    if (!a.contractDate || !b.contractDate) return 0
    if (+a.contractDate > +b.contractDate) return -1
    if (+a.contractDate < +b.contractDate) return 1
    if (+a.price > +b.price) return -1
    if (+a.price < +b.price) return 1
    return 0
  }

  basePricePrioritySorter(
    contracts: TariffContract[],
    zones: AddressZone[] = []
  ): BaseTariff[] {
    let zoneTariffs: ZonesBaseTariff[] = []
    let directDistanceTariffs: DirectDistanceZonesBaseTariff[] = []

    contracts
      .slice()
      .sort(this.contractsComparator)
      .forEach((contract) => {
        zoneTariffs.push(...contract.getSortedZoneTariffs(zones))
        directDistanceTariffs.push(...contract.getDirectDistanceZonesTariffs())
      })
    return [
      ...zoneTariffs.sort(this.baseZoneTariffComparator),
      ...directDistanceTariffs,
    ]
  }

  returnPriceSorter(contracts: TariffContract[]): ReturnTariff[] {
    let res: ReturnTariff[] = []
    contracts
      .slice()
      .sort(this.contractsComparator)
      .forEach((contract) => {
        res.push(...contract.getReturnPercentTariffs())
      })
    return res
  }

  idleTimePriceSorter(contracts: TariffContract[]): IdleTariff[] {
    let res: IdleTariff[] = []
    contracts
      .slice()
      .sort(this.contractsComparator)
      .forEach((contract) => {
        res.push(...contract.getIdleTimeTariffs())
      })
    return res
  }

  idlePrice(
    order: Order,
    contracts: TariffContract[],
    agreement: Agreement | null
  ): OrderPrice[] {
    if (!agreement || contracts.length === 0 || order.analytics === undefined)
      return []

    const tariffs = this.idleTimePriceSorter(contracts)
    const tariff = tariffs.find((t) => t.canApplyToOrder(order))
    if (tariff === undefined) return []
    return tariff.calculateForOrder(order, agreement)
  }

  basePrice(
    order: Order,
    contracts: TariffContract[],
    agreement: Agreement | null,
    zones: AddressZone[] = []
  ): OrderPrice[] {
    if (!agreement || contracts.length === 0 || order.analytics === undefined)
      return []

    const tariffs = this.basePricePrioritySorter(contracts, zones)
    const tariff = tariffs.find((t: BaseTariff) => t.canApplyToOrder(order))
    if (tariff === undefined) return []

    return tariff.calculateForOrder(order, agreement)
  }

  returnPrice(
    order: Order,
    contracts: TariffContract[],
    agreement: Agreement | null
  ): OrderPrice[] {
    if (!agreement || contracts.length === 0 || order.analytics === undefined)
      return []
    const tariffs = this.returnPriceSorter(contracts)
    const tariff = tariffs.find((t) => t.canApplyToOrder(order))
    if (tariff === undefined) return []
    return tariff.calculateForOrder(order, agreement)
  }
}
