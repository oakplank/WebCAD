# WebCAD Components Documentation

## UI Components

### Layout Components
- MainLayout: Application shell
  - Manages overall application layout
  - Handles responsive design
  - Controls sidebar visibility
  - Manages toolbar positioning

- Toolbar: Tool access and controls
  - Creation tools
  - Modification tools
  - View controls
  - Tool state management

- PropertyPanel: Object properties
  - Position editing
  - Rotation controls
  - Scale manipulation
  - Material properties
  - Visibility toggles

- ModelStructure: Scene hierarchy
  - Tree view of objects
  - Drag and drop support
  - Selection management
  - Group operations

### Viewport Components
- Viewport: 3D scene container
  - Three.js scene management
  - Camera controls
  - Object manipulation
  - Rendering optimization

- WorkplaneCreator: Workplane creation
  - Face selection
  - Three-point plane creation
  - Offset plane creation
  - Plane visualization

- ModifyOverlay: Modification UI
  - Measurement display
  - Alignment guides
  - Transformation handles
  - Selection feedback

- ReferenceOrigin: Origin visualization
  - Axis visualization
  - Grid display
  - Scale indicators
  - Origin marker

### Dialog Components
- FileUploadDialog: File import
  - File selection
  - Format validation
  - Progress indication
  - Error handling

- SettingsDialog: Application settings
  - Theme selection
  - Performance options
  - Display preferences
  - Keyboard shortcuts

- ConfirmDialog: User confirmations
  - Action confirmation
  - Warning display
  - Option selection
  - Cancel handling

### Menu Components
- FileMenu: File operations
  - New file
  - Open file
  - Save operations
  - Export options
  - Recent files

- SettingsMenu: Settings access
  - Theme toggle
  - Grid controls
  - Unit selection
  - Performance settings

- EditMenu: Edit operations
  - Undo/Redo
  - Copy/Paste
  - Delete
  - Group/Ungroup

## Component Hierarchy
MainLayout
├── TopBar
│   ├── FileMenu
│   ├── EditMenu
│   └── SettingsMenu
├── Toolbar
│   ├── CreateTools
│   ├── ModifyTools
│   └── ViewTools
├── Viewport
│   ├── Scene
│   ├── WorkplaneCreator
│   └── ModifyOverlay
└── Sidebar
    ├── ModelStructure
    └── PropertyPanel

## Component Communication
- Props for parent-child communication
- Store subscriptions for global state
- Event system for cross-component communication
- Context for theme and settings

## Component Best Practices
- Use functional components
- Implement proper error boundaries
- Maintain consistent styling
- Follow accessibility guidelines
- Optimize rendering performance
