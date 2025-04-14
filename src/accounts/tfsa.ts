import type { TransactionReturn } from './types';
import { Account } from './types';

const contributionLimitPerYear = 5000;

export class TFSA extends Account {
  contributionLimitRemaining = contributionLimitPerYear;

  // @NonNegativeFirstArg
  addMoney(amount: number): TransactionReturn {
    this.value += amount;
    this.contributionLimitRemaining -= amount;
    if (this.contributionLimitRemaining < 0) {
      throw Error('Exceeded TFSA contribution limit');
    }
    return {
      moneyOut: -amount,
      taxableIncome: 0,
      employmentIncome: 0,
      realizedCapitalGains: 0,
    };
  }

  withdrawal(amount: number): TransactionReturn {
    this.value -= amount;
    this.contributionLimitRemaining += amount;
    if (this.value < 0) {
      throw Error('Exceeded possible withdrawal from TFSA');
    }
    return {
      moneyOut: amount,
      taxableIncome: 0,
      employmentIncome: 0,
      realizedCapitalGains: 0,
    };
  }

  newYear() {
    super.newYear();
    this.contributionLimitRemaining += contributionLimitPerYear;
  }
}
