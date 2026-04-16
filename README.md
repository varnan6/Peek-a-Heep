# HeapViz — Min/Max Heap Visualizer

An interactive binary heap visualizer built with React, D3.js, and Tailwind CSS, implementing the **Composite Design Pattern**.

## Features

- **Min-Heap & Max-Heap** toggle
- **6 Operations**: Insert, Extract Root, Peek, Delete by Index, Heapify, Clear
- **Step-by-step animation** with adjustable speed (Slow / Medium / Fast)
- **Binary tree view** rendered with D3.js — nodes highlight and animate on each step
- **Array representation** synchronized with the tree
- **Step-by-step operation log**
- **Time complexity reference** panel

## Tech Stack

| Tool | Purpose |
|------|---------|
| React (JS) | UI components + Composite pattern |
| Vite | Build tool & dev server |
| D3.js | Tree layout & SVG rendering |
| Tailwind CSS | Styling |
| Vercel | Hosting |

## Design Pattern

The heap logic follows the **Composite Pattern**:
- `HeapNode` acts as the component interface (leaf or composite)
- `isLeaf()`, `getAll()`, `depth()` work recursively across all nodes
- `Heap` class orchestrates operations on the flat array, converting to tree for visualization

## Getting Started

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Vercel auto-detects Vite — zero config needed
4. Every push to `main` auto-deploys

## Project Structure

```
src/
  heap.js         # HeapNode (Composite Pattern) + Heap logic
  HeapTree.jsx    # D3.js tree visualization
  ArrayView.jsx   # Array representation with highlights
  LogPanel.jsx    # Step-by-step operation log
  App.jsx         # Main app, state, animation orchestration
  index.css       # Design tokens + custom styles
```
