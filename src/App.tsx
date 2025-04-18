import { BarChart } from '@mantine/charts';
import { simulate } from './calculator/simulator';
import { exampleSimulationParameters } from './calculator';
import { Container } from '@mantine/core';

function getNetWorthData<T extends object, K extends keyof T>(
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

export default function App() {
  const result = simulate(exampleSimulationParameters);
  const data = getNetWorthData(result, [
    'tfsaValue',
    'nonRegisteredValue',
    'cash',
    'age',
  ]);

  console.log(data);

  return (
    <Container my={20}>
      <BarChart
        h={200}
        data={data}
        dataKey="age"
        series={[
          { name: 'tfsaValue', color: 'green' },
          { name: 'nonRegisteredValue', color: 'blue' },
          { name: 'cash', color: 'pink' },
        ]}
        type="stacked"
      />
    </Container>
  );
}
