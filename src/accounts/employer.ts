import { logger } from '../logger';
import type { TransactionReturn } from './types';

export class Employer {
  yearlyPaycheck(year: number, income: number): TransactionReturn {
    logger.log(year, 'Employment Income', income);
    return {
      moneyOut: income,
      taxableIncome: income,
      realizedCapitalGains: 0,
    };
  }
}
