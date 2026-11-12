import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react'

export default function ConceptVisualizer({ concept }) {
  const [currentPresetIndex, setCurrentPresetIndex] = useState(0)
  const [customInputText, setCustomInputText] = useState('')
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)

  const activePreset = concept.presets?.[currentPresetIndex] || concept.presets?.[0] || {}

  // Generate frames based on concept type
  const frames = generateFramesForConcept(concept.visualizerType, activePreset, customInputText)

  useEffect(() => {
    setStepIndex(0)
    setPlaying(false)
  }, [concept.id, currentPresetIndex])

  useEffect(() => {
    if (!playing || stepIndex >= frames.length - 1) return undefined
    const timer = window.setTimeout(() => {
      setStepIndex((idx) => {
        if (idx >= frames.length - 1) {
          setPlaying(false)
          return idx
        }
        return idx + 1
      })
    }, speed)
    return () => window.clearTimeout(timer)
  }, [playing, stepIndex, frames.length, speed])

  const currentFrame = frames[stepIndex] || frames[0] || { message: 'Visualizer ready.' }

  const handleCustomInputSubmit = (e) => {
    e.preventDefault()
    setPlaying(false)
    setStepIndex(0)
  }

  return (
    <div className="concept-visualizer-container panel" style={{ background: '#121214', border: '1px solid #27272a', borderRadius: '12px', padding: '20px', marginTop: '16px' }}>
      {/* Header with controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #27272a', paddingBottom: '14px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
              <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} /> Interactive Concept Visualizer
            </span>
            <span style={{ fontSize: '12px', color: '#a1a1aa' }}>
              Step {stepIndex + 1} of {frames.length}
            </span>
          </div>
          <h3 style={{ margin: '6px 0 0', fontSize: '17px', color: '#fff' }}>{concept.name}</h3>
        </div>

        {/* Preset Selector & Speed */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {concept.presets && concept.presets.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label htmlFor="preset-select" style={{ fontSize: '12px', color: '#a1a1aa' }}>Example:</label>
              <select
                id="preset-select"
                value={currentPresetIndex}
                onChange={(e) => { setCurrentPresetIndex(Number(e.target.value)); setStepIndex(0); setPlaying(false); }}
                style={{ background: '#1f1f23', color: '#fff', border: '1px solid #3f3f46', borderRadius: '6px', padding: '4px 8px', fontSize: '12px' }}
              >
                {concept.presets.map((preset, idx) => (
                  <option key={idx} value={idx}>{preset.label}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label htmlFor="speed-select" style={{ fontSize: '12px', color: '#a1a1aa' }}>Speed:</label>
            <select
              id="speed-select"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              style={{ background: '#1f1f23', color: '#fff', border: '1px solid #3f3f46', borderRadius: '6px', padding: '4px 8px', fontSize: '12px' }}
            >
              <option value={1400}>0.5×</option>
              <option value={800}>1×</option>
              <option value={400}>2×</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visual Canvas Area */}
      <div
        className="visual-canvas"
        style={{
          minHeight: '220px',
          background: '#09090b',
          border: '1px solid #1f1f23',
          borderRadius: '8px',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {renderVisualElements(concept.visualizerType, currentFrame)}
      </div>

      {/* Frame Explanation */}
      <div style={{ margin: '16px 0', background: '#18181b', border: '1px solid #27272a', borderRadius: '6px', padding: '12px 16px' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#e4e4e7', lineHeight: '1.5' }}>
          <strong style={{ color: '#fbbf24' }}>Step {stepIndex + 1}: </strong>
          {currentFrame.message}
        </p>
        {currentFrame.variables && Object.keys(currentFrame.variables).length > 0 && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid #27272a' }}>
            {Object.entries(currentFrame.variables).map(([k, v]) => (
              <span key={k} style={{ fontSize: '12px', fontFamily: 'monospace', color: '#86efac' }}>
                <strong style={{ color: '#a1a1aa' }}>{k} = </strong>{String(v)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <button
          type="button"
          className="quiet-button"
          onClick={() => { setPlaying(false); setStepIndex(0); }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '13px' }}
        >
          <RotateCcw size={14} /> Reset
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="icon-button"
            onClick={() => { setPlaying(false); setStepIndex((idx) => Math.max(0, idx - 1)); }}
            disabled={stepIndex === 0}
            aria-label="Previous step"
            style={{ width: '36px', height: '36px' }}
          >
            <ArrowLeft size={16} />
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() => {
              if (playing) {
                setPlaying(false)
              } else {
                if (stepIndex >= frames.length - 1) setStepIndex(0)
                setPlaying(true)
              }
            }}
            style={{ padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            {playing ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Play</>}
          </button>

          <button
            type="button"
            className="icon-button"
            onClick={() => { setPlaying(false); setStepIndex((idx) => Math.min(frames.length - 1, idx + 1)); }}
            disabled={stepIndex >= frames.length - 1}
            aria-label="Next step"
            style={{ width: '36px', height: '36px' }}
          >
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '4px', background: '#27272a', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
          <div
            style={{
              height: '100%',
              width: `${((stepIndex + 1) / frames.length) * 100}%`,
              background: '#fbbf24',
              transition: 'width 0.2s ease',
            }}
          />
        </div>
      </div>
    </div>
  )
}

function renderVisualElements(type, frame) {
  if (!frame) return <div style={{ color: '#71717a' }}>No frame data</div>

  // 1. Array-based Renderers (declaration, traversal, insertion, deletion, reversal, binary search, two pointers, sliding window)
  if (frame.array) {
    const is2D = Array.isArray(frame.array[0])
    if (is2D) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {frame.array.map((row, rIdx) => (
            <div key={rIdx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#71717a', width: '40px', textAlign: 'right' }}>row {rIdx}</span>
              {row.map((val, cIdx) => (
                <div
                  key={cIdx}
                  style={{
                    width: '44px',
                    height: '44px',
                    background: frame.activeRow === rIdx && frame.activeCol === cIdx ? '#f59e0b' : '#18181b',
                    color: frame.activeRow === rIdx && frame.activeCol === cIdx ? '#000' : '#fff',
                    border: '1px solid #3f3f46',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  {val}
                </div>
              ))}
            </div>
          ))}
        </div>
      )
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
        {/* Pointers / Indicators Header */}
        <div style={{ display: 'flex', gap: '10px', minHeight: '24px' }}>
          {frame.array.map((_, idx) => {
            const pointers = []
            if (frame.leftIndex === idx) pointers.push({ label: 'L', color: '#38bdf8' })
            if (frame.rightIndex === idx) pointers.push({ label: 'R', color: '#c084fc' })
            if (frame.midIndex === idx) pointers.push({ label: 'MID', color: '#fbbf24' })
            if (frame.currentIndex === idx) pointers.push({ label: 'i', color: '#86efac' })

            return (
              <div key={idx} style={{ width: '56px', textAlign: 'center', fontSize: '12px', fontWeight: 700 }}>
                {pointers.map((p, pIdx) => (
                  <span key={pIdx} style={{ color: p.color, marginRight: '3px' }}>{p.label}↓</span>
                ))}
              </div>
            )
          })}
        </div>

        {/* Array Cells */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {frame.array.map((val, idx) => {
            const isActive = frame.activeIndices?.includes(idx) || frame.currentIndex === idx
            const isDimmed = frame.dimmedIndices?.includes(idx)
            const isHighlighted = frame.highlightedIndices?.includes(idx)
            const isSorted = frame.sortedIndices?.includes(idx)
            const isMatch = frame.matchIndices?.includes(idx)

            let bgColor = '#18181b'
            let borderColor = '#27272a'
            let textColor = '#fff'

            if (isMatch) {
              bgColor = '#065f46'
              borderColor = '#10b981'
              textColor = '#ecfdf5'
            } else if (isActive) {
              bgColor = '#f59e0b'
              borderColor = '#fbbf24'
              textColor = '#000'
            } else if (isHighlighted) {
              bgColor = 'rgba(56, 189, 248, 0.2)'
              borderColor = '#38bdf8'
            } else if (isSorted) {
              bgColor = 'rgba(16, 185, 129, 0.15)'
              borderColor = '#059669'
            } else if (isDimmed) {
              bgColor = '#0e0e11'
              borderColor = '#18181b'
              textColor = '#52525b'
            }

            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '8px',
                    background: bgColor,
                    border: `2px solid ${borderColor}`,
                    color: textColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '17px',
                    fontWeight: 700,
                    transition: 'all 0.25s ease',
                    boxShadow: isActive ? '0 0 12px rgba(245, 158, 11, 0.4)' : 'none',
                  }}
                >
                  {val === null || val === undefined ? '—' : val}
                </div>
                <span style={{ fontSize: '11px', color: '#71717a' }}>idx {idx}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // 2. Linked List Renderer
  if (frame.linkedList) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {frame.linkedList.map((node, idx) => {
          const isCurr = frame.currentNode === idx
          const isPrev = frame.prevNode === idx
          const isNext = frame.nextNode === idx

          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ display: 'flex', gap: '4px', minHeight: '16px', fontSize: '11px', fontWeight: 700 }}>
                  {isPrev && <span style={{ color: '#c084fc' }}>prev</span>}
                  {isCurr && <span style={{ color: '#fbbf24' }}>curr</span>}
                  {isNext && <span style={{ color: '#38bdf8' }}>next</span>}
                </div>
                <div
                  style={{
                    display: 'flex',
                    background: isCurr ? '#f59e0b' : '#18181b',
                    color: isCurr ? '#000' : '#fff',
                    border: '2px solid #3f3f46',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: '10px 14px', fontWeight: 700, borderRight: '1px solid #3f3f46' }}>
                    {node.val}
                  </div>
                  <div style={{ padding: '10px 8px', fontSize: '11px', color: isCurr ? '#000' : '#a1a1aa' }}>
                    •
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '18px', color: frame.isReversed ? '#c084fc' : '#fbbf24', fontWeight: 700 }}>
                {frame.isReversed ? '←' : '→'}
              </span>
            </div>
          )
        })}
        <div style={{ padding: '8px 12px', background: '#18181b', border: '1px solid #27272a', borderRadius: '6px', fontSize: '12px', color: '#71717a' }}>
          null
        </div>
      </div>
    )
  }

  // 3. Stack Renderer
  if (frame.stack) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 600 }}>TOP OF STACK ↓</span>
        <div
          style={{
            width: '140px',
            minHeight: '160px',
            borderLeft: '3px solid #fbbf24',
            borderRight: '3px solid #fbbf24',
            borderBottom: '3px solid #fbbf24',
            borderRadius: '0 0 8px 8px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: '6px',
            background: 'rgba(0,0,0,0.4)',
          }}
        >
          {frame.stack.length === 0 ? (
            <div style={{ margin: 'auto', fontSize: '12px', color: '#52525b' }}>Stack is empty</div>
          ) : (
            frame.stack.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '8px 12px',
                  background: idx === frame.stack.length - 1 ? '#f59e0b' : '#27272a',
                  color: idx === frame.stack.length - 1 ? '#000' : '#fff',
                  borderRadius: '4px',
                  fontWeight: 700,
                  textAlign: 'center',
                  fontSize: '14px',
                }}
              >
                {item}
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  // 4. Queue Renderer
  if (frame.queue) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '280px', fontSize: '11px', color: '#fbbf24', fontWeight: 600 }}>
          <span>← FRONT (Dequeue)</span>
          <span>REAR (Enqueue) ←</span>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '12px',
            borderTop: '2px solid #3f3f46',
            borderBottom: '2px solid #3f3f46',
            minWidth: '280px',
            minHeight: '56px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {frame.queue.length === 0 ? (
            <span style={{ fontSize: '12px', color: '#52525b' }}>Queue is empty</span>
          ) : (
            frame.queue.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '8px 14px',
                  background: idx === 0 ? '#10b981' : '#27272a',
                  color: '#fff',
                  borderRadius: '6px',
                  fontWeight: 700,
                }}
              >
                {item}
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  // 5. Tree Renderer
  if (frame.treeNodes) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {frame.treeNodes.map((node, idx) => (
            <div
              key={idx}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: frame.activeNode === node.val ? '#f59e0b' : frame.visitedNodes?.includes(node.val) ? '#065f46' : '#27272a',
                color: frame.activeNode === node.val ? '#000' : '#fff',
                border: '2px solid #3f3f46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '15px',
              }}
            >
              {node.val}
            </div>
          ))}
        </div>
        {frame.traversalHistory && (
          <div style={{ fontSize: '13px', color: '#a1a1aa' }}>
            <strong>Visited Order: </strong>
            <span style={{ color: '#86efac', fontFamily: 'monospace' }}>
              {frame.traversalHistory.join(' -> ')}
            </span>
          </div>
        )}
      </div>
    )
  }

  // 6. DP Table Renderer
  if (frame.dpTable) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {frame.dpTable.map((val, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: '#71717a' }}>dp[{idx}]</span>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '6px',
                  background: frame.currentDpIndex === idx ? '#f59e0b' : val !== null ? '#18181b' : '#09090b',
                  color: frame.currentDpIndex === idx ? '#000' : val !== null ? '#fff' : '#52525b',
                  border: frame.currentDpIndex === idx ? '2px solid #fbbf24' : '1px solid #27272a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '15px',
                }}
              >
                {val !== null ? val : '—'}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return <div>Rendering visualization...</div>
}

function generateFramesForConcept(type, preset) {
  // 1. Array Declaration & Initialization
  if (type === 'array-declaration') {
    const raw = preset.values || [0, 0, 0, 0, 0]
    return [
      {
        array: raw.map(() => null),
        message: 'Stack reference int[] arr allocated. Heap memory requested from JVM.',
        variables: { length: raw.length, baseAddress: '0x1000' },
      },
      {
        array: raw.map(() => 0),
        message: 'Contiguous block of memory allocated. All slots initialized to default value 0.',
        variables: { defaultType: 'int (4 bytes each)', totalBytes: raw.length * 4 },
      },
      ...raw.map((v, i) => ({
        array: raw.map((val, idx) => (idx <= i ? val : 0)),
        currentIndex: i,
        activeIndices: [i],
        message: `Assigned arr[${i}] = ${v}. Calculated memory address: 0x1000 + (${i} * 4) = 0x${(0x1000 + i * 4).toString(16)}.`,
        variables: { index: i, value: v, address: `0x${(0x1000 + i * 4).toString(16)}` },
      })),
      {
        array: [...raw],
        message: 'Array fully initialized and ready for O(1) random access.',
        variables: { length: raw.length },
      },
    ]
  }

  // 2. Array Traversal
  if (type === 'array-traversal') {
    const arr = preset.values || [12, 45, 7, 23, 56]
    let total = 0
    const frames = [
      {
        array: [...arr],
        message: 'Start linear traversal at index 0. Running total = 0.',
        variables: { i: 0, total: 0 },
      },
    ]
    arr.forEach((val, i) => {
      total += val
      frames.push({
        array: [...arr],
        currentIndex: i,
        activeIndices: [i],
        message: `Visiting index ${i}: read value ${val}. Running total = ${total - val} + ${val} = ${total}.`,
        variables: { i, 'arr[i]': val, total },
      })
    })
    frames.push({
      array: [...arr],
      message: `Traversal complete! Visited all ${arr.length} elements in O(n) time. Final sum: ${total}.`,
      variables: { totalElements: arr.length, finalTotal: total },
    })
    return frames
  }

  // 3. Array Insertion & Shifting
  if (type === 'array-insertion') {
    const arr = [...(preset.values || [10, 20, 30, 40, 50])]
    const targetIdx = preset.targetIndex ?? 2
    const insertVal = preset.insertValue ?? 99
    const extended = [...arr, null]
    const frames = [
      {
        array: [...extended],
        message: `Want to insert ${insertVal} at index ${targetIdx}. Allocate extra capacity at the end.`,
        variables: { targetIndex: targetIdx, insertValue: insertVal },
      },
    ]
    for (let i = extended.length - 2; i >= targetIdx; i--) {
      extended[i + 1] = extended[i]
      frames.push({
        array: [...extended],
        activeIndices: [i + 1],
        highlightedIndices: [i],
        message: `Shift right: copy arr[${i}] (${extended[i]}) to arr[${i + 1}].`,
        variables: { i, shiftedFrom: i, shiftedTo: i + 1 },
      })
    }
    extended[targetIdx] = insertVal
    frames.push({
      array: [...extended],
      activeIndices: [targetIdx],
      matchIndices: [targetIdx],
      message: `Index ${targetIdx} is now free! Write new value ${insertVal} into arr[${targetIdx}].`,
      variables: { targetIndex: targetIdx, value: insertVal },
    })
    return frames
  }

  // 4. Array Deletion
  if (type === 'array-deletion') {
    const arr = [...(preset.values || [10, 20, 30, 40, 50])]
    const targetIdx = preset.targetIndex ?? 2
    const frames = [
      {
        array: [...arr],
        activeIndices: [targetIdx],
        message: `Delete element at index ${targetIdx} (value ${arr[targetIdx]}).`,
        variables: { targetIndex: targetIdx, deletedValue: arr[targetIdx] },
      },
    ]
    for (let i = targetIdx; i < arr.length - 1; i++) {
      arr[i] = arr[i + 1]
      frames.push({
        array: [...arr],
        activeIndices: [i],
        highlightedIndices: [i + 1],
        message: `Shift left: copy arr[${i + 1}] (${arr[i]}) into arr[${i}].`,
        variables: { i, shiftedFrom: i + 1, shiftedTo: i },
      })
    }
    arr[arr.length - 1] = 0
    frames.push({
      array: [...arr],
      message: 'Deletion complete. Trailing slot zeroed. Effective size reduced by 1.',
      variables: { newLogicalSize: arr.length - 1 },
    })
    return frames
  }

  // 5. Array Reversal (Two Pointers)
  if (type === 'array-reversal') {
    const arr = [...(preset.values || [1, 2, 3, 4, 5])]
    let left = 0
    let right = arr.length - 1
    const frames = [
      {
        array: [...arr],
        leftIndex: left,
        rightIndex: right,
        message: `Initialize left pointer at index 0 and right pointer at index ${right}.`,
        variables: { left, right },
      },
    ]
    while (left < right) {
      frames.push({
        array: [...arr],
        leftIndex: left,
        rightIndex: right,
        activeIndices: [left, right],
        message: `Swap elements at index ${left} (${arr[left]}) and index ${right} (${arr[right]}).`,
        variables: { left, right, 'arr[left]': arr[left], 'arr[right]': arr[right] },
      })
      const tmp = arr[left]
      arr[left] = arr[right]
      arr[right] = tmp
      left++
      right--
      frames.push({
        array: [...arr],
        leftIndex: left,
        rightIndex: right,
        message: `Pointers advanced: left = ${left}, right = ${right}.`,
        variables: { left, right },
      })
    }
    frames.push({
      array: [...arr],
      message: 'Pointers crossed! Array reversal complete in O(n) time and O(1) space.',
      variables: { completed: true },
    })
    return frames
  }

  // 6. Binary Search
  if (type === 'binary-search') {
    const arr = preset.values || [-1, 0, 3, 5, 9, 12]
    const target = preset.target ?? 9
    let low = 0
    let high = arr.length - 1
    const frames = [
      {
        array: [...arr],
        leftIndex: low,
        rightIndex: high,
        message: `Binary search for target ${target}. Search space: [${low} .. ${high}].`,
        variables: { low, high, target },
      },
    ]

    while (low <= high) {
      const mid = Math.floor(low + (high - low) / 2)
      const dimmed = []
      for (let i = 0; i < low; i++) dimmed.push(i)
      for (let i = high + 1; i < arr.length; i++) dimmed.push(i)

      frames.push({
        array: [...arr],
        leftIndex: low,
        rightIndex: high,
        midIndex: mid,
        activeIndices: [mid],
        dimmedIndices: dimmed,
        message: `Compute mid = ${low} + (${high} - ${low}) / 2 = ${mid}. Inspect arr[${mid}] = ${arr[mid]}.`,
        variables: { low, high, mid, 'arr[mid]': arr[mid], target },
      })

      if (arr[mid] === target) {
        frames.push({
          array: [...arr],
          matchIndices: [mid],
          midIndex: mid,
          message: `Target ${target} found at index ${mid}!`,
          variables: { resultIndex: mid, found: true },
        })
        return frames
      } else if (arr[mid] < target) {
        frames.push({
          array: [...arr],
          midIndex: mid,
          dimmedIndices: dimmed,
          message: `${arr[mid]} < ${target}. Target must be in the right half. Move low = mid + 1 (${mid + 1}).`,
          variables: { newLow: mid + 1, high },
        })
        low = mid + 1
      } else {
        frames.push({
          array: [...arr],
          midIndex: mid,
          dimmedIndices: dimmed,
          message: `${arr[mid]} > ${target}. Target must be in the left half. Move high = mid - 1 (${mid - 1}).`,
          variables: { low, newHigh: mid - 1 },
        })
        high = mid - 1
      }
    }

    frames.push({
      array: [...arr],
      message: `low (${low}) > high (${high}). Search space empty. Target ${target} is not in the array.`,
      variables: { found: false, returnCode: -1 },
    })
    return frames
  }

  // 7. Two Pointers (Opposite Direction)
  if (type === 'two-pointers') {
    const arr = preset.values || [2, 7, 11, 15]
    const target = preset.target ?? 9
    let left = 0
    let right = arr.length - 1
    const frames = [
      {
        array: [...arr],
        leftIndex: left,
        rightIndex: right,
        message: `Sorted Two Sum: find two elements summing to ${target}. Start left at index 0, right at index ${right}.`,
        variables: { left, right, target },
      },
    ]

    while (left < right) {
      const sum = arr[left] + arr[right]
      frames.push({
        array: [...arr],
        leftIndex: left,
        rightIndex: right,
        activeIndices: [left, right],
        message: `Evaluate sum: arr[${left}] (${arr[left]}) + arr[${right}] (${arr[right]}) = ${sum}.`,
        variables: { left, right, sum, target },
      })

      if (sum === target) {
        frames.push({
          array: [...arr],
          leftIndex: left,
          rightIndex: right,
          matchIndices: [left, right],
          message: `Match found! arr[${left}] + arr[${right}] == ${target}. 1-based indices: [${left + 1}, ${right + 1}].`,
          variables: { result: `[${left + 1}, ${right + 1}]`, sum },
        })
        return frames
      } else if (sum < target) {
        frames.push({
          array: [...arr],
          leftIndex: left,
          rightIndex: right,
          message: `Sum (${sum}) < target (${target}). To increase the sum, increment left = ${left + 1}.`,
          variables: { left: left + 1, right },
        })
        left++
      } else {
        frames.push({
          array: [...arr],
          leftIndex: left,
          rightIndex: right,
          message: `Sum (${sum}) > target (${target}). To decrease the sum, decrement right = ${right - 1}.`,
          variables: { left, right: right - 1 },
        })
        right--
      }
    }
    return frames
  }

  // 8. Sliding Window (Fixed Size)
  if (type === 'sliding-window') {
    const arr = preset.values || [2, 1, 5, 1, 3, 2]
    const k = preset.k ?? 3
    let sum = 0
    for (let i = 0; i < k; i++) sum += arr[i]
    let max = sum

    const frames = [
      {
        array: [...arr],
        highlightedIndices: Array.from({ length: k }, (_, i) => i),
        message: `Initialize window of size ${k}. Initial window sum = ${sum}.`,
        variables: { windowSize: k, windowSum: sum, maxSum: max },
      },
    ]

    for (let i = k; i < arr.length; i++) {
      const outgoing = arr[i - k]
      const incoming = arr[i]
      sum = sum + incoming - outgoing
      max = Math.max(max, sum)
      const windowIndices = Array.from({ length: k }, (_, idx) => i - k + 1 + idx)

      frames.push({
        array: [...arr],
        highlightedIndices: windowIndices,
        activeIndices: [i],
        message: `Slide right: drop arr[${i - k}] (-${outgoing}), add arr[${i}] (+${incoming}). New sum: ${sum}. Max sum so far: ${max}.`,
        variables: { windowStart: i - k + 1, windowEnd: i, windowSum: sum, maxSum: max },
      })
    }

    frames.push({
      array: [...arr],
      message: `Completed full array scan. Maximum sum subarray of length ${k} is ${max}.`,
      variables: { result: max },
    })
    return frames
  }

  // 9. Linked List
  if (type === 'linked-list') {
    const vals = preset.values || [10, 20, 30]
    const nodes = vals.map((v) => ({ val: v }))
    return [
      {
        linkedList: nodes,
        currentNode: 0,
        message: 'Head pointer references node with value 10.',
        variables: { head: vals[0] },
      },
      ...vals.map((v, idx) => ({
        linkedList: nodes,
        currentNode: idx,
        message: `Traversing: curr = curr.next. Visiting node with value ${v}.`,
        variables: { 'curr.val': v, next: vals[idx + 1] ?? 'null' },
      })),
      {
        linkedList: nodes,
        currentNode: null,
        message: 'curr hit null. Traversal complete.',
        variables: { curr: 'null' },
      },
    ]
  }

  // 10. Linked List Reversal
  if (type === 'linked-list-reversal') {
    const vals = preset.values || [1, 2, 3, 4]
    const nodes = vals.map((v) => ({ val: v }))
    const frames = [
      {
        linkedList: nodes,
        currentNode: 0,
        prevNode: null,
        isReversed: false,
        message: 'Initialize prev = null, curr = head (1).',
        variables: { prev: 'null', curr: vals[0] },
      },
    ]

    vals.forEach((v, idx) => {
      frames.push({
        linkedList: nodes,
        currentNode: idx,
        prevNode: idx > 0 ? idx - 1 : null,
        nextNode: idx < vals.length - 1 ? idx + 1 : null,
        isReversed: false,
        message: `Step 1: Save nextNode = curr.next (${vals[idx + 1] ?? 'null'}). Redirect curr.next backward to prev.`,
        variables: { curr: v, prev: idx > 0 ? vals[idx - 1] : 'null', next: vals[idx + 1] ?? 'null' },
      })
    })

    frames.push({
      linkedList: [...nodes].reverse(),
      currentNode: null,
      prevNode: 0,
      isReversed: true,
      message: 'All links reversed! New head is prev (last node).',
      variables: { newHead: vals[vals.length - 1] },
    })
    return frames
  }

  // 11. Stack
  if (type === 'stack') {
    const actions = preset.actions || ['push:10', 'push:20', 'push:30', 'pop']
    const stack = []
    const frames = [
      {
        stack: [],
        message: 'Stack is initially empty. Top pointer is null.',
        variables: { size: 0 },
      },
    ]

    actions.forEach((act) => {
      if (act.startsWith('push:')) {
        const val = act.split(':')[1]
        stack.push(val)
        frames.push({
          stack: [...stack],
          message: `push(${val}): placed on top of stack.`,
          variables: { top: val, size: stack.length },
        })
      } else if (act === 'pop') {
        const popped = stack.pop()
        frames.push({
          stack: [...stack],
          message: `pop(): removed top element ${popped}.`,
          variables: { popped, top: stack[stack.length - 1] ?? 'empty', size: stack.length },
        })
      }
    })
    return frames
  }

  // 12. Queue
  if (type === 'queue') {
    const actions = preset.actions || ['offer:1', 'offer:2', 'offer:3', 'poll']
    const queue = []
    const frames = [
      {
        queue: [],
        message: 'Queue is initially empty.',
        variables: { size: 0 },
      },
    ]

    actions.forEach((act) => {
      if (act.startsWith('offer:')) {
        const val = act.split(':')[1]
        queue.push(val)
        frames.push({
          queue: [...queue],
          message: `offer(${val}): Enqueued at rear of queue.`,
          variables: { rear: val, front: queue[0], size: queue.length },
        })
      } else if (act === 'poll') {
        const polled = queue.shift()
        frames.push({
          queue: [...queue],
          message: `poll(): Dequeued from front: ${polled}.`,
          variables: { polled, newFront: queue[0] ?? 'empty', size: queue.length },
        })
      }
    })
    return frames
  }

  // 13. Tree Traversal
  if (type === 'tree-traversal') {
    const vals = preset.values || [4, 2, 6, 1, 3, 5, 7]
    const nodes = vals.map((v) => ({ val: v }))
    // Inorder of BST: [1, 2, 3, 4, 5, 6, 7]
    const sorted = [...vals].sort((a, b) => a - b)
    const history = []

    const frames = [
      {
        treeNodes: nodes,
        activeNode: null,
        visitedNodes: [],
        traversalHistory: [],
        message: 'Inorder traversal (Left -> Root -> Right). Start at root.',
        variables: { root: vals[0] },
      },
    ]

    sorted.forEach((v) => {
      history.push(v)
      frames.push({
        treeNodes: nodes,
        activeNode: v,
        visitedNodes: [...history],
        traversalHistory: [...history],
        message: `Visit node ${v}. Added to inorder output.`,
        variables: { visiting: v },
      })
    })

    return frames
  }

  // 14. DP Table
  if (type === 'dp-table') {
    const n = preset.n ?? 6
    const dp = Array.from({ length: n + 1 }, () => null)
    dp[1] = 1
    dp[2] = 2

    const frames = [
      {
        dpTable: [...dp],
        currentDpIndex: 1,
        message: 'Base case 1: dp[1] = 1 (1 way to climb 1 stair).',
        variables: { 'dp[1]': 1 },
      },
      {
        dpTable: [...dp],
        currentDpIndex: 2,
        message: 'Base case 2: dp[2] = 2 (2 ways to climb 2 stairs).',
        variables: { 'dp[2]': 2 },
      },
    ]

    for (let i = 3; i <= n; i++) {
      dp[i] = dp[i - 1] + dp[i - 2]
      frames.push({
        dpTable: [...dp],
        currentDpIndex: i,
        message: `State transition: dp[${i}] = dp[${i - 1}] (${dp[i - 1]}) + dp[${i - 2}] (${dp[i - 2]}) = ${dp[i]}.`,
        variables: { i, 'dp[i-1]': dp[i - 1], 'dp[i-2]': dp[i - 2], 'dp[i]': dp[i] },
      })
    }

    frames.push({
      dpTable: [...dp],
      message: `Table construction complete! Solution for n = ${n} is dp[${n}] = ${dp[n]} ways.`,
      variables: { answer: dp[n] },
    })

    return frames
  }

  // Fallback
  return [
    {
      message: 'Visualizer ready.',
    },
  ]
}
