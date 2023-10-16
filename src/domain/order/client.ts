import { isObjectIdOrHexString, Schema } from 'mongoose'

interface IClientProps {
  client: string | Schema.Types.ObjectId
  num?: string
  auctionNum?: string
  agreement?: string | Schema.Types.ObjectId
}

export class Client {
  client: string
  num?: string
  auctionNum?: string
  agreement?: string | Schema.Types.ObjectId
  constructor(props: IClientProps) {
    this.client = props.client?.toString()
    this.num = props.num
    this.auctionNum = props.auctionNum
    this.agreement =
      isObjectIdOrHexString(props.agreement) && !!props.agreement
        ? props.agreement.toString()
        : props.agreement
  }

  toJSON() {
    return {
      client: this.client,
      num: this.num,
      auctionNum: this.auctionNum,
      agreement: this.agreement,
    }
  }
  static dbSchema() {
    return {
      client: {
        type: Schema.Types.ObjectId,
        ref: 'Partner',
      },
      num: String,
      auctionNum: String,
      agreement: {
        type: Schema.Types.ObjectId,
        ref: 'Agreement',
      },
    }
  }
}
