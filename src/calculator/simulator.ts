import { logger } from './logger';
import { instantiateAccounts } from './instantiateAccounts';
import type { TransactionReturn } from './accounts/types';
import type { SimulationParameters } from '.';

const governmentImposedRetirementAge = 65;

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

    if (age === 48) {
      console.log('Breakpoint');
    }

    // 1. Employment Income
    if (currentStage.employerParams) {
      netValues = applyTransaction(
        employer.yearlyPaycheck(year, currentStage.employerParams.grossIncome),
        netValues
      );
    }

    // 2. RESP Income
    if (currentStage.respWithdrawalPercent) {
      netValues = applyTransaction(
        resp.withdrawal(resp.value * currentStage.respWithdrawalPercent(age)),
        netValues
      );
    }

    // 3. Retirement Income
    if (age >= governmentImposedRetirementAge) {
      netValues = applyTransaction(cpp.withdrawal(year), netValues);
      netValues = applyTransaction(
        oas.withdrawal(year, netValues.taxableIncome),
        netValues
      );
    }
    if (currentStage.rrspMaxPreferrableWithdrawal) {
      netValues = applyTransaction(
        rrsp.withdrawal(
          currentStage.rrspMaxPreferrableWithdrawal(age) * netInflation
        ),
        netValues
      );
    }

    // 4. CPP Contribution
    if (age < governmentImposedRetirementAge) {
      netValues = applyTransaction(
        cpp.contribute(year, netValues.employmentIncome),
        netValues
      );
    }

    // 5. Approximate Taxation After Income
    const approximateTax = government.calculateTotalTax(netValues);

    // 6. Living Expenses
    const inflationAccountedLivingExpenses =
      currentStage.livingExpenses * netInflation;
    netValues.cash -= inflationAccountedLivingExpenses;
    logger.log(year, 'Living Expenses', inflationAccountedLivingExpenses);

    // 7. Calculate Net Cashflow (in/out of investments)
    const totalEmergencyCash =
      currentStage.allocations.totalEmergencyCash * netInflation;
    const targetCash = totalEmergencyCash + approximateTax;

    // 8. Invest or withdraw to hit target cash
    if (netValues.cash < targetCash) {
      netValues = applyTransaction(
        tfsa.withdrawal(targetCash - netValues.cash),
        netValues
      );
      if (netValues.cash < targetCash) {
        netValues = applyTransaction(
          rrsp.withdrawal(targetCash - netValues.cash),
          netValues
        );
      }
    } else {
      netValues = applyTransaction(
        tfsa.addMoney(
          year,
          Math.min(
            tfsa.contributionLimitRemaining *
              currentStage.allocations.tfsa(age),
            Math.max(netValues.cash - targetCash, 0)
          )
        ),
        netValues
      );
      if (age < governmentImposedRetirementAge) {
        netValues = applyTransaction(
          rrsp.addMoney(
            year,
            Math.min(
              netValues.taxableIncome *
                currentStage.allocations.rrspPercentOfIncome(age),
              netValues.cash - targetCash
            )
          ),
          netValues
        );
      }
      netValues = applyTransaction(
        nonRegistered.addMoney(Math.max(netValues.cash - targetCash, 0)),
        netValues
      );
    }

    // 9. Pay Tax
    rrsp.increaseContributionRoom(netValues.employmentIncome);
    netValues = applyTransaction(government.payTax(year, netValues), netValues);

    if (netValues.capitalGains !== 0 || netValues.taxableIncome !== 0) {
      throw Error("Post tax values should be zero'd");
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

    // 10. Reset Limits
    if (
      netValues.cash < 0 ||
      tfsa.value < 0 ||
      rrsp.value < 0 ||
      resp.value < 0 ||
      nonRegistered.value < 0
    ) {
      throw Error('An account is negative!');
    }
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

  const results = logger.records;
  logger.reset();

  netValues = applyTransaction(tfsa.withdrawal(tfsa.value), netValues);
  netValues = applyTransaction(rrsp.withdrawal(rrsp.value), netValues);
  netValues = applyTransaction(
    nonRegistered.withdrawal(nonRegistered.value),
    netValues
  );
  // ASSUMING RESP IS EMPTY, OTHERWISE EMPTY IT TOO
  netValues = applyTransaction(
    government.payTax(endAge - startAge, netValues),
    netValues
  );

  if (
    tfsa.value !== 0 ||
    rrsp.value !== 0 ||
    resp.value !== 0 ||
    nonRegistered.value !== 0
  ) {
    throw Error("An account isn't zero'd after death!");
  }

  const estateValue = netValues.cash;

  return { results, estateValue };
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
