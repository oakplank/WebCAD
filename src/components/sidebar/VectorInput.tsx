import React from 'react';
import styled from '@emotion/styled';

const VectorInputGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const VectorInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
`;

const AxisLabel = styled.span`
  font-size: 12px;
  color: #999;
  width: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const UnitLabel = styled.span`
  font-size: 10px;
  color: #999;
  margin-left: 2px;
`;

interface VectorInputProps {
  value: [number, number, number];
  onChange: (index: number, value: string) => void;
  labels?: string[];
  unit?: string;
}

export function VectorInput({ value, onChange, labels = ['X', 'Y', 'Z'], unit }: VectorInputProps) {
  const handleChange = (index: number, inputValue: string) => {
    const parsedValue = parseFloat(inputValue);
    if (!isNaN(parsedValue) || inputValue === '-' || inputValue === '') {
      onChange(index, inputValue);
    }
  };

  return (
    <VectorInputGroup>
      {value.map((val, index) => (
        <VectorInputWrapper key={index}>
          <AxisLabel>{labels[index]}</AxisLabel>
          <Input
            type="number"
            value={typeof val === 'number' && !isNaN(val) ? val.toFixed(3) : ''}
            onChange={(e) => handleChange(index, e.target.value)}
            step={unit === '°' ? '15' : '0.1'}
          />
          {unit && <UnitLabel>{unit}</UnitLabel>}
        </VectorInputWrapper>
      ))}
    </VectorInputGroup>
  );
}