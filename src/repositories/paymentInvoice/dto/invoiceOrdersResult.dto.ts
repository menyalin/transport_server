import { OrderPickedForInvoiceDTO } from '@/domain/paymentInvoice/dto/orderPickedForInvoice.dto'

export class InvoiceOrdersResultDTO {
  totalCount: number = 0
  totalPrice: number = 0
  totalPriceWOVat: number = 0
  items: OrderPickedForInvoiceDTO[]

  constructor(p: any) {
    this.totalCount = p.total?.[0]?.count ?? 0
    this.totalPrice = p.total?.[0]?.withVat ?? 0
    this.totalPriceWOVat = p.total?.[0]?.woVat ?? 0

    this.items = (p.items ?? []).map(
      (i: any) => new OrderPickedForInvoiceDTO(i)
    )
  }
}
