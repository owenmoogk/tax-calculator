import { CPP } from './accounts/cpp';
import { Employer } from './accounts/employer';
import { NonRegistered } from './accounts/non-registered';
import { RESP } from './accounts/resp';
import { RRSP } from './accounts/rrsp';
import { TFSA } from './accounts/tfsa';
import type { TransactionReturn } from './accounts/types';
import { logger } from './logger';
import { calculateTaxOwed } from './tax/tax';

// this is the first year you are in this bracket (ie. start working on jan of yr I'm 23)
export const startingYear = 2022;
const startingAge = 18;
const schoolToEmploymentAge = 23;
const retirementAge = 65;
const deathAge = 80;
const numberOfChildren = 0;

const initialRESPValue = 30e3;
const initialRESPContributionSum = 15e3;
const grossIncome = 150e3;
const livingExpenses = 50e3;

const averageInterest = 0.06;
const averageInflation = 0.02;

const resp = new RESP(
  initialRESPValue,
  initialRESPContributionSum,
  averageInterest
);
const cpp = new CPP();
const employer = new Employer();
const rrsp = new RRSP(averageInterest);
const tfsa = new TFSA(averageInterest);
const nonRegistered = new NonRegistered(averageInterest);

function applyTransaction(
  transaction: TransactionReturn,
  netValues: NetValues
) {
  return {
    cash: netValues.cash + transaction.moneyOut,
    taxableIncome: netValues.taxableIncome + transaction.taxableIncome,
    capitalGains: netValues.capitalGains + transaction.realizedCapitalGains,
  };
}

type NetValues = { taxableIncome: number; capitalGains: number; cash: number };

let netValues: NetValues = {
  taxableIncome: 0,
  capitalGains: 0,
  cash: 0,
};

export function simulate() {
  let netInflation = 1;

  for (let year = 0; year <= deathAge - startingAge; year++) {
    const calendarYear = startingYear + year;
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
      const inflationAccountedGrossIncome = grossIncome * netInflation;
      netValues = applyTransaction(
        employer.yearlyPaycheck(year, inflationAccountedGrossIncome),
        netValues
      );
    }

    // IF RETIRED
    if (age >= retirementAge) {
      netValues = applyTransaction(cpp.withdrawal(year), netValues);
    }

    const inflationAccountedLivingExpenses = livingExpenses * netInflation;
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
    netValues = applyTransaction(
      calculateTaxOwed(year, netValues.taxableIncome, netValues.capitalGains),
      netValues
    );

    if (netValues.capitalGains !== 0 || netValues.taxableIncome !== 0) {
      throw Error("Post tax values should be zero'd");
    }

    if (age < retirementAge) {
      netValues = applyTransaction(
        cpp.contribute(year, grossIncome),
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
  }
  logger.exportSimulation();
}

simulate();
