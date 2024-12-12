import React, { useCallback } from 'react';
import styled from '@emotion/styled';
import { useSettingsStore } from '../../store/settingsStore';
import { FaUpload, FaTimes } from 'react-icons/fa';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Dialog = styled.div<{ $theme: 'light' | 'dark' }>`
  background: ${props => props.$theme === 'dark' ? '#2d2d2d' : '#ffffff'};
  border-radius: 8px;
  padding: 24px;
  width: 480px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: ${props => props.$theme === 'dark' ? '#ffffff' : '#000000'};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2<{ $theme: 'light' | 'dark' }>`
  margin: 0;
  font-size: 18px;
  color: ${props => props.$theme === 'dark' ? '#ffffff' : '#333333'};
`;

const CloseButton = styled.button<{ $theme: 'light' | 'dark' }>`
  background: none;
  border: none;
  color: ${props => props.$theme === 'dark' ? '#b0b0b0' : '#666666'};
  cursor: pointer;
  padding: 4px;
  &:hover {
    color: ${props => props.$theme === 'dark' ? '#ffffff' : '#000000'};
  }
`;

const DropZone = styled.div<{ isDragging: boolean; $theme: 'light' | 'dark' }>`
  border: 2px dashed ${props => props.isDragging ? '#7092BE' : props.$theme === 'dark' ? '#404040' : '#ddd'};
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  background: ${props => props.isDragging ? 'rgba(112, 146, 190, 0.1)' : props.$theme === 'dark' ? '#1e1e1e' : '#f9f9f9'};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;

  &:hover {
    border-color: #7092BE;
    background: rgba(112, 146, 190, 0.1);
  }
`;

const UploadIcon = styled.div`
  color: #7092BE;
  margin-bottom: 12px;
  svg {
    font-size: 48px;
  }
`;

const Text = styled.div<{ $theme: 'light' | 'dark' }>`
  color: ${props => props.$theme === 'dark' ? '#ffffff' : '#666666'};
  margin-bottom: 8px;
`;

const SubText = styled.div<{ $theme: 'light' | 'dark' }>`
  color: ${props => props.$theme === 'dark' ? '#b0b0b0' : '#999999'};
  font-size: 14px;
`;

const Input = styled.input`
  display: none;
`;

interface Props {
  onClose: () => void;
  onFileSelect: (file: File) => void;
}

export function FileUploadDialog({ onClose, onFileSelect }: Props) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const theme = useSettingsStore(state => state.theme);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith('.glb')) {
      onFileSelect(file);
    } else {
      alert('Please upload a GLB file');
    }
  }, [onFileSelect]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.glb')) {
      onFileSelect(file);
    } else {
      alert('Please upload a GLB file');
    }
  }, [onFileSelect]);

  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={e => e.stopPropagation()} $theme={theme}>
        <Header>
          <Title $theme={theme}>Open GLB File</Title>
          <CloseButton onClick={onClose} $theme={theme}>
            <FaTimes />
          </CloseButton>
        </Header>
        
        <DropZone
          isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          $theme={theme}
        >
          <UploadIcon>
            <FaUpload />
          </UploadIcon>
          <Text $theme={theme}>Drag and drop your GLB file here</Text>
          <SubText $theme={theme}>or click to browse</SubText>
        </DropZone>

        <Input
          ref={inputRef}
          type="file"
          accept=".glb"
          onChange={handleFileSelect}
        />
      </Dialog>
    </Overlay>
  );
}
