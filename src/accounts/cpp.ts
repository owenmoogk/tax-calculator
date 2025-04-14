import { logger } from '../logger';
import type { TransactionReturn } from './types';

const yearBasicExemption = 3500;
const YMPE = 71600;
const YAMPE = 80400;
const baseCPPRate = 0.0595;
const enhancedCPPRate = 0.04;

export class CPP {
  contributions: { YPE: number; ympe: number }[] = [];

  contribute(year: number, income: number): TransactionReturn {
    const pensionableEarnings = Math.min(income, YMPE);
    const baseContributoryEarnings = Math.max(
      0,
      pensionableEarnings - yearBasicExemption
    );
    const baseCPPPayment = baseContributoryEarnings * baseCPPRate;

    const enhancedContributoryEarnings = Math.max(
      0,
      Math.min(income, YAMPE) - YMPE
    );
    const enhancedCPPPayment = enhancedContributoryEarnings * enhancedCPPRate;

    this.contributions.push({ YPE: pensionableEarnings, ympe: YMPE });

    logger.log(year, 'CPP Contribution', baseCPPPayment + enhancedCPPPayment);

    return {
      moneyOut: -(baseCPPPayment + enhancedCPPPayment),
      taxableIncome: 0,
      realizedCapitalGains: 0,
    };
  }

  withdrawal(year: number): TransactionReturn {
    if (this.contributions.length === 0) {
      return { moneyOut: 0, taxableIncome: 0, realizedCapitalGains: 0 };
    }
    const N = this.contributions.length;

    // Determine the average YMPE of the last five contribution years (or all if less than 5)
    const lastFiveYmpe = this.contributions
      .slice(Math.max(0, N - 5))
      .map((c) => c.ympe);
    const averageYmpeRetirement =
      lastFiveYmpe.reduce((sum, ympe) => sum + ympe, 0) / lastFiveYmpe.length;

    // Adjust each year's pensionable earnings to retirement-year dollars
    const adjustedYPEs = this.contributions.map(
      (c) => c.YPE * (averageYmpeRetirement / c.ympe)
    );

    // Apply the 17% dropout rule: exclude the lowest 17% of years
    const dropoutYears = Math.floor(0.17 * N);
    const yearsToInclude = Math.max(1, N - dropoutYears); // Ensure at least one year is included
    const sortedAdjustedYPEs = [...adjustedYPEs].sort((a, b) => b - a); // Descending order
    const topAdjustedYPEs = sortedAdjustedYPEs.slice(0, yearsToInclude);

    // Calculate Average Pensionable Earnings (APE)
    const APE =
      topAdjustedYPEs.reduce((sum, ype) => sum + ype, 0) / yearsToInclude;

    // Base CPP pension: 25% of APE
    const annualPension = 0.25 * APE;

    logger.log(year, 'CPP Withdrawal', annualPension);

    return {
      moneyOut: annualPension,
      taxableIncome: annualPension,
      realizedCapitalGains: 0,
    };
  }
}
