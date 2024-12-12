import React from 'react';
import { useWorkplaneStore } from '../../../store/workplaneStore';
import { WorkplaneGrid } from './WorkplaneGrid';

export function WorkplaneManager() {
  const workplanes = useWorkplaneStore((state) => state.workplanes);

  return (
    <group>
      {workplanes.map((workplane) => (
        workplane.visible && (
          <WorkplaneGrid
            key={workplane.id}
            workplane={workplane}
          />
        )
      ))}
    </group>
  );
}
