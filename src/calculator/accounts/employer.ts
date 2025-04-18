import { logger } from '../logger';
import type { TransactionReturn } from './types';

export class Employer {
  inflation: number;
  constructor(avgInflation: number) {
    this.inflation = avgInflation;
  }

  yearlyPaycheck(year: number, startingIncome: number): TransactionReturn {
    const income = startingIncome * (1 + this.inflation) ** year;
    logger.log(year, 'Employment Income', income);
    return {
      moneyOut: income,
      employmentIncome: income,
      taxableIncome: income,
      realizedCapitalGains: 0,
    };
  }
}
