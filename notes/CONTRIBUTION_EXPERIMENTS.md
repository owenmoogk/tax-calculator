I've found that almost always, contributing the max to your rrsp makes sense. 

import type { SimulationParameters } from './calculator';

const fullRRSP: SimulationParameters = {
  name: 'Full RRSP',
  startingCalendarYear: 2025,
  stages: [
    {
      startAge: 20,
      endAge: 23,
      livingExpenses: 0e3,
      allocations: {
        tfsa: () => 1,
        rrspPercentOfIncome: () => 0.5,
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
      livingExpenses: 65e3,
      allocations: {
        tfsa: () => 1,
        rrspPercentOfIncome: () => 0.5,
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
        rrspPercentOfIncome: () => 0.5,
        totalEmergencyCash: 50000,
      },
    },
    {
      startAge: 65,
      endAge: 85,
      livingExpenses: 50e3,
      allocations: {
        tfsa: () => 1,
        rrspPercentOfIncome: () => 1,
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

const increasingRRSP: SimulationParameters = {
  startingCalendarYear: 2025,
  name: 'Increasing RRSP',
  stages: [
    {
      startAge: 20,
      endAge: 23,
      livingExpenses: 0e3,
      allocations: {
        tfsa: () => 1,
        rrspPercentOfIncome: () => 0.3,
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
      livingExpenses: 65e3,
      allocations: {
        tfsa: () => 1,
        rrspPercentOfIncome: (age) => 0.2,
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
        rrspPercentOfIncome: (age) => 0.25,
        totalEmergencyCash: 50000,
      },
    },
    {
      startAge: 65,
      endAge: 85,
      livingExpenses: 50e3,
      allocations: {
        tfsa: () => 1,
        rrspPercentOfIncome: () => 1,
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

export const simulations: SimulationParameters[] = [fullRRSP, increasingRRSP];
