import type { EmployerParams } from '..';
import { logger } from '../logger';
import type { TransactionReturn } from './types';

export class Employer {
  baseIncome: number;
  inflation: number;
  constructor(ep: EmployerParams, avgInflation: number) {
    this.inflation = avgInflation;
    this.baseIncome = ep.grossIncome;
  }

  yearlyPaycheck(year: number): TransactionReturn {
    const income = this.baseIncome * (1 + this.inflation) ** year;
    logger.log(year, 'Employment Income', income);
    return {
      moneyOut: income,
      employmentIncome: income,
      taxableIncome: income,
      realizedCapitalGains: 0,
    };
  }
}
