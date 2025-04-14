import type { TransactionReturn } from '../accounts/types';
import { logger } from '../logger';
import type { NetValues } from '../simulator';

type TaxBracket = {
  lowerBound: number;
  upperBound: number;
  rate: number;
};

const ontarioTaxBrackets: TaxBracket[] = [
  { lowerBound: 0, upperBound: 51446, rate: 0.0505 },
  { lowerBound: 51446, upperBound: 102894, rate: 0.0915 },
  { lowerBound: 102894, upperBound: 150000, rate: 0.1116 },
  { lowerBound: 150000, upperBound: 220000, rate: 0.1216 },
  { lowerBound: 220000, upperBound: Infinity, rate: 0.1316 },
];

const canadaTaxBrackets: TaxBracket[] = [
  { lowerBound: 0, upperBound: 55867, rate: 0.15 },
  { lowerBound: 55867, upperBound: 111733, rate: 0.205 },
  { lowerBound: 111733, upperBound: 173205, rate: 0.26 },
  { lowerBound: 173205, upperBound: 246752, rate: 0.29 },
  { lowerBound: 246752, upperBound: Infinity, rate: 0.333 },
];

const capitalGainsInclusionRateCanada = 0.5;
const capitalGainsInclusionRateOntario = 0.5;

function applyTax(
  year: number,
  income: number,
  capitalGains: number,
  capitalGainsInclusionRate: number,
  taxBrackets: TaxBracket[]
) {
  let totalTax = 0;
  income += capitalGains * capitalGainsInclusionRate;
  for (const bracket of taxBrackets) {
    if (income > bracket.upperBound) {
      totalTax += (bracket.upperBound - bracket.lowerBound) * bracket.rate;
    } else {
      totalTax += (income - bracket.lowerBound) * bracket.rate;
      break;
    }
  }
  return totalTax;
}

const EIRate = 0.0163;
const MEI = 65600;
function calculateEI(income: number) {
  if (income > MEI) {
    income = MEI;
  }
  return income * EIRate;
}

export function calculateTaxOwed(
  year: number,
  netValues: NetValues
): TransactionReturn {
  if (netValues.capitalGains < 0 || netValues.taxableIncome < 0) {
    throw new Error("Can't claim a negative income.");
  }
  const federalTax = applyTax(
    year,
    netValues.taxableIncome,
    netValues.capitalGains,
    capitalGainsInclusionRateCanada,
    canadaTaxBrackets
  );
  const provincialTax = applyTax(
    year,
    netValues.taxableIncome,
    netValues.capitalGains,
    capitalGainsInclusionRateOntario,
    ontarioTaxBrackets
  );

  const eiCost = calculateEI(netValues.employmentIncome);

  logger.log(year, 'EI Cost', eiCost);
  logger.log(year, 'Provincial Tax', provincialTax);
  logger.log(year, 'Federal Tax', federalTax);
  logger.log(year, 'Provincial Tax', provincialTax + federalTax);

  const totalCharge = provincialTax + federalTax + eiCost;

  return {
    moneyOut: -totalCharge,
    employmentIncome: 0,
    taxableIncome: -netValues.taxableIncome,
    realizedCapitalGains: -netValues.capitalGains,
  };
}
