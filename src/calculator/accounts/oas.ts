import { logger } from '../logger';
import type { TransactionReturn } from './types';

const OASClawbackThreshold = 90997;
const maxOAS = 8739;

export class OAS {
  inflation: number;
  netInflation = 1;

  constructor(averageInflation: number) {
    this.inflation = averageInflation;
  }

  withdrawal(year: number, netIncome: number): TransactionReturn {
    const clawbackThreshold = OASClawbackThreshold * this.netInflation;
    const inflationAdjustedMaximumOAS = maxOAS * this.netInflation;
    const fullNetIncome = netIncome + inflationAdjustedMaximumOAS;
    let oasPayment: number;
    if (fullNetIncome > clawbackThreshold) {
      const excessIncome = fullNetIncome - clawbackThreshold;
      const oasClawback = excessIncome * 0.15;
      oasPayment = Math.max(0, inflationAdjustedMaximumOAS - oasClawback);
    } else {
      oasPayment = inflationAdjustedMaximumOAS;
    }

    logger.log(year, 'OAS Payment', oasPayment);

    return {
      moneyOut: oasPayment,
      employmentIncome: 0,
      taxableIncome: oasPayment,
      realizedCapitalGains: 0,
    };
  }

  newYear() {
    this.netInflation *= 1 + this.inflation;
  }
}
