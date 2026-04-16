export default function ArrayView({ array, highlightIdx, swapIdx }) {
  if (!array || array.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', fontFamily: 'Space Mono, monospace', fontSize: 12, padding: '8px 0' }}>
        [ empty ]
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
      {array.map((val, i) => {
        const isHighlighted = highlightIdx && highlightIdx.includes(i);
        const isSwapped = swapIdx && swapIdx.includes(i);
        let cellClass = 'array-cell';
        if (isSwapped) cellClass += ' swapped';
        else if (isHighlighted) cellClass += ' highlighted';

        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div className={cellClass}>
              {val === -Infinity ? '-∞' : val === Infinity ? '+∞' : val}
            </div>
            <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'Space Mono, monospace' }}>
              {i}
            </span>
          </div>
        );
      })}
    </div>
  );
}
