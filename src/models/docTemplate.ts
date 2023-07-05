import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    name: { type: String, required: true },
    filenamePattern: { type: String, required: true },
    file: { type: String, required: true },
    clients: [{ type: Types.ObjectId, ref: 'Partner', required: true }],
    companies: [{ type: Types.ObjectId, ref: 'Company' }],
    type: { type: String, required: true, enum: ['paymentInvoice'] },
    note: String,
  },
  { timestamps: true }
)

export default model('DocTemplate', schema, 'docTemplates')
