import { TARIFF_TYPES_ENUM } from '../../constants/tariff'
import {
  BasePointsTariff,
  IBasePointsTariffProps,
  BaseZonesTariff,
  IBaseZonesTariffProps,
  BaseDirectDistanceZonesTariff,
  IDirectDistanceZonesTariffProps,
  WaitingTariff,
  IWaitingTariffProps,
  AdditionalPointsTariff,
  IAdditionalPointsTariffProps,
  ReturnTariff,
  IReturnTariffProps,
} from './tariffTypes'

export type UnionTariffType =
  | BasePointsTariff
  | BaseZonesTariff
  | BaseDirectDistanceZonesTariff
  | WaitingTariff
  | AdditionalPointsTariff
  | ReturnTariff

export type UnionTariffTypeProps =
  | IBasePointsTariffProps
  | IBaseZonesTariffProps
  | IDirectDistanceZonesTariffProps
  | IWaitingTariffProps
  | IAdditionalPointsTariffProps
  | IReturnTariffProps

type TariffCreator = (tariffDTO: UnionTariffTypeProps) => UnionTariffType

export function createTariff(tariffDTO: UnionTariffTypeProps): UnionTariffType {
  const tariffCreators: Record<TARIFF_TYPES_ENUM, TariffCreator> = {
    [TARIFF_TYPES_ENUM.points]: (dto) =>
      new BasePointsTariff(dto as IBasePointsTariffProps),
    [TARIFF_TYPES_ENUM.zones]: (dto) =>
      new BaseZonesTariff(dto as IBaseZonesTariffProps),
    [TARIFF_TYPES_ENUM.directDistanceZones]: (dto) =>
      new BaseDirectDistanceZonesTariff(dto as IDirectDistanceZonesTariffProps),
    [TARIFF_TYPES_ENUM.waiting]: (dto) =>
      new WaitingTariff(dto as IWaitingTariffProps),

    [TARIFF_TYPES_ENUM.additionalPoints]: (dto) =>
      new AdditionalPointsTariff(dto as IAdditionalPointsTariffProps),

    [TARIFF_TYPES_ENUM.return]: (dto) =>
      new ReturnTariff(dto as IReturnTariffProps),
  }

  const creator = tariffCreators[tariffDTO.type]
  if (!creator) {
    throw new Error(`Unknown tariff type: ${tariffDTO.type}`)
  }
  return creator(tariffDTO)
}
