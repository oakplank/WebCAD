# Material System Documentation

## Overview
This system handles non-standard materials in the rendering pipeline, providing fallback solutions and maintaining visual fidelity.

## Supported Material Types

### Standard
- Basic material with color and opacity
- Lowest performance impact
- Used as ultimate fallback

### PBR
- Physically-based rendering material
- Supports metalness and roughness
- Medium performance impact

### Subsurface
- Simulates translucent materials
- Properties: strength, radius, color
- High performance impact
- Falls back to PBR

### Anisotropic
- Directional reflections
- Properties: strength, rotation, direction
- High performance impact
- Falls back to PBR

### Iridescent
- Color-shifting effects
- Properties: strength, baseColor, shiftAmount
- High performance impact
- Falls back to PBR

## Implementation Guidelines

### Adding New Material Types
1. Define type in MaterialType enum
2. Add properties to MaterialProperties interface
3. Implement conversion in MaterialConverter
4. Add analysis rules in MaterialAnalyzer
5. Update fallback chain

### Performance Considerations
- Check complexity and gpuCost before using advanced materials
- Use fallbacks for mobile/low-end devices
- Consider batching similar materials

### Best Practices
1. Always provide fallback materials
2. Use appropriate complexity level
3. Optimize texture usage
4. Test performance impact
5. Document material requirements

## Troubleshooting

### Common Issues

1. Material appears different than source
- Check fallback chain
- Verify property conversion
- Ensure textures are loaded

2. Performance problems
- Monitor gpuCost
- Consider using simpler materials
- Reduce texture resolution

3. Missing features
- Verify material type support
- Check for required extensions
- Review fallback behavior

### Debug Steps
1. Enable material analysis logging
2. Check converted properties
3. Verify texture loading
4. Monitor GPU performance
5. Test fallback chain