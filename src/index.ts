import { simulate } from './simulator';

export type SimulationParameters = {
  startingCalendarYear: number;
  startingAge: number;
  schoolToEmploymentAge: number;
  retirementAge: number;
  deathAge: number;
  numberOfChildren: number;

  employerParams: EmployerParams;
  livingExpenses: number;

  averageInterest: number;
  averageInflation: number;

  respParams: RESPParams;
};

export type RESPParams = {
  initialValue: number;
  initialContributionSum: number;
};

export type EmployerParams = {
  grossIncome: number;
};

const simulationParameters: SimulationParameters = {
  startingCalendarYear: 2025,
  startingAge: 20,
  schoolToEmploymentAge: 23,
  retirementAge: 65,
  deathAge: 80,
  numberOfChildren: 0,
  employerParams: {
    grossIncome: 150e3,
  },
  livingExpenses: 70e3,

  averageInterest: 0.07,
  averageInflation: 0.02,
  respParams: {
    initialValue: 30e3,
    initialContributionSum: 15e3,
  },
};

simulate(simulationParameters);
