import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useSceneStore } from '../../store/sceneStore';
import { useSettingsStore } from '../../store/settingsStore';
import { FileService } from '../../services/fileService';
import { FileUploadDialog } from '../dialogs/FileUploadDialog';

const MenuContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const MenuButton = styled.button<{ $theme: 'light' | 'dark' }>`
  background: none;
  border: none;
  color: white;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Dropdown = styled.div<{ $isOpen: boolean; $theme: 'light' | 'dark' }>`
  position: absolute;
  top: 100%;
  left: 0;
  background: ${props => props.$theme === 'dark' ? '#2d2d2d' : '#ffffff'};
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  display: ${props => props.$isOpen ? 'block' : 'none'};
  z-index: 1000;
  min-width: 160px;
`;

const MenuItem = styled.div<{ $theme: 'light' | 'dark' }>`
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.$theme === 'dark' ? '#ffffff' : '#000000'};
  &:hover {
    background: ${props => props.$theme === 'dark' ? '#3d3d3d' : '#f0f0f0'};
  }
  font-size: 14px;
`;

const Shortcut = styled.span<{ $theme: 'light' | 'dark' }>`
  color: ${props => props.$theme === 'dark' ? '#b0b0b0' : '#666666'};
  font-size: 12px;
  margin-left: auto;
`;

export function FileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const objects = useSceneStore(state => state.objects);
  const setObjects = useSceneStore(state => state.setObjects);
  const setSelectedObject = useSceneStore(state => state.setSelectedObjects);
  const theme = useSettingsStore(state => state.theme);

  const handleSave = async () => {
    try {
      const blob = await FileService.exportToGLB({
        objects,
        relationships: objects.reduce((acc, obj) => ({
          ...acc,
          [obj.id]: { parent: null, children: [] }
        }), {})
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'scene.glb';
      a.click();
      URL.revokeObjectURL(url);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to save scene:', error);
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      const result = await FileService.importFromGLB(file);
      setSelectedObject([]);
      setObjects(result.objects);
      setShowUploadDialog(false);
    } catch (error) {
      console.error('Failed to import file:', error);
      alert('Failed to import file');
    }
  };

  return (
    <>
      <MenuContainer onMouseLeave={() => setIsOpen(false)}>
        <MenuButton 
          onMouseEnter={() => setIsOpen(true)}
          $theme={theme}
        >
          File
        </MenuButton>
        <Dropdown $isOpen={isOpen} $theme={theme}>
          <MenuItem $theme={theme} onClick={() => setShowUploadDialog(true)}>
            Open
            <Shortcut $theme={theme}>Ctrl+O</Shortcut>
          </MenuItem>
          <MenuItem $theme={theme} onClick={handleSave}>
            Save
            <Shortcut $theme={theme}>Ctrl+S</Shortcut>
          </MenuItem>
          <MenuItem $theme={theme}>
            Export
          </MenuItem>
        </Dropdown>
      </MenuContainer>

      {showUploadDialog && (
        <FileUploadDialog
          onClose={() => setShowUploadDialog(false)}
          onFileSelect={handleFileSelect}
        />
      )}
    </>
  );
}