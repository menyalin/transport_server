export interface ISignatute {
  role: string
  position?: string
  companyName?: string
  name: string
}
export interface IHeaderFragment {
  text: string
  isBold?: boolean
}

export interface IOkAktBuilderProps {
  docNumber: string
  date: string
  actHeader: string
  actHeaderFragments: IHeaderFragment[]
  contractNumber: string
  contractDate: string
  startPeriod: string
  endPeriod: string
  totalSum: string
  vatSum: string
  signatories: ISignatute[]
}
