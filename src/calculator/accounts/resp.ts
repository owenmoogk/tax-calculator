import type { RESPParams } from '..';
import type { TransactionReturn } from './types';
import { Account } from './types';

const GovernmentMatchFraction = 0.2;
const GovernmentMatchMaximum = 2500;

export class RESP extends Account {
  EAPAmount: number;
  GovernmentMatched: number; // max 2500 per year (500 deposited)
  GovernmentMatchMaximum = GovernmentMatchMaximum;

  constructor(rp: RESPParams, interest: number, inflation: number) {
    super(interest, inflation);
    this.value = rp.initialValue;
    this.EAPAmount = rp.initialValue - rp.initialContributionSum;
    this.GovernmentMatched = 0;
  }

  addMoney(amount: number): TransactionReturn {
    this.value += amount;
    if (this.GovernmentMatched < this.GovernmentMatchMaximum) {
      if (amount + this.GovernmentMatched < this.GovernmentMatchMaximum) {
        const matchValue = amount * GovernmentMatchFraction;

        this.value += matchValue;
        this.EAPAmount += matchValue;

        this.GovernmentMatched += amount;
      } else {
        const valueToMatch =
          this.GovernmentMatchMaximum - this.GovernmentMatched;
        const matchValue = valueToMatch * GovernmentMatchFraction;

        this.value += valueToMatch;
        this.EAPAmount += matchValue;

        this.GovernmentMatched += amount;
      }
    }
    return {
      moneyOut: -amount,
      employmentIncome: 0,
      taxableIncome: 0,
      realizedCapitalGains: 0,
    };
  }

  withdrawal(amount: number): TransactionReturn {
    if (amount > this.value) {
      amount = this.value;
    }
    const eapFraction = this.EAPAmount / this.value;
    this.EAPAmount -= amount * eapFraction;
    this.value -= amount;

    return {
      moneyOut: amount,
      employmentIncome: 0,
      taxableIncome: amount * eapFraction,
      realizedCapitalGains: 0,
    };
  }

  newYear() {
    super.newYear();
    this.GovernmentMatchMaximum = GovernmentMatchMaximum * this.netInflation;
    this.GovernmentMatched = 0;
  }
}
