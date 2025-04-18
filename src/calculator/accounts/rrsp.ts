import type { TransactionReturn } from './types';
import { Account } from './types';

const contributionRoomMultiplier = 0.18;
const maxContributionRoomPerYear = 31560;

export class RRSP extends Account {
  contributionRoom = 0;

  increaseContributionRoom(grossIncome: number) {
    this.contributionRoom += Math.min(
      grossIncome * contributionRoomMultiplier,
      maxContributionRoomPerYear * this.netInflation
    );
  }

  // @NonNegativeFirstArg
  addMoney(amount: number): TransactionReturn {
    if (amount > this.contributionRoom)
      throw Error('Cannot exceed contribution room in RRSP');
    this.value += amount;
    this.contributionRoom -= amount;
    return {
      moneyOut: -amount,
      employmentIncome: 0,
      taxableIncome: -amount,
      realizedCapitalGains: 0,
    };
  }

  withdrawal(amount: number): TransactionReturn {
    if (amount > this.value)
      throw Error('Cannot withdrawal more than exists in RRSP');
    this.value -= amount;
    return {
      moneyOut: amount,
      employmentIncome: 0,
      taxableIncome: amount,
      realizedCapitalGains: 0,
    };
  }
}
