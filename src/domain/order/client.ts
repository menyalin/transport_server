import { isObjectIdOrHexString, Schema } from 'mongoose'

interface IClientProps {
  client: string | Schema.Types.ObjectId
  num?: string
  auctionNum?: string
  agreement?: string | Schema.Types.ObjectId
  directiveAgreement?: boolean
}

export class Client {
  client: string
  num?: string
  directiveAgreement: boolean = false
  auctionNum?: string
  agreement?: string | Schema.Types.ObjectId
  constructor(props: IClientProps) {
    this.client = props.client?.toString()
    this.num = props.num
    this.auctionNum = props.auctionNum
    this.directiveAgreement = props.directiveAgreement || false
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
      directiveAgreement: this.directiveAgreement,
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
      directiveAgreement: {
        type: Boolean,
        default: false,
      },
      agreement: {
        type: Schema.Types.ObjectId,
        ref: 'Agreement',
      },
    }
  }
}
