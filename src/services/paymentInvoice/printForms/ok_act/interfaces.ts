export interface ISignatute {
  role: string
  name: string
}

export interface IOkAktBuilderProps {
  docNumber: string
  date: string
  actHeader: string
  contractNumber: string
  contractDate: string
  startPeriod: string
  endPeriod: string
  totalSum: string
  vatSum: string
  signatories: ISignatute[]
}
