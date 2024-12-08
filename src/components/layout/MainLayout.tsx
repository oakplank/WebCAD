import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { useSceneStore } from '../../store/sceneStore';
import { AnimatePresence, motion } from 'framer-motion';
import { ModelStructureContent } from '../model-structure/ModelStructureContent';
import { PropertyPanel } from '../sidebar/PropertyPanel';
import { Toolbar } from '../toolbar/Toolbar';

const Layout = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TopBar = styled.div`
  height: 48px;
  background: #2c3e50;
  display: flex;
  align-items: center;
  padding: 0 16px;
  color: white;
  z-index: 20;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
`;

const ModelStructure = styled(motion.div)`
  width: 300px;
  min-width: 300px;
  background: white;
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

const PropertiesPanel = styled(motion.div)`
  width: 300px;
  min-width: 300px;
  background: white;
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);
  z-index: 10;
  overflow-y: auto;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
`;

export function MainLayout({ children }: { children: React.ReactNode }) {
  const selectedObjectId = useSceneStore(state => state.selectedObjectId);
  const setSelectedObject = useSceneStore(state => state.setSelectedObject);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedObject(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedObject]);

  return (
    <Layout>
      <TopBar>
        <h1>WebCAD</h1>
      </TopBar>
      <Toolbar />
      <MainContent>
        <ModelStructure
          initial={{ x: 0 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <ModelStructureContent />
        </ModelStructure>
        
        <ViewportContainer $isPropertiesPanelOpen={!!selectedObjectId}>
          {children}
        </ViewportContainer>

        <AnimatePresence>
          {selectedObjectId && (
            <PropertiesPanel
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <PropertyPanel />
            </PropertiesPanel>
          )}
        </AnimatePresence>
      </MainContent>
    </Layout>
  );
} 