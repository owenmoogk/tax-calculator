import { simulations } from '../simulations';
import { simulate } from './simulator';

export type SimulationParameters = {
  startingCalendarYear: number;
  numberOfChildren: number;
  name?: string;
  stages: LifeStage[];

  respParams: RESPParams;

  averageInterest: number;
  averageInflation: number;
};

export type RESPParams = {
  initialValue: number;
  initialContributionSum: number;
};

export type EmployerParams = {
  grossIncome: number;
};

export type LifeStage = {
  startAge: number;
  endAge: number;
  name?: string;

  livingExpenses: number;
  employerParams?: EmployerParams;

  allocations: {
    tfsa: (age: number) => number; // 0-1, percentage of maximum allowable
    rrspPercentOfIncome: (age: number) => number; // 0-1, percentage of maximum allowable
    totalEmergencyCash: number; // value, amount of emergency cash on hand
  };

  expenseSources?: {
    rrspMaxWithdrawal: number;
  };

  respWithdrawalPercent?: (age: number) => number;
  rrspMaxPreferrableWithdrawal?: (age: number) => number;
};

for (const simulation of simulations) {
  simulate(simulation);
}
