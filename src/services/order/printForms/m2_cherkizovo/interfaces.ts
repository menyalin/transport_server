interface IRecipient {
  position: string
  fullName: string
  passportSeria: string
  passportNumber: string
  passportIssuer: string
  passportIssueDate: string
}

interface IShipper {
  name: string
  contract: string
}

interface IPerson {
  name: string
  position: string
}

interface ICompany {
  fullData: string
  fullName: string
  inn: string
  kpp: string
  bankAccountInfo: string
  address: string
  isLegalEntity: boolean
  directorName: string
  accountantName: string
}

interface IGood {
  good: string
  measure: string
  amount: string
}

export interface IM2Cherkizovo {
  num: string
  issueDate: string
  expiredAtDate: string
  person: IPerson
  truckInfo: string
  shipper: IShipper
  recipient: IRecipient
  company: ICompany
  goods: IGood[]
}
