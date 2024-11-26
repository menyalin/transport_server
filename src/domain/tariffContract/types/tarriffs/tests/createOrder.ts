import { Order } from '@/domain/order/order.domain'
import { OrderReqTransport } from '@/domain/order/reqTransport'
import { RoutePoint } from '@/domain/order/route/routePoint'
import { Types } from 'mongoose'

export const createTestOrder = (args: object): Order => {
  const mockObjectId = new Types.ObjectId().toString()
  return new Order({
    client: {
      client: mockObjectId,
    },
    reqTransport: new OrderReqTransport({
      kind: 'ref',
      liftCapacity: 20,
      loadDirection: 'rear',
    }),
    confirmedCrew: {
      truck: mockObjectId,
    },
    state: {
      status: 'inProgress',
    },
    company: mockObjectId,
    _id: mockObjectId,
    route: [
      new RoutePoint({
        type: 'loading',
        address: mockObjectId,
        plannedDate: new Date('2024-01-01'),
      }),
      new RoutePoint({
        type: 'unloading',
        address: mockObjectId,
        plannedDate: new Date('2024-01-01'),
      }),
    ],
    ...args,
  })
}
