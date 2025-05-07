# State Management Documentation

## Store Structure

### SceneStore
- Primary store for 3D scene management

interface SceneState {
  objects: SceneObject[];           // All scene objects
  selectedObjectIds: string[];      // Currently selected objects
  viewMode: ViewMode;              // Current view mode (shaded, wireframe, etc)
  history: HistoryState[];         // Undo/redo history
  currentHistoryIndex: number;     // Current position in history
  hoveredObjectId: string | null;  // Currently hovered object
}

### WorkplaneStore
- Manages workplane creation and manipulation

interface WorkplaneState {
  workplanes: Workplane[];          // All workplanes
  activeWorkplaneId: string | null; // Currently active workplane
  creationMode: WorkplaneMode;      // Current creation mode
  referencePoints: Vector3[];       // Points for workplane creation
}

### SettingsStore
- Application-wide settings and preferences

interface SettingsState {
  theme: Theme;                    // UI theme (light/dark)
  backgroundColor: string;         // Viewport background color
  showGrid: boolean;              // Grid visibility
  viewDistance: number;           // Camera view distance
  originVisible: boolean;         // Origin marker visibility
  units: 'mm' | 'in' | 'm';      // Measurement units
  snapEnabled: boolean;           // Snap to grid/points
  performance: PerformanceMode;   // Performance settings
}

### ModifyStore
- Handles modification operations

interface ModifyState {
  mode: ModifyMode;               // Current modification mode
  measurements: Measurement[];    // Active measurements
  alignmentGuides: Guide[];      // Active alignment guides
  transformMode: TransformMode;   // Current transform mode
}

## State Updates

### Action Patterns
- Atomic updates for consistent state
- Batch updates for performance
- Optimistic updates for UI responsiveness
- Rollback capability for failed operations

### History Management
- State snapshots for undo/redo
- Selective history tracking
- Memory-efficient history storage
- History compression for large operations

### Performance Optimization
- Selective re-rendering
- Memoized selectors
- Batched updates
- Lazy state initialization

## State Access

### Component-Level Hooks
Example usage:

// Scene hooks
useSelectedObjects(): SceneObject[]
useViewMode(): ViewMode
useSceneHistory(): HistoryState[]

// Workplane hooks
useActiveWorkplane(): Workplane
useWorkplaneCreation(): WorkplaneCreationState

// Settings hooks
useTheme(): Theme
useViewportSettings(): ViewportSettings

### Selectors
- Memoized selection
- Computed properties
- Filtered results
- Derived state

### State Subscriptions
- Partial store subscriptions
- Change notifications
- State synchronization
- External subscriptions

## Best Practices

### State Organization
- Logical grouping
- Clear dependencies
- Minimal redundancy
- Type safety

### Error Handling
- State validation
- Error recovery
- Consistent error states
- Error reporting

### Testing
- Store unit tests
- Action testing
- Selector testing
- Integration testing

### Performance
- Minimize state updates
- Optimize selector usage
- Use appropriate data structures
- Monitor state size