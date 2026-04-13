export interface ITitleRowFragmentProps {
  number: string
  date: string // Форматированная дата для PDF
}

export interface IShipperFragmentProps {
  name: string
  inn: string
  address: string
}

export interface IDataCommonTransportWaybillPrintForm {
  title: ITitleRowFragmentProps
  shipper: IShipperFragmentProps
}
