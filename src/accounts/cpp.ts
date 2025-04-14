import { logger } from '../logger';
import type { TransactionReturn } from './types';

const initialYMPE = 71600;
const initialYAMPE = 80400;
const initialBasicExemption = 3500;
const baseCPPRate = 0.0595;
const enhancedCPPRate = 0.04;

export class CPP {
  private inflationRate: number;
  private ympe: number;
  private yampe: number;
  private currentBasicExemption: number;
  private contributions: { YPE: number; ympe: number }[] = [];

  constructor(inflationRate: number) {
    this.inflationRate = inflationRate;
    this.ympe = initialYMPE;
    this.yampe = initialYAMPE;
    this.currentBasicExemption = initialBasicExemption;
  }

  newYear(): void {
    this.ympe *= 1 + this.inflationRate;
    this.yampe *= 1 + this.inflationRate;
    this.currentBasicExemption *= 1 + this.inflationRate;
  }

  contribute(year: number, employmentIncome: number): TransactionReturn {
    const pensionableEarnings = Math.min(employmentIncome, this.ympe);
    const baseContributoryEarnings = Math.max(
      0,
      pensionableEarnings - this.currentBasicExemption
    );
    const baseCPPPayment = baseContributoryEarnings * baseCPPRate;

    const enhancedContributoryEarnings = Math.max(
      0,
      Math.min(employmentIncome, this.yampe) - this.ympe
    );
    const enhancedCPPPayment = enhancedContributoryEarnings * enhancedCPPRate;

    this.contributions.push({
      YPE: pensionableEarnings,
      ympe: this.ympe,
    });

    const totalContribution = baseCPPPayment + enhancedCPPPayment;
    logger.log(year, 'CPP Contribution', totalContribution);

    return {
      moneyOut: -totalContribution,
      employmentIncome: 0,
      taxableIncome: 0,
      realizedCapitalGains: 0,
    };
  }

  withdrawal(year: number): TransactionReturn {
    if (this.contributions.length === 0) {
      return {
        moneyOut: 0,
        employmentIncome: 0,
        taxableIncome: 0,
        realizedCapitalGains: 0,
      };
    }
    const N = this.contributions.length;

    // Average YMPE of the last five contribution years (or all if fewer than 5)
    const lastFiveYmpe = this.contributions
      .slice(Math.max(0, N - 5))
      .map((c) => c.ympe);
    const averageYmpeRetirement =
      lastFiveYmpe.reduce((sum, ympe) => sum + ympe, 0) / lastFiveYmpe.length;

    // Adjust each year's pensionable earnings to retirement-year dollars
    const adjustedYPEs = this.contributions.map(
      (c) => c.YPE * (averageYmpeRetirement / c.ympe)
    );

    // Apply the 17% dropout rule
    const dropoutYears = Math.floor(0.17 * N);
    const yearsToInclude = Math.max(1, N - dropoutYears);
    const sortedAdjustedYPEs = [...adjustedYPEs].sort((a, b) => b - a);
    const topAdjustedYPEs = sortedAdjustedYPEs.slice(0, yearsToInclude);

    // Calculate Average Pensionable Earnings (APE)
    const APE =
      topAdjustedYPEs.reduce((sum, ype) => sum + ype, 0) / yearsToInclude;

    // CPP pension is 25% of APE
    const annualPension = 0.25 * APE;

    logger.log(year, 'CPP Withdrawal', annualPension);

    return {
      moneyOut: annualPension,
      employmentIncome: 0,
      taxableIncome: annualPension,
      realizedCapitalGains: 0,
    };
  }
}
