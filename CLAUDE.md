# Pixel Agents Office

## Project Overview

A multidisciplinary AI agent development platform visualized as a **pixel-art virtual office** (inspired by Gather). Five AI agents with distinct roles collaborate in real-time, and the user can observe their activity logs, interactions, and movement within the office.

## Agent Roles

| Agent | Role | Responsibilities |
|-------|------|-----------------|
| **Luna** | Tech Lead | Architecture decisions, code reviews, sprint planning, task delegation |
| **Max** | Frontend Dev | UI/UX implementation, component development, responsive design |
| **Ava** | Backend Dev | API design, database logic, server-side services, integrations |
| **Sam** | QA Engineer | Test plans, bug reporting, regression testing, quality gates |
| **Rio** | DevOps/Fullstack | CI/CD, deployments, infrastructure, cross-stack support |

## Core Features

### 1. Pixel Office Environment
- 2D top-down pixel-art office map (canvas-based or tile engine)
- Rooms: **open workspace**, **meeting room**, **kitchen/break area**, **server room**
- Objects: desks, chairs, whiteboards, vending machines, coffee machine, plants
- Fully **responsive** layout — works on mobile, tablet, and desktop
- Smooth camera panning and zoom

### 2. Pixel Agent Characters
- Each agent is a pixel-art sprite with idle, walk, and talk animations
- **Customizable appearance**: hair, outfit color, accessories (glasses, hats, headphones, etc.)
- Agents navigate between rooms using pathfinding (A* or simple grid movement)
- When an agent communicates with another, it physically walks to that agent's location

### 3. Agent Interaction System
- Agents send messages to each other (visible as speech bubbles and in the activity log)
- Interactions trigger movement: sender walks to receiver before speaking
- Meeting room supports group discussions (all agents gather)
- Interactions can be: code review requests, bug reports, deployment updates, architecture discussions

### 4. Activity Log Panel
- Real-time scrollable log showing all agent activity
- Filterable by agent, activity type, or room
- Entries include: timestamp, agent name, action description, related agents
- Types: `message`, `code_commit`, `review`, `bug_found`, `deployment`, `meeting`, `break`

### 5. Office Customization
- **Furniture/accessories editor**: add, move, remove, and resize office objects
- **Agent appearance editor**: modify each agent's sprite (colors, accessories, outfit)
- Drag-and-drop interface for placing items
- Preset themes (modern office, retro, dark mode)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 14** (App Router) |
| Language | **TypeScript** |
| Styling | **Tailwind CSS** |
| Pixel Rendering | **HTML5 Canvas** via custom engine or **PixiJS** |
| State Management | **Zustand** |
| Animations | Sprite sheets + requestAnimationFrame loop |
| Pathfinding | A* algorithm on grid map |
| Responsive | Tailwind breakpoints + dynamic canvas scaling |
| Package Manager | **pnpm** |

## Project Structure

```
pixel-agents-office/
├── CLAUDE.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── public/
│   └── sprites/          # Pixel art sprite sheets
│       ├── agents/       # Agent character sprites
│       ├── furniture/    # Office furniture tiles
│       ├── rooms/        # Room background tiles
│       └── effects/      # Speech bubbles, particles
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Main office view
│   │   └── globals.css
│   ├── components/
│   │   ├── office/
│   │   │   ├── OfficeCanvas.tsx      # Main canvas rendering engine
│   │   │   ├── OfficeMap.tsx         # Tile map and room layout
│   │   │   ├── MiniMap.tsx           # Overview minimap
│   │   │   └── Camera.tsx            # Pan/zoom controls
│   │   ├── agents/
│   │   │   ├── AgentSprite.tsx       # Individual agent renderer
│   │   │   ├── AgentBubble.tsx       # Speech bubble overlay
│   │   │   ├── AgentEditor.tsx       # Appearance customization modal
│   │   │   └── AgentCard.tsx         # Agent info sidebar card
│   │   ├── activity/
│   │   │   ├── ActivityLog.tsx       # Real-time log panel
│   │   │   ├── ActivityEntry.tsx     # Single log entry
│   │   │   └── ActivityFilter.tsx    # Filter controls
│   │   ├── editor/
│   │   │   ├── FurniturePanel.tsx    # Add/remove furniture
│   │   │   ├── DragHandle.tsx        # Drag-and-drop for items
│   │   │   └── ThemeSelector.tsx     # Office theme presets
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── Panel.tsx
│   │       └── Tooltip.tsx
│   ├── engine/
│   │   ├── GameLoop.ts           # Main update/render loop
│   │   ├── Renderer.ts           # Canvas draw calls
│   │   ├── SpriteSheet.ts        # Sprite loading & frame extraction
│   │   ├── Pathfinder.ts         # A* grid pathfinding
│   │   └── TileMap.ts            # Tile-based map data structure
│   ├── store/
│   │   ├── useOfficeStore.ts     # Office state (furniture, rooms)
│   │   ├── useAgentStore.ts      # Agent positions, states, appearance
│   │   └── useActivityStore.ts   # Activity log entries
│   ├── simulation/
│   │   ├── AgentBehavior.ts      # AI decision-making logic
│   │   ├── InteractionManager.ts # Agent-to-agent communication
│   │   ├── Scheduler.ts          # Task scheduling and events
│   │   └── scenarios.ts          # Predefined interaction scenarios
│   ├── data/
│   │   ├── mapLayout.ts          # Default office map tiles
│   │   ├── agentProfiles.ts      # Default agent configs
│   │   ├── furnitureCatalog.ts   # Available furniture items
│   │   └── accessoryCatalog.ts   # Agent accessories catalog
│   └── types/
│       ├── agent.ts
│       ├── office.ts
│       ├── activity.ts
│       └── editor.ts
└── tests/
    └── ...
```

## Design Reference

Inspired by **Gather.town**:
- Isometric-ish top-down pixel art style
- Characters move on a grid-based map
- Proximity-based interactions (agents talk when near each other)
- Rooms have functional context (meeting room triggers group talks)
- Cozy, playful aesthetic with attention to small details (animated objects, ambient effects)

## Development Guidelines

- Mobile-first responsive design — the canvas and UI panels must adapt to all screen sizes
- Use Zustand for all shared state; avoid prop drilling
- Keep the game loop decoupled from React rendering (use refs for canvas)
- Sprite sheets should use consistent tile sizes (16x16 or 32x32 base)
- All agent interactions must produce an activity log entry
- Pathfinding runs on a walkable-tile grid derived from the map layout
- Agent behavior should be event-driven with a simple state machine (idle, walking, talking, meeting, break)

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # Lint check
```
