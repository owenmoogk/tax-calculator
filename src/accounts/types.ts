export type TransactionReturn = {
  moneyOut: number;
  taxableIncome: number;
  realizedCapitalGains: number;
};

export abstract class Account {
  value: number;
  interest: number;

  constructor(interest: number) {
    this.interest = interest;
    this.value = 0;
  }

  newYear() {
    this.value *= this.interest + 1;
  }

  abstract addMoney(amount: number): TransactionReturn;
  abstract withdrawal(amount: number): TransactionReturn;
}
