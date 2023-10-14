import { Types, isObjectIdOrHexString } from 'mongoose'

interface IClientProps {
  client: string | Types.ObjectId
  num?: string
  auctionNum?: string
  agreement?: string | Types.ObjectId
}

export class Client {
  client: string
  num?: string
  auctionNum?: string
  agreement?: string | Types.ObjectId
  constructor(props: IClientProps) {
    this.client = props.client?.toString()
    this.num = props.num
    this.auctionNum = props.auctionNum
    this.agreement =
      isObjectIdOrHexString(props.agreement) && !!props.agreement
        ? props.agreement.toString()
        : props.agreement
  }

  static dbSchema() {
    return {
      client: {
        type: Types.ObjectId,
        ref: 'Partner',
      },
      num: String,
      auctionNum: String,
      agreement: {
        type: Types.ObjectId,
        ref: 'Agreement',
      },
    }
  }
}
