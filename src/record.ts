import { createObjectCsvWriter } from "csv-writer";

// Initialize CSV writer
const csvWriter = createObjectCsvWriter({
  path: "financial_simulation.csv",
  header: [
    { id: "age", title: "Age" },
    { id: "tfsa", title: "TFSA" },
    { id: "rrsp", title: "RRSP" },
    { id: "resp", title: "RESP" },
    { id: "nonRegistered", title: "NonRegistered" },
    { id: "cash", title: "Cash" },
    { id: "netWorth", title: "NetWorth" },
  ],
});

export function record(records, {age, tfsaValue, rrspValue, respValue, nonRegisteredValue, cash}){
  const netWorth = tfsaValue + rrspValue + respValue + nonRegisteredValue + cash;
  records.push({
    age,
    tfsa: tfsaValue,
    rrsp: rrspValue,
    resp: respValue,
    nonRegistered: nonRegisteredValue.value,
    cash,
    netWorth,
  });
}

export function exportSimulation(records){
  csvWriter
    .writeRecords(records)
    .then(() => console.log("CSV file written successfully"))
    .catch((err: Error) => console.error("Error writing CSV:", err));
}