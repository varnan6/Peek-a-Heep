import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const NODE_RADIUS = 22;
const COLORS = {
  min: { node: '#0a2a33', stroke: '#00e5ff', text: '#00e5ff', highlight: '#00e5ff', swap: '#ff4d6d', edge: '#2a3a4a' },
  max: { node: '#2a0a14', stroke: '#ff4d6d', text: '#ff4d6d', highlight: '#ff4d6d', swap: '#00e5ff', edge: '#3a2a2a' },
};

export default function HeapTree({ heapArray, highlightIdx, swapIdx, heapType, animationKey }) {
  const svgRef = useRef(null);
  const prevArrayRef = useRef([]);

  useEffect(() => {
    if (!svgRef.current) return;

    const colors = COLORS[heapType] || COLORS.min;
    const svg = d3.select(svgRef.current);

    if (!heapArray || heapArray.length === 0) {
      svg.selectAll('*').remove();
      // Empty state message
      svg.append('text')
        .attr('x', '50%').attr('y', '50%')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#44445a')
        .attr('font-family', 'Space Mono, monospace')
        .attr('font-size', '13px')
        .text('Heap is empty — insert values to begin');
      prevArrayRef.current = [];
      return;
    }

    // Build tree data from array
    const buildTree = (arr, i = 0) => {
      if (i >= arr.length) return null;
      const node = { arrayIdx: i, value: arr[i], children: [] };
      const left = buildTree(arr, 2 * i + 1);
      const right = buildTree(arr, 2 * i + 2);
      if (left) node.children.push(left);
      if (right) node.children.push(right);
      return node;
    };

    const treeData = buildTree(heapArray);
    if (!treeData) return;

    const containerWidth = svgRef.current.parentElement?.clientWidth || 600;
    const depth = Math.ceil(Math.log2(heapArray.length + 1));
    const height = Math.max(200, depth * 90 + 60);
    const width = containerWidth;

    svg.attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    const root = d3.hierarchy(treeData, d => d.children.length > 0 ? d.children : null);

    const treeLayout = d3.tree()
      .size([width - 80, height - 80])
      .separation((a, b) => (a.parent === b.parent ? 1.2 : 1.8));

    treeLayout(root);

    const g = svg.append('g').attr('transform', 'translate(40, 40)');

    // Edges
    g.selectAll('.heap-edge')
      .data(root.links())
      .enter()
      .append('line')
      .attr('class', 'heap-edge')
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y)
      .attr('stroke', colors.edge)
      .attr('stroke-width', 1.5)
      .attr('opacity', 0)
      .transition().duration(300)
      .attr('opacity', 0.6);

    // Nodes
    const nodeGroups = g.selectAll('.heap-node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'heap-node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    nodeGroups.each(function(d) {
      const group = d3.select(this);
      const arrayIdx = d.data.arrayIdx;
      const isHighlighted = highlightIdx && highlightIdx.includes(arrayIdx);
      const isSwapped = swapIdx && swapIdx.includes(arrayIdx);
      const isNew = !prevArrayRef.current.includes(heapArray[arrayIdx]);
      const isRoot = arrayIdx === 0;

      let strokeColor = colors.stroke;
      let fillColor = colors.node;
      let opacity = 0.35;

      if (isSwapped) {
        strokeColor = colors.swap;
        fillColor = heapType === 'min' ? '#2a0a14' : '#0a2a33';
        opacity = 1;
      } else if (isHighlighted) {
        strokeColor = colors.highlight;
        fillColor = heapType === 'min' ? '#0a2a33' : '#2a0a14';
        opacity = 0.8;
      } else if (isRoot) {
        opacity = 0.55;
      }

      // Outer glow for highlighted
      if (isHighlighted || isSwapped) {
        group.append('circle')
          .attr('r', NODE_RADIUS + 6)
          .attr('fill', 'none')
          .attr('stroke', strokeColor)
          .attr('stroke-width', 1)
          .attr('opacity', 0.2);
      }

      // Index label (top left)
      group.append('text')
        .attr('x', -NODE_RADIUS - 2)
        .attr('y', -NODE_RADIUS + 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#44445a')
        .attr('font-family', 'Space Mono, monospace')
        .attr('font-size', '9px')
        .text(`[${arrayIdx}]`);

      // Main circle
      const circle = group.append('circle')
        .attr('r', 0)
        .attr('fill', fillColor)
        .attr('stroke', strokeColor)
        .attr('stroke-width', isHighlighted || isSwapped ? 2 : 1.5)
        .attr('opacity', opacity);

      circle.transition()
        .duration(isNew ? 400 : 200)
        .ease(d3.easeBackOut.overshoot(isNew ? 1.5 : 1))
        .attr('r', isRoot ? NODE_RADIUS + 3 : NODE_RADIUS);

      // Value text
      group.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', isHighlighted || isSwapped ? strokeColor : '#f0f0ff')
        .attr('font-family', 'Syne, sans-serif')
        .attr('font-weight', '700')
        .attr('font-size', isRoot ? '14px' : '13px')
        .attr('opacity', 0)
        .text(d.data.value === -Infinity ? '-∞' : d.data.value === Infinity ? '+∞' : d.data.value)
        .transition().delay(isNew ? 200 : 0).duration(200)
        .attr('opacity', 1);

      // Root crown indicator
      if (isRoot) {
        group.append('text')
          .attr('y', -NODE_RADIUS - 8)
          .attr('text-anchor', 'middle')
          .attr('fill', strokeColor)
          .attr('font-size', '10px')
          .attr('opacity', 0.7)
          .text(heapType === 'min' ? '▲ root' : '▼ root');
      }
    });

    prevArrayRef.current = [...heapArray];
  }, [heapArray, highlightIdx, swapIdx, heapType, animationKey]);

  return (
    <svg
      ref={svgRef}
      style={{ width: '100%', display: 'block', minHeight: 200 }}
    />
  );
}
