export type TransactionReturn = {
  moneyOut: number;
  employmentIncome: number;
  taxableIncome: number;
  realizedCapitalGains: number;
};

export abstract class Account {
  value = 0;
  year = 0;
  interest: number;
  inflationFraction: number;
  netInflation: number;

  constructor(interest: number, inflation: number) {
    this.interest = interest;
    this.netInflation = 1;
    this.inflationFraction = inflation;
  }

  newYear() {
    this.value *= this.interest + 1;
    this.netInflation *= this.inflationFraction + 1;
    this.year += 1;
  }

  abstract addMoney(year: number, amount: number): TransactionReturn;
  abstract withdrawal(amount: number): TransactionReturn;
}
