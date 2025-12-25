## CONTEXT OF PROJECT

- you'll have 1 mcp tool you can use for the research portion of this project: Figma Desktop MCP
- and another tool you can use for the implementation portion of this project: TalkToFigma MCP

we need to design/create the frames, layers, components, animations, and interactions in figma for a user journey outlined in the following figjams:

- 0. Backend Schema: <https://www.figma.com/board/elBFplPOzBmaJnbcFJ5DxG/Remember-View?node-id=0-1&p=f&t=rqEzuLOOjXKqAAjK-11>
- 1. Lo-fi UI: <https://www.figma.com/board/elBFplPOzBmaJnbcFJ5DxG/Remember-View?node-id=4-2998&p=f&t=rqEzuLOOjXKqAAjK-11>
- 2. Less Lo-fi UI: <https://www.figma.com/board/elBFplPOzBmaJnbcFJ5DxG/Remember-View?node-id=4-2999&p=f&t=rqEzuLOOjXKqAAjK-11>
- 3a. Lo-fi UX: going back/forwards in time: <https://www.figma.com/board/elBFplPOzBmaJnbcFJ5DxG/Remember-View?node-id=4-4728&t=rqEzuLOOjXKqAAjK-11>
- 3b. Lo-fi UX: switching to a different creator's timeline: <https://www.figma.com/board/elBFplPOzBmaJnbcFJ5DxG/Remember-View?node-id=4-3001&p=f&t=rqEzuLOOjXKqAAjK-11>
- 3c. Lo-fi UX: clicking the shuffle button to jump to a random memory on active creator's timeline: <https://www.figma.com/board/elBFplPOzBmaJnbcFJ5DxG/Remember-View?node-id=4-3002&p=f&t=rqEzuLOOjXKqAAjK-11>
- 4. Mid-fi Mockup: <https://www.figma.com/board/elBFplPOzBmaJnbcFJ5DxG/Remember-View?node-id=4-3003&p=f&t=rqEzuLOOjXKqAAjK-11>

these are meant to be read in sequential order. 

for now, assume that it's designed for mobile web mode - desktop mode keeps the viewport width effectively the same (there's just more empty space on either side beyond the width of the mobile viewport)

## YOUR TO-DOS
- First, review the specs (for this project, we're focusing just on the layers/frames/components/animations/effects created in figma -> frontend codeability. we're not focused on backend.) and if you have any clarifying questions ask me them.
- Then, given the relative complexity (maybe? not sure how complex this is) of the components (depth perception of components in the grid) and transition animations, advise me on whether this is possible to set up in figma or whether we need more advanced 3d modeling software to mock this up.
- Once i've reviewed feasibility, if it's feasible, we'll begin implementing in figma

## A few some specific questions i have:
1. I'm familiar with frames/layers in figma for more flat designs (a birds eye down view of a dashboard is flat, for example). For something like this where we want depth perception and animations, will figma be able to handle/define these? open to using plugins etc if needed - but ideally can do this purely with core figma and well structured layers, frames, and animations
2. what parts of implementing the hi-fi in figma will be most challenging?
3. what parts of implementing the hi-fis completed in figma in code will be most challenging?

## ROADMAP AFTER initial TO-D0s scoped for this plan completed
1. code the design in frontend
2. test interactions/experience
