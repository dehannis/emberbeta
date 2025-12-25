# Figma MCP Comparison: Desktop vs TalkToFigma

## Purpose
This document compares the read capabilities of Figma Desktop MCP vs TalkToFigma MCP to help determine which MCP to promote for Figma → code handoff workflows.

## Figma Desktop MCP Capabilities

### Read Functions Available:
1. **`get_design_context`** - Generates React+Tailwind code from Figma nodes
   - Returns full component structure with styling
   - Includes node IDs as data attributes
   - Provides image asset URLs
   - Includes annotation data
   - **Note**: Returns Tailwind classes that must be converted to project's styling system

2. **`get_metadata`** - Returns XML metadata for nodes/pages
   - Includes node IDs, layer types, names, positions, sizes
   - Useful for structure overview
   - Less detailed than `get_design_context`

3. **`get_screenshot`** - Captures screenshots of nodes
   - Useful for visual reference
   - Helps verify implementation

4. **`get_variable_defs`** - Gets variable definitions for nodes
   - Returns Figma Variables (colors, spacing, etc.)
   - Useful for design token extraction

### Limitations Observed:
- Returns Tailwind classes that need conversion
- May not provide exact CSS specifications (relies on conversion)
- No direct write capabilities (read-only)

## TalkToFigma MCP Capabilities

### Read Functions Available:
1. **`get_document_info`** - Gets document information
2. **`get_selection`** - Gets current selection info
3. **`read_my_design`** - Gets detailed node information
4. **`get_node_info`** - Gets info for specific node
5. **`get_nodes_info`** - Gets info for multiple nodes
6. **`get_styles`** - Gets all styles from document
7. **`get_local_components`** - Gets all local components
8. **`get_annotations`** - Gets annotations for nodes

### Write Functions Available:
1. **`create_rectangle`** - Create rectangles
2. **`create_frame`** - Create frames
3. **`create_text`** - Create text elements
4. **`set_fill_color`** - Set fill colors
5. **`set_stroke_color`** - Set stroke colors
6. **`move_node`** - Move nodes
7. **`resize_node`** - Resize nodes
8. **`delete_node`** - Delete nodes
9. **`set_text_content`** - Update text content
10. **`create_component_instance`** - Create component instances
11. **And many more...**

### Known Limitations:
- **Coordinate System Bug**: `create_text`, `create_frame`, `create_rectangle` with `parentId` don't respect relative coordinates (uses absolute page coordinates instead)
- **Move Node Bug**: `move_node` doesn't apply coordinate changes to text nodes within frames
- **Timeout Issues**: Frequent timeouts when reading/writing
- **Requires Channel**: Must join a channel before use

## Comparison Summary

### For Read Operations (Figma → Code):

**Figma Desktop MCP:**
- ✅ Better for getting complete component code structure
- ✅ Provides image assets automatically
- ✅ Includes annotations
- ✅ More reliable (fewer timeouts)
- ❌ Returns Tailwind (needs conversion)
- ❌ Less granular control over what data to extract

**TalkToFigma MCP:**
- ✅ More granular read functions (can get specific node info)
- ✅ Can read styles, components, annotations separately
- ❌ Frequent timeout issues
- ❌ Requires channel management
- ❌ Less complete code generation

### For Write Operations (Code → Figma):

**Figma Desktop MCP:**
- ❌ No write capabilities (read-only)

**TalkToFigma MCP:**
- ✅ Full write capabilities
- ✅ Can create/update/delete nodes
- ✅ Can create component instances
- ❌ Has coordinate system bugs
- ❌ Frequent timeout issues

## Recommendation

### For Figma → Code Handoff:
**Use Figma Desktop MCP** for primary read operations:
- More reliable
- Better code generation
- Easier to use (no channel management)

**Use TalkToFigma MCP** as fallback for:
- Specific node information when Desktop MCP doesn't provide enough detail
- Reading styles/components separately when needed

### For Code → Figma Handoff:
**Use TalkToFigma MCP** (only option with write capabilities):
- Be aware of coordinate system bugs
- Implement workarounds for known issues
- Consider manual fixes for critical operations

## Gaps Identified

### Figma Desktop MCP Missing:
1. **Granular Node Info**: No equivalent to `get_node_info` for specific properties
2. **Style Extraction**: No direct way to get all styles (must parse from `get_design_context`)
3. **Component Info**: No direct way to get component definitions
4. **Write Operations**: No write capabilities at all

### TalkToFigma MCP Missing:
1. **Complete Code Generation**: Doesn't generate full component code like Desktop MCP
2. **Image Asset URLs**: Doesn't provide image asset URLs automatically
3. **Reliability**: Frequent timeouts make it unreliable for production use

## Conclusion

For the **Figma → Code handoff workflow**, **Figma Desktop MCP** is the better choice due to:
- Reliability
- Complete code generation
- Ease of use

However, **TalkToFigma MCP** is essential for **Code → Figma** workflows since it's the only option with write capabilities, despite its bugs and reliability issues.

