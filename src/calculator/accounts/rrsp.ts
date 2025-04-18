import { logger } from '../logger';
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

  addMoney(year: number, amount: number): TransactionReturn {
    if (amount < 0) amount = 0;
    if (amount > this.contributionRoom) amount = this.contributionRoom;
    this.value += amount;
    this.contributionRoom -= amount;
    logger.log(year, 'RRSP Contribution', amount);
    return {
      moneyOut: -amount,
      employmentIncome: 0,
      taxableIncome: -amount,
      realizedCapitalGains: 0,
    };
  }

  withdrawal(amount: number): TransactionReturn {
    if (amount > this.value) {
      amount = this.value;
    }
    this.value -= amount;
    return {
      moneyOut: amount,
      employmentIncome: 0,
      taxableIncome: amount,
      realizedCapitalGains: 0,
    };
  }
}
