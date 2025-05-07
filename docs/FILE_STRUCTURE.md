# WebCAD File Structure Documentation

## Core Files

### Entry Points
- src/main.tsx: Application entry point, renders the root React component
- src/App.tsx: Root component that sets up the main layout
- index.html: HTML entry point

### Layout & UI Components
- src/components/layout/MainLayout.tsx: Main application layout structure
  - References: ModelStructureContent, PropertyPanel, Toolbar, FileMenu, SettingsMenu
  - Manages: Sidebar panels, viewport container, and top navigation

- src/components/toolbar/Toolbar.tsx: Main toolbar with creation and modification tools
  - References: SceneStore, SettingsStore, ModifyStore
  - Features: Shape creation, view modes, undo/redo functionality

### Core Features
- src/services/fileService.ts: Handles file operations
  - Features: GLB import/export, file validation, blob handling
  - References: GLBLoader, SceneObject types

### State Management
- src/store/sceneStore.ts: Central store for 3D scene management
  - Features: Object manipulation, history management, selection state
  - References: THREE.js, geometry utils, rotation utils

- src/store/workplaneStore.ts: Manages workplane states and operations
  - Features: Workplane creation, modification, visibility
  - References: THREE.js, workplane types

### Types & Interfaces
- src/types/scene.types.ts: Core type definitions for scene objects
  - Defines: SceneObject, Face, MaterialData, GeometryData interfaces
  - Referenced by: Most components and stores

- src/types/workplane.types.ts: Workplane-related type definitions
  - Defines: Workplane interface and related types
  - Referenced by: workplaneStore, workplane components

### Utilities
- src/utils/geometryUtils.ts: Geometry manipulation utilities
  - Features: Geometry creation, merging, transformation
  - References: THREE.js, SceneObject types

- src/utils/rotationUtils.ts: Rotation conversion utilities
  - Features: Degree/radian conversion, rotation transformations
  - Referenced by: Scene components, transformation handlers

## Component Dependencies
MainLayout.tsx
├── ModelStructureContent.tsx
├── PropertyPanel.tsx
├── Toolbar.tsx
├── FileMenu.tsx
└── SettingsMenu.tsx

## Store Dependencies
SceneStore
├── THREE.js
├── GeometryUtils
└── RotationUtils

WorkplaneStore
├── THREE.js
└── WorkplaneTypes

SettingsStore
└── Theme