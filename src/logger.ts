import { createObjectCsvWriter } from 'csv-writer';

class Logger {
  records: Record<string, number>[] = [];
  keys: Set<string> = new Set();

  csvWriter = createObjectCsvWriter({
    path: 'financial_simulation.csv',
    header: [
      { id: 'age', title: 'Age' },
      { id: 'tfsa', title: 'TFSA' },
      { id: 'rrsp', title: 'RRSP' },
      { id: 'resp', title: 'RESP' },
      { id: 'nonRegistered', title: 'NonRegistered' },
      { id: 'cash', title: 'Cash' },
      { id: 'netWorth', title: 'NetWorth' },
    ],
  });

  log(year: number, name: string, value: number) {
    if (!this.records[year]) {
      this.records[year] = {};
    }
    this.records[year][name] = Math.round(value);
    this.keys.add(name);
  }

  record(
    yearStep: number,
    age: number,
    year: number,
    tfsaValue: number,
    rrspValue: number,
    respValue: number,
    nonRegisteredValue: number,
    cash: number
  ) {
    this.log(yearStep, 'year', year);
    this.log(yearStep, 'age', age);
    this.log(yearStep, 'tfsaValue', tfsaValue);
    this.log(yearStep, 'rrspValue', rrspValue);
    this.log(yearStep, 'respValue', respValue);
    this.log(yearStep, 'nonRegisteredValue', nonRegisteredValue);
    this.log(yearStep, 'cash', cash);
    this.log(
      yearStep,
      'netWorth',
      tfsaValue + rrspValue + respValue + nonRegisteredValue + cash
    );
  }

  exportSimulation() {
    const headers = Array.from(this.keys).map((key) => ({
      id: key,
      title: key,
    }));
    const csvWriter = createObjectCsvWriter({
      path: 'financial_simulation.csv',
      header: headers,
    });
    csvWriter
      .writeRecords(this.records)
      .then(() => console.log('Success'))
      .catch((e: Error) => console.log(e.message));
  }
}

export const logger = new Logger();
