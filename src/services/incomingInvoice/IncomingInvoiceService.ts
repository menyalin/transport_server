import { IncomingInvoice, IncomingInvoiceOrder } from '@/domain/incomingInvoice'
import { CreateIncomingInvoiceDTO } from '@/domain/incomingInvoice/dto/createIncomingInvoice.dto'
import { Order } from '@/domain/order/order.domain'

import { bus } from '@/eventBus'
import { BadRequestError } from '@/helpers/errors'
import { OrderRepository } from '@/repositories'
import {
  GetListPropsDTO,
  IncomingInvoiceRepository,
  ListResultDTO,
} from '@/repositories/incomingInvoice'
import { EventBus } from 'ts-bus'
import { z } from 'zod'

interface IProps {
  incomingInvoiceRepository: typeof IncomingInvoiceRepository
  orderRepository: typeof OrderRepository
  bus: EventBus
}

class IncomingInvoiceService {
  incomingInvoiceRepository: typeof IncomingInvoiceRepository
  orderRepository: typeof OrderRepository
  bus: EventBus
  constructor({ incomingInvoiceRepository, bus }: IProps) {
    this.bus = bus
    this.incomingInvoiceRepository = incomingInvoiceRepository
    this.orderRepository = OrderRepository
  }

  async getList(queryParams: unknown): Promise<ListResultDTO> {
    const params = GetListPropsDTO.validationSchema.parse(queryParams)
    return await this.incomingInvoiceRepository.getList(
      new GetListPropsDTO(params)
    )
  }

  async getInvoiceOrders({
    invoiceId,
    limit,
    skip,
  }: {
    invoiceId: string
    limit?: number
    skip?: number
  }) {
    return await this.incomingInvoiceRepository.getInvoiceOrders(
      invoiceId,
      limit,
      skip
    )
  }

  async getById(id: string): Promise<IncomingInvoice | null> {
    return await this.incomingInvoiceRepository.getById(id)
  }

  async create(
    data: Omit<CreateIncomingInvoiceDTO, '_id'>
  ): Promise<IncomingInvoice> {
    const res = await this.incomingInvoiceRepository.create(data)
    return res
  }

  async updateOne(
    id: string,
    body: Omit<CreateIncomingInvoiceDTO, '_id'>
  ): Promise<IncomingInvoice> {
    const invoice = await this.incomingInvoiceRepository.getById(id)
    if (!invoice) throw new Error('Invoice not found')
    const events = invoice.update(body)
    events.forEach((event) => this.bus.publish(event))
    return invoice
  }

  async pickOrders(props: unknown) {
    const orders = await this.incomingInvoiceRepository.pickOrders(props)
    return orders
  }

  async addOrdersToInvoice(
    invoiceId: string,
    orderIds: string[]
  ): Promise<void> {
    const invoice = await this.incomingInvoiceRepository.getById(invoiceId)

    if (!invoice) throw new BadRequestError('Invoice not found')

    if (!invoice.allowedToChangeOrders)
      throw new BadRequestError('Добавление рейсов запрещено')

    if (invoice.hasOrders(orderIds))
      throw new BadRequestError('Акт уже содержит выбранные рейсы')

    const ordersInInvoice =
      await this.incomingInvoiceRepository.getByOrders(orderIds)

    if (ordersInInvoice.length > 0)
      throw new BadRequestError('Рейсы уже добавлены в другие акты')

    const res = await this.orderRepository.getList({
      profile: invoice.company,
      statuses: ['completed'],
      orders: orderIds,
      limit: orderIds.length.toString(),
      skip: '0',
    })

    if (res.items.length !== orderIds.length)
      throw new BadRequestError('Рейсы не найдены')

    const invoiceRows: IncomingInvoiceOrder[] = orderIds.map(
      (orderId: unknown) => {
        const order = res.items.find((o: any) => o?._id?.toString() === orderId)
        return IncomingInvoiceOrder.create(new Order(order), invoice._id)
      }
    )
    await this.incomingInvoiceRepository.addOrderToInvoice(invoiceRows)
    const events = invoice.pushOrders(invoiceRows)
    events.forEach((event) => this.bus.publish(event))
  }

  async removeOrdersFromInvoice(props: unknown): Promise<boolean> {
    const propsSchema = z.object({
      invoiceId: z.string(),
      orderIds: z.array(z.string()),
    })

    const p = propsSchema.parse(props)

    const invoice = await this.incomingInvoiceRepository.getById(p.invoiceId)
    if (!invoice) throw new BadRequestError('Invoice not found')

    if (!invoice.allowedToChangeOrders)
      throw new BadRequestError('Удаление рейсов запрещено')

    const events = invoice.removeOrders(p.orderIds)
    events.forEach((event) => this.bus.publish(event))

    return true
  }

  async deleteById(id: string, companyId?: string): Promise<boolean> {
    const invoice = await IncomingInvoiceRepository.getById(id)

    if (!invoice || !companyId || invoice.company.toString() !== companyId)
      return false

    if (invoice.hasOrders())
      throw new BadRequestError('Удаление акта не возможно, акт содержит рейсы')

    await IncomingInvoiceRepository.deleteById(id)
    return true
  }
}

export default new IncomingInvoiceService({
  incomingInvoiceRepository: IncomingInvoiceRepository,
  orderRepository: OrderRepository,
  bus,
})
