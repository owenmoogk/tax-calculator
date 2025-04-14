import type { TransactionReturn } from '../accounts/types';

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

export function calculateTaxOwed(
  income: number,
  capitalGains: number
): TransactionReturn {
  if (capitalGains < 0) {
    throw new Error("Can't claim a negative income.");
  }
  let totalTax = 0;
  totalTax += applyTax(
    income,
    capitalGains,
    capitalGainsInclusionRateCanada,
    canadaTaxBrackets
  );
  totalTax += applyTax(
    income,
    capitalGains,
    capitalGainsInclusionRateOntario,
    ontarioTaxBrackets
  );

  return {
    moneyOut: -totalTax,
    taxableIncome: -income,
    realizedCapitalGains: -capitalGains,
  };
}
