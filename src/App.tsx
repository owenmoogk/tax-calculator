import { Button, Container, Flex, useMantineColorScheme } from '@mantine/core';
import { SimulationCharts } from './SimulationChart';
import { simulations } from './simulations';

export default function App() {
  const colorScheme = useMantineColorScheme();

  return (
    <Container my={20}>
      <Flex gap={20} direction={'column'}>
        {simulations.map((simulation) => (
          <SimulationCharts
            key={simulation.name}
            name={simulation.name ?? 'Unnamed Simulation'}
            simulationParams={simulation}
          />
        ))}
        <Button onClick={colorScheme.toggleColorScheme} w={'fit-content'}>
          Toggle Darkmode
        </Button>
      </Flex>
    </Container>
  );
}
