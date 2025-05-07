import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Sketch } from '../../types/scene.types';
import { SceneObject } from '../../types/scene.types';
import { useSceneStore } from '../../store/sceneStore';

interface SketchEditorOverlayProps {
  sketch: Sketch | undefined;
  workplane: SceneObject;
  tool?: 'select' | 'line' | 'circle' | 'arc' | 'constraint' | 'dimension';
}

export function SketchEditorOverlay({ sketch, workplane, tool = 'select' }: SketchEditorOverlayProps) {
  const updateObject = useSceneStore(state => state.updateObject);
  const objects = useSceneStore(state => state.objects);
  const [drawing, setDrawing] = useState<any>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Constraint and dimension tool logic
  const [pendingConstraint, setPendingConstraint] = useState<string[]>([]);
  const [pendingDimension, setPendingDimension] = useState<string[]>([]);

  if (!sketch || !workplane) return null;

  // For now, just render lines as SVG overlay (future: use canvas or 3D overlay)
  // Assume workplane origin is [0,0,0], normal and up define orientation
  // We'll render a fixed-size SVG centered on the workplane origin
  const size = workplane.size || 20;
  const half = size / 2;
  const svgSize = 400;
  const scale = svgSize / size;

  // Transform sketch entity coordinates to SVG
  const toSVG = (x: number, y: number) => [svgSize / 2 + x * scale, svgSize / 2 - y * scale];
  const toSketch = (sx: number, sy: number) => [
    (sx - svgSize / 2) / scale,
    (svgSize / 2 - sy) / scale
  ];

  // Mouse event handlers for drawing
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const [sx, sy] = toSketch(x, y);
    if (tool === 'line') {
      setDrawing({ type: 'line', x1: sx, y1: sy, x2: sx, y2: sy });
    } else if (tool === 'circle') {
      setDrawing({ type: 'circle', cx: sx, cy: sy, r: 0 });
    } else if (tool === 'arc') {
      setDrawing({ type: 'arc', cx: sx, cy: sy, r: 0, startAngle: 0, endAngle: Math.PI });
    } else if (tool === 'select') {
      // Select entity if clicked near it
      let found: string | null = null;
      for (const entity of sketch.entities) {
        if (entity.type === 'line') {
          const [x1, y1, x2, y2] = entity.data;
          const [sx1, sy1] = toSVG(x1, y1);
          const [sx2, sy2] = toSVG(x2, y2);
          // Distance from point to line segment
          const dist = pointToSegmentDistance(x, y, sx1, sy1, sx2, sy2);
          if (dist < 8) found = entity.id;
        } else if (entity.type === 'circle') {
          const [cx, cy, r] = entity.data;
          const [scx, scy] = toSVG(cx, cy);
          const sr = Math.abs(r * scale);
          const d = Math.abs(Math.sqrt((x - scx) ** 2 + (y - scy) ** 2) - sr);
          if (d < 8) found = entity.id;
        }
        // TODO: arc selection
      }
      setSelectedId(found);
    } else if (tool === 'constraint') {
      // Select entity for constraint
      let found: string | null = null;
      for (const entity of sketch.entities) {
        if (entity.type === 'line') {
          const [x1, y1, x2, y2] = entity.data;
          const [sx1, sy1] = toSVG(x1, y1);
          const [sx2, sy2] = toSVG(x2, y2);
          const dist = pointToSegmentDistance(x, y, sx1, sy1, sx2, sy2);
          if (dist < 8) found = entity.id;
        } else if (entity.type === 'circle') {
          const [cx, cy, r] = entity.data;
          const [scx, scy] = toSVG(cx, cy);
          const sr = Math.abs(r * scale);
          const d = Math.abs(Math.sqrt((x - scx) ** 2 + (y - scy) ** 2) - sr);
          if (d < 8) found = entity.id;
        }
      }
      if (found && !pendingConstraint.includes(found)) setPendingConstraint([...pendingConstraint, found]);
    } else if (tool === 'dimension') {
      // Select entity for dimension
      let found: string | null = null;
      for (const entity of sketch.entities) {
        if (entity.type === 'line') {
          const [x1, y1, x2, y2] = entity.data;
          const [sx1, sy1] = toSVG(x1, y1);
          const [sx2, sy2] = toSVG(x2, y2);
          const dist = pointToSegmentDistance(x, y, sx1, sy1, sx2, sy2);
          if (dist < 8) found = entity.id;
        } else if (entity.type === 'circle') {
          const [cx, cy, r] = entity.data;
          const [scx, scy] = toSVG(cx, cy);
          const sr = Math.abs(r * scale);
          const d = Math.abs(Math.sqrt((x - scx) ** 2 + (y - scy) ** 2) - sr);
          if (d < 8) found = entity.id;
        }
      }
      if (found && !pendingDimension.includes(found)) setPendingDimension([...pendingDimension, found]);
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const [sx, sy] = toSketch(x, y);
    if (drawing.type === 'line') {
      setDrawing({ ...drawing, x2: sx, y2: sy });
    } else if (drawing.type === 'circle') {
      const r = Math.sqrt((sx - drawing.cx) ** 2 + (sy - drawing.cy) ** 2);
      setDrawing({ ...drawing, r });
    } else if (drawing.type === 'arc') {
      const r = Math.sqrt((sx - drawing.cx) ** 2 + (sy - drawing.cy) ** 2);
      setDrawing({ ...drawing, r });
    }
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!drawing) return;
    const sketchObj = objects.find(obj => obj.sketch && obj.sketch.id === sketch.id);
    if (!sketchObj) return;
    if (drawing.type === 'line') {
      const newEntity = {
        id: crypto.randomUUID(),
        type: 'line' as const,
        data: [drawing.x1, drawing.y1, drawing.x2, drawing.y2]
      };
      updateObject(sketchObj.id, {
        sketch: {
          ...sketch,
          entities: [...sketch.entities, newEntity]
        }
      });
    } else if (drawing.type === 'circle') {
      const newEntity = {
        id: crypto.randomUUID(),
        type: 'circle' as const,
        data: [drawing.cx, drawing.cy, drawing.r]
      };
      updateObject(sketchObj.id, {
        sketch: {
          ...sketch,
          entities: [...sketch.entities, newEntity]
        }
      });
    } else if (drawing.type === 'arc') {
      const newEntity = {
        id: crypto.randomUUID(),
        type: 'arc' as const,
        data: [drawing.cx, drawing.cy, drawing.r, 0, Math.PI]
      };
      updateObject(sketchObj.id, {
        sketch: {
          ...sketch,
          entities: [...sketch.entities, newEntity]
        }
      });
    }
    setDrawing(null);
  };

  // Delete selected entity with Delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedId) {
        const sketchObj = objects.find(obj => obj.sketch && obj.sketch.id === sketch.id);
        if (sketchObj) {
          updateObject(sketchObj.id, {
            sketch: {
              ...sketch,
              entities: sketch.entities.filter(ent => ent.id !== selectedId)
            }
          });
        }
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, sketch, objects, updateObject]);

  // Handle constraint tool: select two entities, add a coincident constraint
  useEffect(() => {
    if (tool === 'constraint' && pendingConstraint.length === 2) {
      const sketchObj = objects.find(obj => obj.sketch && obj.sketch.id === sketch.id);
      if (sketchObj) {
        updateObject(sketchObj.id, {
          sketch: {
            ...sketch,
            constraints: [
              ...(sketch.constraints || []),
              { id: crypto.randomUUID(), type: 'coincident', entityIds: [...pendingConstraint] }
            ]
          }
        });
      }
      setPendingConstraint([]);
    }
  }, [tool, pendingConstraint, sketch, objects, updateObject]);

  // Handle dimension tool: select one entity, add a dimension constraint
  useEffect(() => {
    if (tool === 'dimension' && pendingDimension.length === 1) {
      const sketchObj = objects.find(obj => obj.sketch && obj.sketch.id === sketch.id);
      if (sketchObj) {
        updateObject(sketchObj.id, {
          sketch: {
            ...sketch,
            constraints: [
              ...(sketch.constraints || []),
              { id: crypto.randomUUID(), type: 'dimension', entityIds: [...pendingDimension], parameters: { value: 10 } }
            ]
          }
        });
      }
      setPendingDimension([]);
    }
  }, [tool, pendingDimension, sketch, objects, updateObject]);

  // Helper: distance from point to segment
  function pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
    const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
    if (l2 === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projx = x1 + t * (x2 - x1);
    const projy = y1 + t * (y2 - y1);
    return Math.sqrt((px - projx) ** 2 + (py - projy) ** 2);
  }

  // Visualize constraints and dimensions
  // Draw constraint icons at the midpoint of constrained entities
  const constraintMarkers = (sketch.constraints || []).map(constraint => {
    if (constraint.type === 'coincident' && constraint.entityIds.length === 2) {
      const e1 = sketch.entities.find(e => e.id === constraint.entityIds[0]);
      const e2 = sketch.entities.find(e => e.id === constraint.entityIds[1]);
      if (e1 && e2) {
        // Midpoint of first entity
        let mx = 0, my = 0;
        if (e1.type === 'line') {
          const [x1, y1, x2, y2] = e1.data;
          mx = (x1 + x2) / 2; my = (y1 + y2) / 2;
        } else if (e1.type === 'circle') {
          const [cx, cy] = e1.data;
          mx = cx; my = cy;
        }
        const [sx, sy] = toSVG(mx, my);
        return <circle key={constraint.id} cx={sx} cy={sy} r={10} fill="#fffde7" stroke="#ff9800" strokeWidth={2} />;
      }
    }
    if (constraint.type === 'dimension' && constraint.entityIds.length === 1) {
      const e1 = sketch.entities.find(e => e.id === constraint.entityIds[0]);
      if (e1) {
        let mx = 0, my = 0;
        if (e1.type === 'line') {
          const [x1, y1, x2, y2] = e1.data;
          mx = (x1 + x2) / 2; my = (y1 + y2) / 2;
        } else if (e1.type === 'circle') {
          const [cx, cy] = e1.data;
          mx = cx; my = cy;
        }
        const [sx, sy] = toSVG(mx, my);
        return <text key={constraint.id} x={sx} y={sy - 12} fontSize={16} fill="#1976d2" stroke="#fff" strokeWidth={3} paintOrder="stroke" textAnchor="middle">{constraint.parameters?.value ?? ''}</text>;
      }
    }
    return null;
  });

  return (
    <div style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: tool === 'select' ? 'auto' : 'auto',
      zIndex: 20
    }}>
      <svg
        ref={svgRef}
        width={svgSize}
        height={svgSize}
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #bbb', cursor: tool === 'line' ? 'crosshair' : tool === 'circle' ? 'crosshair' : tool === 'arc' ? 'crosshair' : 'pointer' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Draw grid */}
        {[...Array(11)].map((_, i) => (
          <line
            key={'h' + i}
            x1={0}
            y1={i * (svgSize / 10)}
            x2={svgSize}
            y2={i * (svgSize / 10)}
            stroke="#eee"
            strokeWidth={1}
          />
        ))}
        {[...Array(11)].map((_, i) => (
          <line
            key={'v' + i}
            x1={i * (svgSize / 10)}
            y1={0}
            x2={i * (svgSize / 10)}
            y2={svgSize}
            stroke="#eee"
            strokeWidth={1}
          />
        ))}
        {/* Draw sketch entities */}
        {sketch.entities.map(entity => {
          if (entity.type === 'line') {
            const [x1, y1, x2, y2] = entity.data;
            const [sx1, sy1] = toSVG(x1, y1);
            const [sx2, sy2] = toSVG(x2, y2);
            return <line key={entity.id} x1={sx1} y1={sy1} x2={sx2} y2={sy2} stroke={entity.id === selectedId ? '#ff1744' : '#1976d2'} strokeWidth={entity.id === selectedId ? 4 : 2} />;
          }
          if (entity.type === 'circle') {
            const [cx, cy, r] = entity.data;
            const [scx, scy] = toSVG(cx, cy);
            const sr = Math.abs(r * scale);
            return <circle key={entity.id} cx={scx} cy={scy} r={sr} stroke={entity.id === selectedId ? '#ff1744' : '#1976d2'} strokeWidth={entity.id === selectedId ? 4 : 2} fill="none" />;
          }
          if (entity.type === 'arc') {
            const [cx, cy, r, startAngle, endAngle] = entity.data;
            const [scx, scy] = toSVG(cx, cy);
            const sr = Math.abs(r * scale);
            // SVG arc path
            const x1 = scx + sr * Math.cos(startAngle);
            const y1 = scy - sr * Math.sin(startAngle);
            const x2 = scx + sr * Math.cos(endAngle);
            const y2 = scy - sr * Math.sin(endAngle);
            const largeArc = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
            return <path key={entity.id} d={`M${x1},${y1} A${sr},${sr} 0 ${largeArc} 0 ${x2},${y2}`} stroke={entity.id === selectedId ? '#ff1744' : '#1976d2'} strokeWidth={entity.id === selectedId ? 4 : 2} fill="none" />;
          }
          return null;
        })}
        {/* Draw current entity */}
        {drawing && drawing.type === 'line' && (
          <line
            x1={toSVG(drawing.x1, drawing.y1)[0]}
            y1={toSVG(drawing.x1, drawing.y1)[1]}
            x2={toSVG(drawing.x2, drawing.y2)[0]}
            y2={toSVG(drawing.x2, drawing.y2)[1]}
            stroke="#1976d2"
            strokeWidth={2}
            strokeDasharray="4 2"
          />
        )}
        {drawing && drawing.type === 'circle' && (
          <circle
            cx={toSVG(drawing.cx, drawing.cy)[0]}
            cy={toSVG(drawing.cx, drawing.cy)[1]}
            r={Math.abs(drawing.r * scale)}
            stroke="#1976d2"
            strokeWidth={2}
            strokeDasharray="4 2"
            fill="none"
          />
        )}
        {drawing && drawing.type === 'arc' && (
          (() => {
            const [scx, scy] = toSVG(drawing.cx, drawing.cy);
            const sr = Math.abs(drawing.r * scale);
            const x1 = scx + sr * Math.cos(0);
            const y1 = scy - sr * Math.sin(0);
            const x2 = scx + sr * Math.cos(Math.PI);
            const y2 = scy - sr * Math.sin(Math.PI);
            return <path d={`M${x1},${y1} A${sr},${sr} 0 1 0 ${x2},${y2}`} stroke="#1976d2" strokeWidth={2} fill="none" strokeDasharray="4 2" />;
          })()
        )}
        {/* Draw constraint and dimension markers */}
        {constraintMarkers}
      </svg>
    </div>
  );
} 