import { simulate } from './simulator';

export type SimulationParameters = {
  startingCalendarYear: number;
  numberOfChildren: number;

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
    rrsp: (age: number) => number; // 0-1, percentage of maximum allowable
    totalEmergencyCash: number; // value, amount of emergency cash on hand
  };

  expenseSources?: {
    rrspMaxWithdrawal: number;
  };

  respWithdrawalPercent?: (age: number) => number;
  rrspMaxPreferrableWithdrawal?: (age: number) => number;
};

export const exampleSimulationParameters: SimulationParameters = {
  startingCalendarYear: 2025,
  stages: [
    {
      startAge: 20,
      endAge: 23,
      livingExpenses: 0e3,
      allocations: {
        tfsa: () => 1,
        rrsp: () => 1,
        totalEmergencyCash: 10000,
      },
      respWithdrawalPercent: (age) => 1 / (23 - age),
    },
    {
      startAge: 23,
      endAge: 45,
      employerParams: {
        grossIncome: 110e3,
      },
      livingExpenses: 70e3,
      allocations: {
        tfsa: () => 1,
        rrsp: () => 1,
        totalEmergencyCash: 50000,
      },
    },
    {
      startAge: 45,
      endAge: 65,
      employerParams: {
        grossIncome: 130e3,
      },
      livingExpenses: 50e3,
      allocations: {
        tfsa: () => 1,
        rrsp: () => 1,
        totalEmergencyCash: 50000,
      },
    },
    {
      startAge: 65,
      endAge: 85,
      livingExpenses: 50e3,
      allocations: {
        tfsa: () => 1,
        rrsp: () => 1,
        totalEmergencyCash: 30000,
      },
      rrspMaxPreferrableWithdrawal: () => 120e3,
    },
  ],
  numberOfChildren: 0,
  averageInterest: 0.07,
  averageInflation: 0.02,
  respParams: {
    initialValue: 30e3,
    initialContributionSum: 15e3,
  },
};

simulate(exampleSimulationParameters);
