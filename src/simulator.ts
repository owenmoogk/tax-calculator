import { logger } from './logger';
import { instantiateAccounts } from './instantiateAccounts';
import type { TransactionReturn } from './accounts/types';
import type { SimulationParameters } from '.';

const retirementAge = 65;

export function simulate(simulationParameters: SimulationParameters) {
  const { resp, cpp, oas, employer, rrsp, tfsa, nonRegistered, government } =
    instantiateAccounts(simulationParameters);

  const { startingCalendarYear, averageInflation, stages } =
    simulationParameters;

  const startAge = stages[0].startAge;
  const endAge = stages.at(-1)?.endAge;
  if (!endAge) throw Error('Must have at least one stage');

  let netValues: NetValues = {
    employmentIncome: 0,
    taxableIncome: 0,
    capitalGains: 0,
    cash: 0,
  };

  let netInflation = 1;
  let currentStageIndex = 0;
  for (let year = 0; year < endAge - startAge; year++) {
    const calendarYear = startingCalendarYear + year;
    const age = startAge + year;
    while (age >= stages[currentStageIndex].endAge) {
      currentStageIndex += 1;
    }
    const currentStage = stages[currentStageIndex];

    // WITHDRAWING FROM RESP
    if (currentStage.respWithdrawalPercent) {
      netValues = applyTransaction(
        resp.withdrawal(resp.value * currentStage.respWithdrawalPercent(age)),
        netValues
      );
    }

    // IF WORKING
    if (currentStage.employerParams) {
      netValues = applyTransaction(
        employer.yearlyPaycheck(year, currentStage.employerParams.grossIncome),
        netValues
      );
    }

    // IF RETIRED
    if (age >= retirementAge) {
      netValues = applyTransaction(cpp.withdrawal(year), netValues);
      netValues = applyTransaction(
        oas.withdrawal(year, netValues.taxableIncome),
        netValues
      );
    }

    const inflationAccountedLivingExpenses =
      currentStage.livingExpenses * netInflation;
    netValues.cash -= inflationAccountedLivingExpenses;
    logger.log(year, 'Living Expenses', inflationAccountedLivingExpenses);

    // INVEST
    const totalEmergencyCash = currentStage.allocations.totalEmergencyCash;
    if (netValues.cash > currentStage.allocations.totalEmergencyCash) {
      netValues = applyTransaction(
        tfsa.addMoney(
          Math.min(
            tfsa.contributionLimitRemaining *
              currentStage.allocations.tfsa(age),
            netValues.cash - totalEmergencyCash
          )
        ),
        netValues
      );

      netValues = applyTransaction(
        rrsp.addMoney(
          Math.min(
            rrsp.contributionRoom * currentStage.allocations.rrsp(age),
            netValues.cash - totalEmergencyCash
          )
        ),
        netValues
      );

      netValues = applyTransaction(
        nonRegistered.addMoney(
          Math.max(netValues.cash - totalEmergencyCash, 0)
        ),
        netValues
      );
    }

    // PAY TAX
    rrsp.increaseContributionRoom(netValues.employmentIncome);
    netValues = applyTransaction(government.payTax(year, netValues), netValues);

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
    cpp.newYear();
    oas.newYear();
    government.newYear();
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
