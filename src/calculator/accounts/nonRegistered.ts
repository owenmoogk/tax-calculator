import { Account, TransactionReturn } from "./types";

export class NonRegistered extends Account{

    bookCost = 0

    addMoney(amount: number): TransactionReturn {
      this.value += amount
      this.bookCost += amount
      return { moneyOut: -amount, employmentIncome: 0, taxableIncome: 0, realizedCapitalGains: 0}
    }

    withdrawal(amount: number): TransactionReturn{
      if (amount > this.value) {amount = this.value}
      const fractionWithdrew = amount / this.value
      const totalCapitalGains = this.value - this.bookCost
      const claimedCapitalGains = totalCapitalGains * fractionWithdrew
      
      this.bookCost = this.bookCost * (1-fractionWithdrew)
      this.value -= amount;
      return { moneyOut: amount, employmentIncome: 0, taxableIncome: 0, realizedCapitalGains: claimedCapitalGains}
    }
}