import { useState, useRef, useCallback, useEffect } from 'react';
import { Heap } from './heap';
import HeapTree from './HeapTree';
import ArrayView from './ArrayView';
import LogPanel from './LogPanel';
import './index.css';

const SPEED_MAP = { slow: 900, medium: 500, fast: 180 };

const OPERATIONS = [
  { id: 'insert', label: 'Insert', icon: '＋', desc: 'Add a value and bubble up' },
  { id: 'extractRoot', label: 'Extract Root', icon: '↑', desc: 'Remove root, sift down' },
  { id: 'peek', label: 'Peek', icon: '◎', desc: 'View root without removing' },
  { id: 'delete', label: 'Delete', icon: '✕', desc: 'Delete by index' },
  { id: 'heapify', label: 'Heapify', icon: '⟳', desc: 'Build heap from array' },
  { id: 'clear', label: 'Clear', icon: '▣', desc: 'Clear the heap' },
];

export default function App() {
  const [heapType, setHeapType] = useState('min');
  const [displayArray, setDisplayArray] = useState([]);
  const [highlightIdx, setHighlightIdx] = useState([]);
  const [swapIdx, setSwapIdx] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedOp, setSelectedOp] = useState('insert');
  const [inputValue, setInputValue] = useState('');
  const [deleteIndex, setDeleteIndex] = useState('');
  const [heapifyInput, setHeapifyInput] = useState('');
  const [speed, setSpeed] = useState('medium');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const heapRef = useRef(new Heap('min'));
  const animTimeoutRef = useRef(null);

  useEffect(() => {
    heapRef.current = new Heap(heapType);
    setDisplayArray([]);
    setLogs([{ message: `Switched to ${heapType}-heap. Heap cleared.`, logType: 'info' }]);
    setHighlightIdx([]);
    setSwapIdx([]);
  }, [heapType]);

  const playSteps = useCallback((steps) => {
    if (!steps || steps.length === 0) return;
    setIsAnimating(true);
    const delay = SPEED_MAP[speed];
    let i = 0;

    const next = () => {
      if (i >= steps.length) {
        setIsAnimating(false);
        setHighlightIdx([]);
        setSwapIdx([]);
        return;
      }
      const step = steps[i];
      setDisplayArray(step.array ? [...step.array] : []);
      setHighlightIdx(step.highlightIdx || []);
      setSwapIdx(step.swapIdx || []);
      setLogs(prev => [...prev, { message: step.message, logType: step.logType || 'info' }]);
      setAnimationKey(k => k + 1);
      i++;
      animTimeoutRef.current = setTimeout(next, delay);
    };
    next();
  }, [speed]);

  const handleOperation = useCallback(() => {
    if (isAnimating) return;
    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);

    let steps = [];

    switch (selectedOp) {
      case 'insert': {
        const val = parseFloat(inputValue);
        if (isNaN(val)) {
          setLogs(prev => [...prev, { message: 'Please enter a valid number.', logType: 'warning' }]);
          return;
        }
        steps = heapRef.current.insert(val);
        setInputValue('');
        break;
      }
      case 'extractRoot': {
        if (heapRef.current.array.length === 0) {
          setLogs(prev => [...prev, { message: 'Heap is empty.', logType: 'warning' }]);
          return;
        }
        steps = heapRef.current.extractRoot();
        break;
      }
      case 'peek': {
        if (heapRef.current.array.length === 0) {
          setLogs(prev => [...prev, { message: 'Heap is empty.', logType: 'warning' }]);
          return;
        }
        steps = heapRef.current.peek();
        break;
      }
      case 'delete': {
        const idx = parseInt(deleteIndex);
        if (isNaN(idx) || idx < 0 || idx >= heapRef.current.array.length) {
          setLogs(prev => [...prev, { message: `Invalid index. Valid: 0–${heapRef.current.array.length - 1}`, logType: 'warning' }]);
          return;
        }
        steps = heapRef.current.deleteAt(idx);
        setDeleteIndex('');
        break;
      }
      case 'heapify': {
        const parts = heapifyInput.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
        if (parts.length === 0) {
          setLogs(prev => [...prev, { message: 'Enter comma-separated numbers.', logType: 'warning' }]);
          return;
        }
        steps = heapRef.current.heapify(parts);
        setHeapifyInput('');
        break;
      }
      case 'clear': {
        steps = heapRef.current.clear();
        break;
      }
    }

    if (steps.length > 0) playSteps(steps);
  }, [selectedOp, inputValue, deleteIndex, heapifyInput, isAnimating, playSteps]);

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleOperation(); };
  const stopAnimation = () => {
    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    setIsAnimating(false);
    setHighlightIdx([]);
    setSwapIdx([]);
  };

  const accentColor = heapType === 'min' ? 'var(--accent-min)' : 'var(--accent-max)';
  const accentRgb = heapType === 'min' ? '0,229,255' : '255,77,109';

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        background: 'rgba(10,10,15,0.9)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 21, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              HEAP<span style={{ color: accentColor }}>VIZ</span>
            </div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em', marginTop: 2 }}>
              COMPOSITE PATTERN · BINARY HEAP
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="mode-toggle">
            <button className={`mode-btn ${heapType === 'min' ? 'active-min' : ''}`} onClick={() => !isAnimating && setHeapType('min')} disabled={isAnimating}>MIN</button>
            <button className={`mode-btn ${heapType === 'max' ? 'active-max' : ''}`} onClick={() => !isAnimating && setHeapType('max')} disabled={isAnimating}>MAX</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Space Mono, monospace', letterSpacing: '0.08em' }}>SPD</span>
            <select value={speed} onChange={e => setSpeed(e.target.value)} className="heap-input" style={{ padding: '5px 8px', borderRadius: 4, fontSize: 11 }}>
              <option value="slow">Slow</option>
              <option value="medium">Medium</option>
              <option value="fast">Fast</option>
            </select>
          </div>

          <div style={{
            padding: '5px 12px', borderRadius: 4,
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--text-secondary)',
          }}>
            n = <span style={{ color: accentColor, fontWeight: 700 }}>{displayArray.length}</span>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex' }}>

        {/* Sidebar */}
        <aside style={{
          width: 268,
          flexShrink: 0,
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-secondary)',
        }}>
          <div style={{ padding: '16px 14px 8px' }}>
            <div style={{ fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>
              OPERATIONS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {OPERATIONS.map(op => (
                <button
                  key={op.id}
                  onClick={() => !isAnimating && setSelectedOp(op.id)}
                  disabled={isAnimating}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 5,
                    border: `1px solid ${selectedOp === op.id ? accentColor : 'var(--border)'}`,
                    background: selectedOp === op.id ? `rgba(${accentRgb},0.06)` : 'transparent',
                    color: selectedOp === op.id ? accentColor : 'var(--text-secondary)',
                    cursor: isAnimating ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    opacity: isAnimating ? 0.5 : 1,
                  }}
                >
                  <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, width: 18, textAlign: 'center', flexShrink: 0 }}>{op.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12 }}>{op.label}</div>
                    <div style={{ fontSize: 9, fontFamily: 'Space Mono, monospace', color: 'var(--text-muted)', marginTop: 1 }}>{op.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Input area */}
          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>
              INPUT
            </div>

            {selectedOp === 'insert' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input className="heap-input" type="number" placeholder="Enter a number" value={inputValue}
                  onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 4 }} />
                <button className="btn-primary" onClick={handleOperation} disabled={isAnimating}
                  style={{ width: '100%', padding: '8px', borderRadius: 4, fontSize: 13 }}>Insert →</button>
              </div>
            )}

            {selectedOp === 'extractRoot' && (
              <button className="btn-danger" onClick={handleOperation} disabled={isAnimating || displayArray.length === 0}
                style={{ width: '100%', padding: '8px', borderRadius: 4, fontSize: 13, fontFamily: 'Space Mono' }}>
                Extract {heapType === 'min' ? 'Min' : 'Max'} →
              </button>
            )}

            {selectedOp === 'peek' && (
              <button className="btn-secondary" onClick={handleOperation} disabled={isAnimating || displayArray.length === 0}
                style={{ width: '100%', padding: '8px', borderRadius: 4, fontSize: 13 }}>
                Peek Root →
              </button>
            )}

            {selectedOp === 'delete' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input className="heap-input" type="number" placeholder={`Index (0–${Math.max(0, displayArray.length - 1)})`}
                  value={deleteIndex} onChange={e => setDeleteIndex(e.target.value)} onKeyDown={handleKeyDown}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 4 }} />
                <button className="btn-danger" onClick={handleOperation} disabled={isAnimating || displayArray.length === 0}
                  style={{ width: '100%', padding: '8px', borderRadius: 4, fontSize: 13, fontFamily: 'Space Mono' }}>
                  Delete at Index →
                </button>
              </div>
            )}

            {selectedOp === 'heapify' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input className="heap-input" type="text" placeholder="e.g. 4,10,3,5,1"
                  value={heapifyInput} onChange={e => setHeapifyInput(e.target.value)} onKeyDown={handleKeyDown}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 4 }} />
                <button className="btn-primary" onClick={handleOperation} disabled={isAnimating}
                  style={{ width: '100%', padding: '8px', borderRadius: 4, fontSize: 13 }}>Heapify →</button>
              </div>
            )}

            {selectedOp === 'clear' && (
              <button className="btn-danger" onClick={handleOperation} disabled={isAnimating || displayArray.length === 0}
                style={{ width: '100%', padding: '8px', borderRadius: 4, fontSize: 13, fontFamily: 'Space Mono' }}>
                Clear Heap →
              </button>
            )}
          </div>

          {isAnimating && (
            <div style={{ padding: '0 14px 10px' }}>
              <button className="btn-secondary" onClick={stopAnimation}
                style={{ width: '100%', padding: '7px', borderRadius: 4, fontSize: 11 }}>
                ■ Stop
              </button>
            </div>
          )}

          {/* Complexity table */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
            <div style={{ fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>
              TIME COMPLEXITY
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[['Insert', 'O(log n)'], ['Extract', 'O(log n)'], ['Peek', 'O(1)'], ['Delete', 'O(log n)'], ['Heapify', 'O(n)']].map(([op, cplx]) => (
                <div key={op} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'Space Mono, monospace', fontSize: 11 }}>{op}</span>
                  <span style={{ color: accentColor, fontFamily: 'Space Mono, monospace', fontSize: 11 }}>{cplx}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Tree view header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12, color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
                  BINARY TREE VIEW
                </span>
                <span className={`tag tag-${heapType}`}>{heapType}-heap</span>
              </div>
              {isAnimating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: accentColor, display: 'inline-block', animation: 'fadeIn 0.6s ease infinite alternate' }} />
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: accentColor }}>animating</span>
                </div>
              )}
            </div>

            {/* Tree canvas */}
            <div className="card" style={{ borderRadius: 8, padding: '16px', overflow: 'hidden' }}>
              <HeapTree
                heapArray={displayArray}
                highlightIdx={highlightIdx}
                swapIdx={swapIdx}
                heapType={heapType}
                animationKey={animationKey}
              />
            </div>

            {/* Array representation */}
            <div>
              <div style={{ fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 7 }}>
                ARRAY REPRESENTATION
              </div>
              <div className="card" style={{ borderRadius: 6, padding: '12px 14px', overflowX: 'auto' }}>
                <ArrayView array={displayArray} highlightIdx={highlightIdx} swapIdx={swapIdx} />
              </div>
            </div>

            {/* Formula bar */}
            <div className="card" style={{ borderRadius: 6, padding: '9px 14px', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[['Parent(i)', 'floor((i-1)/2)'], ['Left(i)', '2i + 1'], ['Right(i)', '2i + 2']].map(([label, formula]) => (
                <div key={label} style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: accentColor }}>= {formula}</span>
                </div>
              ))}
            </div>

            {/* Log */}
            <div>
              <div style={{ fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 7 }}>
                STEP-BY-STEP LOG
              </div>
              <LogPanel logs={logs} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
