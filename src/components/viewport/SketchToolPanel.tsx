import React from 'react';

interface SketchToolPanelProps {
  tool: 'select' | 'line' | 'circle' | 'arc' | 'constraint' | 'dimension';
  setTool: (tool: 'select' | 'line' | 'circle' | 'arc' | 'constraint' | 'dimension') => void;
}

export function SketchToolPanel({ tool, setTool }: SketchToolPanelProps) {
  return (
    <div style={{
      position: 'absolute',
      right: 0,
      top: 0,
      width: 80,
      height: '100%',
      background: 'rgba(255,255,255,0.95)',
      borderLeft: '1px solid #bbb',
      zIndex: 30,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 32
    }}>
      <button style={{ margin: 8, background: tool === 'select' ? '#1976d2' : '#eee' }} onClick={() => setTool('select')}>Select</button>
      <button style={{ margin: 8, background: tool === 'line' ? '#1976d2' : '#eee' }} onClick={() => setTool('line')}>Line</button>
      <button style={{ margin: 8, background: tool === 'circle' ? '#1976d2' : '#eee' }} onClick={() => setTool('circle')}>Circle</button>
      <button style={{ margin: 8, background: tool === 'arc' ? '#1976d2' : '#eee' }} onClick={() => setTool('arc')}>Arc</button>
      <button style={{ margin: 8, background: tool === 'constraint' ? '#1976d2' : '#eee' }} onClick={() => setTool('constraint')}>Constraint</button>
      <button style={{ margin: 8, background: tool === 'dimension' ? '#1976d2' : '#eee' }} onClick={() => setTool('dimension')}>Dimension</button>
      {/* Add more tools as needed */}
    </div>
  );
} 