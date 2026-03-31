# Pixel Agents Office

> A pixel-art virtual office with 5 AI agents collaborating in real-time.

## Overview

A multidisciplinary AI agent development platform visualized as a pixel-art virtual office (inspired by Gather). Five AI agents with distinct roles collaborate in real-time. Watch their activity logs, interactions, and movement within the office as they code, review, test, and deploy together.

## Agents

| Agent | Role | Color |
|-------|------|-------|
| **Luna** | Tech Lead | Purple (`#a78bfa`) |
| **Max** | Frontend Dev | Green (`#34d399`) |
| **Ava** | Backend Dev | Blue (`#60a5fa`) |
| **Sam** | QA Engineer | Yellow (`#fbbf24`) |
| **Rio** | DevOps/Fullstack | Red (`#f87171`) |

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Start the production server |
| `pnpm test` | Run tests (vitest) |
| `pnpm lint` | Run ESLint |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Pixel Rendering | HTML5 Canvas (custom engine) |
| State Management | Zustand |
| Animations | Sprite sheets + requestAnimationFrame |
| Pathfinding | A* algorithm on grid map |
| Testing | Vitest + Testing Library |
| Package Manager | pnpm |

## Project Structure

```
pixel-agents-office/
├── public/sprites/        # Pixel art sprite sheets
├── src/
│   ├── app/               # Next.js App Router pages & layout
│   ├── components/        # React components (office, agents, activity, editor, ui)
│   ├── engine/            # Canvas game loop, renderer, pathfinder, tilemap
│   ├── store/             # Zustand stores (office, agents, activity)
│   ├── simulation/        # Agent behavior, interactions, scheduler, scenarios
│   ├── data/              # Map layout, agent profiles, furniture & accessory catalogs
│   └── types/             # TypeScript type definitions
└── tests/                 # Test files
```

## Development Plan

See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for the full phased implementation plan.
