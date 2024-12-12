import React from 'react';
import styled from '@emotion/styled';

const ColorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledColorInput = styled.input`
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  &::-webkit-color-swatch {
    border: none;
    border-radius: 3px;
  }
`;

const ColorValue = styled.span`
  font-size: 12px;
  color: #666;
`;

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ColorInput({ value, onChange }: ColorInputProps) {
  return (
    <ColorContainer>
      <StyledColorInput
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <ColorValue>{value.toUpperCase()}</ColorValue>
    </ColorContainer>
  );
}
