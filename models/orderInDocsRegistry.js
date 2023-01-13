import pkg from 'mongoose'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    order: { type: Types.ObjectId, ref: 'Order', required: true, unique: true},
    docsRegistry: { type: Types.ObjectId, ref: 'DocsRegistry', required: true},
  },
  { timestamps: true }
)

export default model('OrderInDocsRegistry', schema, 'ordersInDocsRegistries')
