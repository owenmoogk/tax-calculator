import type { SimulationParameters } from '.';
import { CPP } from './accounts/cpp';
import { Employer } from './accounts/employer';
import { NonRegistered } from './accounts/non-registered';
import { RESP } from './accounts/resp';
import { RRSP } from './accounts/rrsp';
import { TFSA } from './accounts/tfsa';

export function instantiateAccounts(sp: SimulationParameters) {
  const resp = new RESP(sp.respParams, sp.averageInterest, sp.averageInflation);
  const cpp = new CPP();
  const employer = new Employer(sp.employerParams, sp.averageInflation);
  const rrsp = new RRSP(sp.averageInterest, sp.averageInflation);
  const tfsa = new TFSA(sp.averageInterest, sp.averageInflation);
  const nonRegistered = new NonRegistered(
    sp.averageInterest,
    sp.averageInflation
  );
  return { resp, cpp, employer, rrsp, tfsa, nonRegistered };
}
