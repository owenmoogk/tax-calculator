import { useMemo } from 'react';
import type { SimulationParameters } from './calculator';
import { simulate } from './calculator/simulator';
import { Title } from '@mantine/core';
import { BarChart, LineChart } from '@mantine/charts';

function chooseKeys<T extends object, K extends keyof T>(
  arr: T[],
  keys: K[]
): Pick<T, K>[] {
  return arr.map((item) =>
    keys.reduce(
      (acc, key) => {
        acc[key] = item[key];
        return acc;
      },
      {} as Pick<T, K>
    )
  );
}
export function SimulationCharts(props: {
  simulationParams: SimulationParameters;
  name: string;
}) {
  const { simulationParams, name } = props;
  const { results, estateValue } = useMemo(
    () => simulate(simulationParams),
    [simulationParams]
  );

  return (
    <>
      <Title>{name}</Title>
      <Title order={5}>
        Estate Value:{' '}
        {Intl.NumberFormat('en-US').format(Math.round(estateValue))}
      </Title>
      <BarChart
        h={200}
        valueFormatter={(value) => new Intl.NumberFormat('en-US').format(value)}
        data={results}
        dataKey="age"
        series={[
          { name: 'tfsaValue', color: 'green' },
          { name: 'respValue', color: 'yellow' },
          { name: 'rrspValue', color: 'purple' },
          { name: 'nonRegisteredValue', color: 'blue' },
          { name: 'cash', color: 'pink' },
        ]}
        type="stacked"
      />
      <Title order={3}>Contributions</Title>
      <BarChart
        valueFormatter={(value) => new Intl.NumberFormat('en-US').format(value)}
        h={200}
        data={results}
        dataKey="age"
        series={[
          { name: 'RRSP Contribution', color: 'red' },
          { name: 'TFSA Contribution', color: 'green' },
        ]}
        type="stacked"
      />
      <Title order={3}>Net Worth</Title>
      <LineChart
        valueFormatter={(value) => new Intl.NumberFormat('en-US').format(value)}
        h={200}
        data={results}
        dataKey="age"
        series={[{ name: 'netWorth', color: 'red' }]}
      />
    </>
  );
}
