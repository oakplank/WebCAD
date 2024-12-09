import React from 'react';
import styled from '@emotion/styled';
import { useSceneStore } from '../../store/sceneStore';
import { useSettingsStore } from '../../store/settingsStore';
import { AnimatePresence, motion } from 'framer-motion';
import { ModelStructureContent } from '../model-structure/ModelStructureContent';
import { PropertyPanel } from '../sidebar/PropertyPanel';
import { Toolbar } from '../toolbar/Toolbar';
import { FileMenu } from '../menus/FileMenu';
import { SettingsMenu } from '../menus/SettingsMenu';

const Layout = styled.div<{ $theme: 'light' | 'dark' }>`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${props => props.$theme === 'dark' ? '#1e1e1e' : '#ffffff'};
  color: ${props => props.$theme === 'dark' ? '#ffffff' : '#000000'};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const TopBar = styled.div`
  height: 28px;
  background: #7092BE;
  display: flex;
  align-items: center;
  padding: 0 16px;
  color: white;
  z-index: 20;
  justify-content: space-between;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
`;

const Logo = styled.h1`
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const MenuBar = styled.div`
  display: flex;
  gap: 8px;
  font-family: 'Inter', sans-serif;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
`;

const ModelStructure = styled(motion.div)<{ $theme: 'light' | 'dark' }>`
  width: 300px;
  min-width: 300px;
  background: ${props => props.$theme === 'dark' ? '#2d2d2d' : '#ffffff'};
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  z-index: 10;
  overflow-x: hidden;
  overflow-y: auto;
`;

const ViewportContainer = styled.div<{ $isPropertiesPanelOpen: boolean }>`
  flex: 1;
  position: relative;
  transition: margin 0.3s ease;
  margin-right: ${props => props.$isPropertiesPanelOpen ? '300px' : '0'};
`;

const PropertiesPanel = styled(motion.div)<{ $theme: 'light' | 'dark' }>`
  width: 300px;
  min-width: 300px;
  background: ${props => props.$theme === 'dark' ? '#2d2d2d' : '#ffffff'};
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);
  z-index: 10;
  overflow-y: auto;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
`;

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const selectedObjectIds = useSceneStore(state => state.selectedObjectIds);
  const theme = useSettingsStore(state => state.theme);

  return (
    <Layout $theme={theme}>
      <TopBar>
        <LeftSection>
          <Logo>WebCAD</Logo>
          <MenuBar>
            <FileMenu />
          </MenuBar>
        </LeftSection>
        <SettingsMenu />
      </TopBar>
      <Toolbar />
      <MainContent>
        <ModelStructure
          initial={{ x: 0 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          $theme={theme}
        >
          <ModelStructureContent />
        </ModelStructure>
        
        <ViewportContainer $isPropertiesPanelOpen={selectedObjectIds.length > 0}>
          {children}
        </ViewportContainer>

        <AnimatePresence>
          {selectedObjectIds.length > 0 && (
            <PropertiesPanel
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              $theme={theme}
            >
              <PropertyPanel />
            </PropertiesPanel>
          )}
        </AnimatePresence>
      </MainContent>
    </Layout>
  );
}