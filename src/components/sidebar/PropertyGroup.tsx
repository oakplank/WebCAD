import React from 'react';
import styled from '@emotion/styled';
import { FaLock, FaLockOpen } from 'react-icons/fa';

const Group = styled.div`
  margin-bottom: 16px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #666;
  flex-shrink: 0;
`;

const LockButton = styled.button<{ $isLocked: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: ${props => props.$isLocked ? '#2196f3' : '#666'};
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    color: ${props => props.$isLocked ? '#1976d2' : '#000'};
  }
`;

interface PropertyGroupProps {
  label: string;
  children: React.ReactNode;
  locked?: boolean;
  onLockToggle?: () => void;
}

export function PropertyGroup({ label, children, locked, onLockToggle }: PropertyGroupProps) {
  return (
    <Group>
      <Header>
        <Label>{label}</Label>
        {onLockToggle && (
          <LockButton 
            $isLocked={locked || false}
            onClick={onLockToggle}
            title={locked ? "Unlock proportions" : "Lock proportions"}
          >
            {locked ? <FaLock size={12} /> : <FaLockOpen size={12} />}
          </LockButton>
        )}
      </Header>
      {children}
    </Group>
  );
}
