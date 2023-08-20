import { TARIFF_TYPES_ENUM } from '../../../constants/tariff'
import { ITariffProps, Tariff } from '../tariff.domain'

export interface IAdditionalPointsTariffProps extends ITariffProps {
  type: TARIFF_TYPES_ENUM
  orderType: string
  includedPoints: number
}

export class AdditionalPointsTariff extends Tariff {
  type: TARIFF_TYPES_ENUM = TARIFF_TYPES_ENUM.additionalPoints
  includedPoints: number
  orderType: string

  constructor(t: IAdditionalPointsTariffProps) {
    super(t)
    if (t.includedPoints === undefined || t.includedPoints === null)
      throw new Error(
        'AdditionalPointsTariff constractor error: includedPoints is missing'
      )
    if (t.type !== this.type)
      throw new Error(
        'AdditionalPointsTariff constractor error: invalid tariff type'
      )
    this.type = t.type
    this.includedPoints = t.includedPoints
    this.orderType = t.orderType
  }
}
