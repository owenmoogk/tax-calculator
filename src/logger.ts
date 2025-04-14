import { createObjectCsvWriter } from 'csv-writer';
import { startingYear } from './main';

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
    if (!this.records[year - startingYear]) {
      this.records[year - startingYear] = {};
    }
    this.records[year - startingYear][name] = value;
    this.keys.add(name);
  }

  record(
    year: number,
    age: number,
    tfsaValue: number,
    rrspValue: number,
    respValue: number,
    nonRegisteredValue: number,
    cash: number
  ) {
    this.log(year, 'age', age);
    this.log(year, 'tfsaValue', tfsaValue);
    this.log(year, 'rrspValue', rrspValue);
    this.log(year, 'respValue', respValue);
    this.log(year, 'nonRegisteredValue', nonRegisteredValue);
    this.log(year, 'cash', cash);
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
      .catch(() => console.log('Error Exporting File'));
  }
}

export const logger = new Logger();
