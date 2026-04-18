# Peek-a-Heep (HeapViz)

An interactive, animated binary heap visualizer built with React, D3.js, and Tailwind CSS. Peek-a-Heep allows users to deeply understand how Min and Max heaps function under the hood by providing step-by-step visualizations of core data structure operations.

## ✨ Features

- **Dynamic Heap Types:** Seamlessly toggle between Min-Heap and Max-Heap modes.
- **Interactive Operations:**
    - **Insert:** Add elements and watch them "bubble up" to their correct position.
    - **Extract Root:** Remove the minimum or maximum element and visualize the "sift down" rebalancing.
    - **Peek:** View the root element.
    - **Delete:** Remove an element at any given index with full rebalancing animation.
    - **Heapify:** Transform an arbitrary array into a valid heap in $O(n)$ time.
    - **Clear:** Reset the heap completely.
- **Granular Animation Controls:** Watch operations unfold step-by-step with adjustable playback speeds (Slow, Medium, Fast).
- **Synchronized Dual Views:**
    - **Binary Tree View:** Powered by D3.js, this view visualizes the hierarchical structure, highlighting node comparisons, swaps, and insertions.
    - **Array View:** See the exact 1D array representation of the heap, synchronized with tree highlights to connect abstract concepts to memory layout.
- **Execution Log:** Follow along with a detailed, step-by-step text log explaining the algorithm's decisions during operations.
- **Design Pattern Showcase:** Explicitly implements the **Composite Design Pattern** (`HeapNode` interface) and the **Strategy Pattern** (dynamic comparison logic) in its underlying architecture.

## 🛠️ Tech Stack

- **Frontend Framework:** React 19
- **Visualization:** D3.js
- **Styling:** Tailwind CSS & Custom CSS Animations
- **Build Tool:** Vite

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/varnan6/Peek-a-Heep.git
   cd Peek-a-Heep
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173/`.

## 🧠 Design Patterns Implemented

- **Composite Pattern:** Utilized to represent the heap structure uniformly. `HeapNode` acts as the component interface, allowing operations on individual leaf nodes or composite subtrees recursively (`isLeaf()`, `getAll()`).
- **Strategy Pattern:** The heap's ordering logic (`shouldSwap`) dynamically switches behavior based on whether the application is currently in 'min' or 'max' mode, decoupling the algorithm from the specific ordering rules.
- **Command/Recorder Pattern:** Operations don't immediately mutate the visualization; instead, they generate a sequence of application state "steps" that are replayed by the animation engine over time.

## 📁 Project Structure

- `src/heap.js`: Core data structure logic, algorithm implementation, and design patterns.
- `src/HeapTree.jsx`: D3.js SVG rendering engine for the binary tree visualization.
- `src/ArrayView.jsx`: Component rendering the linear array representation.
- `src/App.jsx`: Main application state management, animation orchestration, and UI assembly.
