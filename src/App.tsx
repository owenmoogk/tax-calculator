import { BarChart } from '@mantine/charts';
import { simulate } from './calculator/simulator';
import { exampleSimulationParameters } from './calculator';
import {
  Button,
  Container,
  Flex,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { useMemo } from 'react';

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
  const colorScheme = useMantineColorScheme();
  const result = useMemo(
    () => simulate(exampleSimulationParameters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exampleSimulationParameters]
  );
  const stackedData = useMemo(
    () =>
      getNetWorthData(result, [
        'tfsaValue',
        'nonRegisteredValue',
        'cash',
        'respValue',
        'rrspValue',
        'age',
      ]),
    [result]
  );

  const netWorthData = useMemo(
    () => getNetWorthData(result, ['netWorth', 'age']),
    [result]
  );

  return (
    <Container my={20}>
      <Flex gap={20} direction={'column'}>
        <Title>Assets</Title>
        <BarChart
          h={200}
          valueFormatter={(value) =>
            new Intl.NumberFormat('en-US').format(value)
          }
          data={stackedData}
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
        <Title>Net Worth</Title>
        <BarChart
          valueFormatter={(value) =>
            new Intl.NumberFormat('en-US').format(value)
          }
          h={200}
          data={netWorthData}
          dataKey="age"
          series={[{ name: 'netWorth', color: 'red' }]}
          type="stacked"
        />
        <Button onClick={colorScheme.toggleColorScheme} w={'fit-content'}>
          Toggle Darkmode
        </Button>
      </Flex>
    </Container>
  );
}
