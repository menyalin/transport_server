export interface ITitleRowFragmentProps {
  number: string
  date: Date
}

export interface IShipperFragmentProps {
  name: string
  inn: string
}

export interface IDataCommonTransportWaybillPrintForm {
  title: ITitleRowFragmentProps
  shipper: IShipperFragmentProps
}
