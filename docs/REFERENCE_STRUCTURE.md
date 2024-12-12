# Reference Code Structure

## Organization
The reference code is stored in `reference/` and does not impact the main application:

```
project/
├── reference/           # Reference implementations
│   ├── viewer/         # Three.js viewer reference code
│   ├── materials/      # Material system references  
│   └── loaders/        # Loader implementations
├── src/                # Main application code
├── docs/               # Documentation
└── ...
```

## Usage Guidelines

1. Reference code should:
   - Be kept separate from application code
   - Not be imported directly
   - Serve as implementation examples
   - Help inform architectural decisions

2. When adding features:
   - Study relevant reference implementations
   - Adapt patterns to current architecture
   - Don't copy code directly
   - Document which references influenced the implementation

3. Benefits:
   - Access to proven implementations
   - Code organization examples
   - Performance optimization patterns
   - Error handling strategies