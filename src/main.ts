import { NonRegistered } from './accounts/non-registered';
import { RESP } from './accounts/resp';
import { RRSP } from './accounts/rrsp';
import { TFSA } from './accounts/tfsa';
import type { TransactionReturn } from './accounts/types';
import { exportSimulation, record } from './record';
import { calculateTaxOwed } from './tax/tax';

// this is the first year you are in this bracket (ie. start working on jan of yr I'm 23)
const startingAge = 18;
const schoolToEmploymentAge = 23;
const retirementAge = 65;
const deathAge = 80;
const numberOfChildren = 0;

const initialRESPValue = 30e3;
const initialRESPContributionSum = 15e3;
const grossIncome = 100e3;
const livingExpenses = 80e3;

const averageInterest = 0.06;
const averageInflation = 0.02;

let cash = 0;

const resp = new RESP(
  initialRESPValue,
  initialRESPContributionSum,
  averageInterest
);
const rrsp = new RRSP(averageInterest);
const tfsa = new TFSA(averageInterest);
const nonRegistered = new NonRegistered(averageInterest);

function applyTransaction(
  cash: number,
  taxableIncome: number,
  capitalGains: number,
  result: TransactionReturn
) {
  taxableIncome += result.taxableIncome;
  capitalGains += result.realizedCapitalGains;
  cash += result.moneyOut;
  return { cash, taxableIncome, capitalGains };
}

export function simulate() {
  let netInflation = 1;
  const records = [];

  for (let age = startingAge; age < deathAge; age++) {
    let capitalGains = 0;
    let taxableIncome = 0;
    let result: TransactionReturn; // tmp variable to hold results before applied

    // IF IN SCHOOL
    if (age < schoolToEmploymentAge) {
      result = resp.withdrawal(resp.value / (schoolToEmploymentAge - age));
      ({ cash, taxableIncome, capitalGains } = applyTransaction(
        cash,
        grossIncome,
        capitalGains,
        result
      ));
    }

    // IF WORKING
    if (age >= schoolToEmploymentAge && age < retirementAge) {
      const inflationAccountedGrossIncome = grossIncome * netInflation;
      taxableIncome += inflationAccountedGrossIncome;
      cash += inflationAccountedGrossIncome;
    }

    // IF RETIRED
    if (age >= retirementAge) {
      // pull out from resp
    }

    const inflationAccountedLivingExpenses = livingExpenses * netInflation;
    cash -= inflationAccountedLivingExpenses;

    // INVEST
    if (cash > 0) {
      result = tfsa.addMoney(Math.min(tfsa.contributionLimitRemaining, cash));
      ({ cash, taxableIncome, capitalGains } = applyTransaction(
        cash,
        grossIncome,
        capitalGains,
        result
      ));

      if (cash > 100e3) {
        result = nonRegistered.addMoney(cash - 100e3);
        ({ cash, taxableIncome, capitalGains } = applyTransaction(
          cash,
          grossIncome,
          capitalGains,
          result
        ));
      }
    }

    // PAY TAX
    result = calculateTaxOwed(taxableIncome, capitalGains);

    record(records, {
      age,
      tfsaValue: tfsa.value,
      rrspValue: rrsp.value,
      respValue: resp.value,
      nonRegisteredValue: nonRegistered.value,
      cash,
    });

    console.log(cash);

    // RESET LIMITS
    tfsa.newYear();
    rrsp.newYear();
    resp.newYear();
    nonRegistered.newYear();
    netInflation *= averageInflation + 1;
  }
  exportSimulation(records);
}

simulate();
