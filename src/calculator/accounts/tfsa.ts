import { logger } from '../logger';
import type { TransactionReturn } from './types';
import { Account } from './types';

const contributionLimitPerYear = 5000;

export class TFSA extends Account {
  contributionLimitRemaining = contributionLimitPerYear;

  addMoney(year: number, amount: number): TransactionReturn {
    if (amount > this.contributionLimitRemaining) {
      amount = this.contributionLimitRemaining;
    }
    this.value += amount;
    this.contributionLimitRemaining -= amount;
    logger.log(year, 'TFSA Contribution', amount);
    return {
      moneyOut: -amount,
      taxableIncome: 0,
      employmentIncome: 0,
      realizedCapitalGains: 0,
    };
  }

  withdrawal(amount: number): TransactionReturn {
    if (amount > this.value) {
      amount = this.value;
    }
    this.value -= amount;
    this.contributionLimitRemaining += amount;
    return {
      moneyOut: amount,
      taxableIncome: 0,
      employmentIncome: 0,
      realizedCapitalGains: 0,
    };
  }

  newYear() {
    super.newYear();
    this.contributionLimitRemaining +=
      contributionLimitPerYear * this.netInflation;
  }
}
