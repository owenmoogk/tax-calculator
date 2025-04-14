import { logger } from './logger';
import { calculateTaxOwed } from './tax/tax';
import { instantiateAccounts } from './instantiateAccounts';
import type { TransactionReturn } from './accounts/types';
import type { SimulationParameters } from '.';

export function simulate(simulationParameters: SimulationParameters) {
  const { resp, cpp, employer, rrsp, tfsa, nonRegistered } =
    instantiateAccounts(simulationParameters);

  const {
    startingAge,
    deathAge,
    startingCalendarYear,
    schoolToEmploymentAge,
    retirementAge,
    averageInflation,
  } = simulationParameters;

  let netValues: NetValues = {
    employmentIncome: 0,
    taxableIncome: 0,
    capitalGains: 0,
    cash: 0,
  };

  let netInflation = 1;

  for (let year = 0; year <= deathAge - startingAge; year++) {
    const calendarYear = startingCalendarYear + year;
    const age = startingAge + year;

    // IF IN SCHOOL
    if (age < schoolToEmploymentAge) {
      netValues = applyTransaction(
        resp.withdrawal(resp.value / (schoolToEmploymentAge - age)),
        netValues
      );
    }

    // IF WORKING
    if (age >= schoolToEmploymentAge && age < retirementAge) {
      netValues = applyTransaction(employer.yearlyPaycheck(year), netValues);
    }

    // IF RETIRED
    if (age >= retirementAge) {
      netValues = applyTransaction(cpp.withdrawal(year), netValues);
    }

    const inflationAccountedLivingExpenses =
      simulationParameters.livingExpenses * netInflation;
    netValues.cash -= inflationAccountedLivingExpenses;

    // INVEST
    if (netValues.cash > 0) {
      netValues = applyTransaction(
        tfsa.addMoney(
          Math.min(tfsa.contributionLimitRemaining, netValues.cash)
        ),
        netValues
      );

      if (netValues.cash > 100e3) {
        netValues = applyTransaction(
          nonRegistered.addMoney(netValues.cash - 100e3),
          netValues
        );
      }
    }

    // PAY TAX
    netValues = applyTransaction(calculateTaxOwed(year, netValues), netValues);

    if (netValues.capitalGains !== 0 || netValues.taxableIncome !== 0) {
      throw Error("Post tax values should be zero'd");
    }

    if (age < retirementAge) {
      netValues = applyTransaction(
        cpp.contribute(year, netValues.employmentIncome),
        netValues
      );
    }

    logger.record(
      year,
      age,
      calendarYear,
      tfsa.value,
      rrsp.value,
      resp.value,
      nonRegistered.value,
      netValues.cash
    );

    // RESET LIMITS
    tfsa.newYear();
    rrsp.newYear();
    resp.newYear();
    nonRegistered.newYear();
    netInflation *= averageInflation + 1;
    netValues.employmentIncome = 0;
  }
  logger.exportSimulation();
}

export type NetValues = {
  employmentIncome: number;
  taxableIncome: number;
  capitalGains: number;
  cash: number;
};

function applyTransaction(
  transaction: TransactionReturn,
  netValues: NetValues
): NetValues {
  return {
    cash: netValues.cash + transaction.moneyOut,
    employmentIncome: netValues.employmentIncome + transaction.employmentIncome,
    taxableIncome: netValues.taxableIncome + transaction.taxableIncome,
    capitalGains: netValues.capitalGains + transaction.realizedCapitalGains,
  };
}
