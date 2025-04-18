import type { TransactionReturn } from './types';
import { logger } from '../logger';
import type { NetValues } from '../simulator';

type TaxBracket = {
  lowerBound: number;
  upperBound: number;
  rate: number;
};

const ontarioTaxBrackets: TaxBracket[] = [
  { lowerBound: 0, upperBound: 52886, rate: 0.0505 },
  { lowerBound: 52886, upperBound: 105775, rate: 0.0915 },
  { lowerBound: 105775, upperBound: 150000, rate: 0.1116 },
  { lowerBound: 150000, upperBound: 220000, rate: 0.1216 },
  { lowerBound: 220000, upperBound: Infinity, rate: 0.1316 },
];

const canadaTaxBrackets: TaxBracket[] = [
  { lowerBound: 0, upperBound: 57375, rate: 0.15 },
  { lowerBound: 57375, upperBound: 114750, rate: 0.205 },
  { lowerBound: 114750, upperBound: 177882, rate: 0.26 },
  { lowerBound: 177882, upperBound: 253414, rate: 0.29 },
  { lowerBound: 253414, upperBound: Infinity, rate: 0.333 },
];

const capitalGainsInclusionRateCanada = 0.5;
const capitalGainsInclusionRateOntario = 0.5;
const EIRate = 0.0163;
const MEI = 65600;

export class Government {
  inflationFraction: number;
  netInflation = 1;
  MEI = MEI;

  constructor(avgInflation: number) {
    this.inflationFraction = avgInflation;
  }

  calculateTotalTax(netValues: NetValues): number {
    const { federalTax, provincialTax, eiCost } =
      this.calculateTaxPaymentsByCategory(netValues);
    return federalTax + provincialTax + eiCost;
  }

  payTax(year: number, netValues: NetValues): TransactionReturn {
    const taxableIncomeForLogging = netValues.taxableIncome;
    if (netValues.capitalGains < 0 || netValues.taxableIncome < 0) {
      throw new Error("Can't claim a negative income.");
    }
    const { federalTax, provincialTax, eiCost } =
      this.calculateTaxPaymentsByCategory(netValues);
    logger.log(year, 'EI Cost', eiCost);
    logger.log(year, 'Provincial Tax', provincialTax);
    logger.log(year, 'Federal Tax', federalTax);
    logger.log(year, 'Total Tax', provincialTax + federalTax);
    logger.log(
      year,
      'Average Tax (Percent)',
      ((provincialTax + federalTax) / taxableIncomeForLogging) * 100
    );

    const totalCharge = provincialTax + federalTax + eiCost;

    return {
      moneyOut: -totalCharge,
      employmentIncome: 0,
      taxableIncome: -netValues.taxableIncome,
      realizedCapitalGains: -netValues.capitalGains,
    };
  }

  newYear() {
    this.netInflation *= this.inflationFraction + 1;
    this.MEI *= this.inflationFraction + 1;
  }

  private calculateTaxPaymentsByCategory(netValues: NetValues) {
    const federalTax = this.applyTax(
      netValues.taxableIncome,
      netValues.capitalGains,
      capitalGainsInclusionRateCanada,
      canadaTaxBrackets
    );

    const provincialTax = this.applyTax(
      netValues.taxableIncome,
      netValues.capitalGains,
      capitalGainsInclusionRateOntario,
      ontarioTaxBrackets
    );
    const eiCost = this.calculateEI(netValues.employmentIncome);

    return { federalTax, provincialTax, eiCost };
  }

  private applyTax(
    income: number,
    capitalGains: number,
    capitalGainsInclusionRate: number,
    taxBrackets: TaxBracket[]
  ) {
    let totalTax = 0;
    income += capitalGains * capitalGainsInclusionRate;
    for (const bracket of taxBrackets) {
      if (income > bracket.upperBound * this.netInflation) {
        totalTax +=
          (bracket.upperBound * this.netInflation -
            bracket.lowerBound * this.netInflation) *
          bracket.rate;
      } else {
        totalTax +=
          (income - bracket.lowerBound * this.netInflation) * bracket.rate;
        break;
      }
    }
    return totalTax;
  }

  private calculateEI(income: number) {
    if (income > this.MEI) {
      income = this.MEI;
    }
    return income * EIRate;
  }
}
