import { CURRENCY } from '../../constants/currency'

export class Money {
  private amount: number
  private currency: string

  constructor(amount: number, currency: string = CURRENCY.rub) {
    this.amount = amount
    this.currency = currency.toUpperCase()
  }

  equals(money: Money): boolean {
    return this.amount === money.amount && this.currency === money.currency
  }

  add(money: Money): Money {
    this.validateCurrency(money)
    return new Money(this.amount + money.amount, this.currency)
  }

  subtract(money: Money): Money {
    this.validateCurrency(money)
    return new Money(this.amount - money.amount, this.currency)
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency)
  }

  divide(divisor: number): Money {
    return new Money(this.amount / divisor, this.currency)
  }

  toString() {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount)
  }

  private validateCurrency(money: Money) {
    if (this.currency !== money.currency) {
      throw new Error('Different currencies cannot be added or subtracted')
    }
  }
}
