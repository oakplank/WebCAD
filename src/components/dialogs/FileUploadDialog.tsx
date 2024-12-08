import React, { useCallback } from 'react';
import styled from '@emotion/styled';
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

const Dialog = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 480px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  &:hover {
    color: #000;
  }
`;

const DropZone = styled.div<{ isDragging: boolean }>`
  border: 2px dashed ${props => props.isDragging ? '#7092BE' : '#ddd'};
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  background: ${props => props.isDragging ? 'rgba(112, 146, 190, 0.1)' : '#f9f9f9'};
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

const Text = styled.div`
  color: #666;
  margin-bottom: 8px;
`;

const SubText = styled.div`
  color: #999;
  font-size: 14px;
`;

const Input = styled.input`
  display: none;
`;

const BrowseButton = styled.button`
  background: #7092BE;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background: #5a7ba7;
  }
`;

interface Props {
  onClose: () => void;
  onFileSelect: (file: File) => void;
}

export function FileUploadDialog({ onClose, onFileSelect }: Props) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

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
      <Dialog onClick={e => e.stopPropagation()}>
        <Header>
          <Title>Open GLB File</Title>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </Header>
        
        <DropZone
          isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <UploadIcon>
            <FaUpload />
          </UploadIcon>
          <Text>Drag and drop your GLB file here</Text>
          <SubText>or click to browse</SubText>
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