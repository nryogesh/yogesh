import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react'

export default function PracticeProblemVisualizer({ assignment, sampleIndex = 0 }) {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(sampleIndex)
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(750)

  const samples = assignment?.examples || []
  const activeSample = samples[selectedCaseIdx] || samples[0] || { input: 'N/A', output: 'N/A' }

  const frames = generateProblemFrames(assignment?.id, activeSample, assignment)

  useEffect(() => {
    setStepIndex(0)
    setPlaying(false)
  }, [assignment?.id, selectedCaseIdx])

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

  const currentFrame = frames[stepIndex] || frames[0] || { message: 'Problem visualizer ready.' }

  return (
    <div className="practice-problem-visualizer" style={{ background: '#0e0e11', border: '1px solid #27272a', borderRadius: '10px', padding: '16px' }}>
      {/* Visualizer Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #27272a', paddingBottom: '12px', marginBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
              <Eye size={12} style={{ display: 'inline', marginRight: '4px' }} /> Problem Execution Trace
            </span>
            <span style={{ fontSize: '12px', color: '#a1a1aa' }}>
              Step {stepIndex + 1} of {frames.length}
            </span>
          </div>
          <h4 style={{ margin: '4px 0 0', fontSize: '15px', color: '#fff' }}>
            Tracing: {assignment?.title || 'Practice Problem'}
          </h4>
        </div>

        {/* Example Switcher */}
        {samples.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Test Case:</span>
            <select
              value={selectedCaseIdx}
              onChange={(e) => { setSelectedCaseIdx(Number(e.target.value)); setStepIndex(0); setPlaying(false); }}
              style={{ background: '#18181b', color: '#fff', border: '1px solid #3f3f46', borderRadius: '6px', padding: '4px 8px', fontSize: '12px' }}
            >
              {samples.map((s, idx) => (
                <option key={idx} value={idx}>Case {idx + 1}: {s.input}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Visual Canvas */}
      <div
        style={{
          minHeight: '180px',
          background: '#040405',
          border: '1px solid #1f1f23',
          borderRadius: '8px',
          padding: '20px 14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {renderProblemStage(currentFrame)}
      </div>

      {/* Explanation Box */}
      <div style={{ margin: '14px 0', background: '#18181b', border: '1px solid #27272a', borderRadius: '6px', padding: '12px 14px' }}>
        <p style={{ margin: 0, fontSize: '13px', color: '#e4e4e7', lineHeight: '1.5' }}>
          <strong style={{ color: '#38bdf8' }}>Step {stepIndex + 1}: </strong>
          {currentFrame.message}
        </p>
        {currentFrame.state && (
          <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #27272a', display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '12px', fontFamily: 'monospace' }}>
            {Object.entries(currentFrame.state).map(([k, v]) => (
              <span key={k} style={{ color: '#86efac' }}>
                <span style={{ color: '#a1a1aa' }}>{k}: </span>{String(v)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Playback Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <button
          type="button"
          className="quiet-button"
          onClick={() => { setPlaying(false); setStepIndex(0); }}
          style={{ padding: '4px 10px', fontSize: '12px' }}
        >
          <RotateCcw size={13} /> Reset
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="icon-button"
            onClick={() => { setPlaying(false); setStepIndex((i) => Math.max(0, i - 1)); }}
            disabled={stepIndex === 0}
            style={{ width: '32px', height: '32px' }}
          >
            <ArrowLeft size={15} />
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
            style={{ padding: '5px 14px', fontSize: '13px' }}
          >
            {playing ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Play</>}
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => { setPlaying(false); setStepIndex((i) => Math.min(frames.length - 1, i + 1)); }}
            disabled={stepIndex >= frames.length - 1}
            style={{ width: '32px', height: '32px' }}
          >
            <ArrowRight size={15} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#71717a' }}>Speed</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ background: '#18181b', color: '#fff', border: '1px solid #3f3f46', borderRadius: '4px', padding: '2px 6px', fontSize: '11px' }}
          >
            <option value={1200}>0.5×</option>
            <option value={750}>1×</option>
            <option value={350}>2×</option>
          </select>
        </div>
      </div>
    </div>
  )
}

function renderProblemStage(frame) {
  if (frame.array) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        {frame.pointers && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {frame.array.map((_, i) => (
              <div key={i} style={{ width: '48px', textAlign: 'center', fontSize: '11px', fontWeight: 700, minHeight: '16px' }}>
                {frame.pointers[i] && <span style={{ color: frame.pointers[i].color || '#38bdf8' }}>{frame.pointers[i].label}↓</span>}
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {frame.array.map((val, i) => {
            const isHighlighted = frame.highlighted?.includes(i)
            const isMatch = frame.matched?.includes(i)
            const isDimmed = frame.dimmed?.includes(i)

            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '6px',
                    background: isMatch ? '#065f46' : isHighlighted ? '#f59e0b' : isDimmed ? '#0c0c0e' : '#18181b',
                    color: isMatch ? '#ecfdf5' : isHighlighted ? '#000' : isDimmed ? '#3f3f46' : '#fff',
                    border: isHighlighted ? '2px solid #fbbf24' : isMatch ? '2px solid #10b981' : '1px solid #27272a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '15px',
                  }}
                >
                  {val}
                </div>
                <span style={{ fontSize: '10px', color: '#52525b' }}>[{i}]</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (frame.stack) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '10px', color: '#a1a1aa' }}>STACK TOP ↓</span>
        <div style={{ width: '120px', minHeight: '120px', borderLeft: '2px solid #38bdf8', borderRight: '2px solid #38bdf8', borderBottom: '2px solid #38bdf8', borderRadius: '0 0 6px 6px', padding: '6px', display: 'flex', flexDirection: 'column-reverse', gap: '4px' }}>
          {frame.stack.length === 0 ? <span style={{ margin: 'auto', fontSize: '11px', color: '#52525b' }}>Empty</span> : frame.stack.map((item, i) => (
            <div key={i} style={{ padding: '6px', background: '#27272a', color: '#fff', borderRadius: '4px', textAlign: 'center', fontWeight: 700, fontSize: '13px' }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (frame.linkedList) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {frame.linkedList.map((val, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ padding: '8px 12px', background: frame.activeNode === i ? '#f59e0b' : '#18181b', color: frame.activeNode === i ? '#000' : '#fff', borderRadius: '6px', border: '1px solid #3f3f46', fontWeight: 700 }}>
              {val}
            </div>
            {i < frame.linkedList.length - 1 && <span style={{ color: '#fbbf24', fontWeight: 700 }}>→</span>}
          </div>
        ))}
        <span style={{ fontSize: '11px', color: '#71717a' }}>→ null</span>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px', textAlign: 'center', color: '#a1a1aa', fontSize: '13px' }}>
      {frame.message}
    </div>
  )
}

function generateProblemFrames(id, sample, assignment) {
  // 1. Two Sum Sorted
  if (id === 'two-sum' || assignment?.title?.toLowerCase().includes('two sum')) {
    const nums = [2, 7, 11, 15]
    const target = 9
    return [
      {
        array: nums,
        pointers: { 0: { label: 'L', color: '#38bdf8' }, 3: { label: 'R', color: '#c084fc' } },
        highlighted: [0, 3],
        message: `Initialize left at index 0 (2), right at index 3 (15). Target = ${target}.`,
        state: { left: 0, right: 3, 'nums[left]': 2, 'nums[right]': 15, currentSum: 17, target: 9 },
      },
      {
        array: nums,
        pointers: { 0: { label: 'L', color: '#38bdf8' }, 3: { label: 'R', color: '#c084fc' } },
        message: 'Sum (17) > target (9). To decrease sum, decrement right to index 2.',
        state: { action: 'right--' },
      },
      {
        array: nums,
        pointers: { 0: { label: 'L', color: '#38bdf8' }, 2: { label: 'R', color: '#c084fc' } },
        highlighted: [0, 2],
        message: 'Calculate sum: 2 + 11 = 13. Still > 9. Decrement right to index 1.',
        state: { left: 0, right: 2, currentSum: 13, target: 9 },
      },
      {
        array: nums,
        pointers: { 0: { label: 'L', color: '#38bdf8' }, 1: { label: 'R', color: '#c084fc' } },
        matched: [0, 1],
        message: 'Sum: 2 + 7 = 9 == target! Match found at 1-based indices [1, 2].',
        state: { result: '[1, 2]', status: 'Solved' },
      },
    ]
  }

  // 2. Binary Search in Sorted Array
  if (id === 'searching-assignment-1' || assignment?.title?.toLowerCase().includes('binary search')) {
    const nums = [-1, 0, 3, 5, 9, 12]
    const target = 9
    return [
      {
        array: nums,
        pointers: { 0: { label: 'LOW', color: '#38bdf8' }, 5: { label: 'HIGH', color: '#c084fc' } },
        message: `Search for target 9. Initial search space: indices 0 through 5.`,
        state: { low: 0, high: 5, target: 9 },
      },
      {
        array: nums,
        pointers: { 0: { label: 'LOW', color: '#38bdf8' }, 2: { label: 'MID', color: '#fbbf24' }, 5: { label: 'HIGH', color: '#c084fc' } },
        highlighted: [2],
        message: 'Compute mid = 0 + (5 - 0) / 2 = 2. nums[2] is 3. Since 3 < 9, target is in right half.',
        state: { low: 0, high: 5, mid: 2, 'nums[mid]': 3, target: 9 },
      },
      {
        array: nums,
        pointers: { 3: { label: 'LOW', color: '#38bdf8' }, 5: { label: 'HIGH', color: '#c084fc' } },
        dimmed: [0, 1, 2],
        message: 'Discard left half. Move low = mid + 1 = 3. Search space now [3 .. 5].',
        state: { low: 3, high: 5 },
      },
      {
        array: nums,
        pointers: { 3: { label: 'LOW', color: '#38bdf8' }, 4: { label: 'MID', color: '#fbbf24' }, 5: { label: 'HIGH', color: '#c084fc' } },
        matched: [4],
        dimmed: [0, 1, 2],
        message: 'Compute mid = 3 + (5 - 3) / 2 = 4. nums[4] is 9 == target! Target found at index 4.',
        state: { mid: 4, 'nums[mid]': 9, resultIndex: 4 },
      },
    ]
  }

  // 3. Valid Parentheses
  if (id === 'stacks-assignment-1' || assignment?.title?.toLowerCase().includes('parentheses')) {
    return [
      {
        stack: [],
        message: 'String: "()[]{}". Start with empty stack.',
        state: { input: '()[]{}', index: 0 },
      },
      {
        stack: [')'],
        message: 'Seen \'(\', push expected matching closer \')\' onto stack.',
        state: { char: '(', stackTop: ')' },
      },
      {
        stack: [],
        message: 'Seen \')\'. Pop matches stack top \')\'. Correct!',
        state: { char: ')', stackSize: 0 },
      },
      {
        stack: [']'],
        message: 'Seen \'[\', push expected \']\' onto stack.',
        state: { char: '[', stackTop: ']' },
      },
      {
        stack: [],
        message: 'Seen \']\'. Pop matches stack top \']\'. Correct!',
        state: { char: ']', stackSize: 0 },
      },
      {
        stack: ['}'],
        message: 'Seen \'{\', push expected \'}\' onto stack.',
        state: { char: '{', stackTop: '}' },
      },
      {
        stack: [],
        message: 'Seen \'}\'. Pop matches stack top \'}\'. Stack empty -> Valid string! return true.',
        state: { isValid: true },
      },
    ]
  }

  // 4. Reverse Linked List
  if (id === 'linked-lists-assignment-1' || id === 'linked-lists-assignment-2' || assignment?.title?.toLowerCase().includes('reverse')) {
    return [
      {
        linkedList: [1, 2, 3, 4],
        activeNode: 0,
        message: 'Original list: 1 -> 2 -> 3 -> 4. prev = null, curr = 1.',
        state: { curr: 1, prev: 'null' },
      },
      {
        linkedList: [1, 2, 3, 4],
        activeNode: 0,
        message: 'Save nextNode = 2. Point 1.next backward to null. Advance prev = 1, curr = 2.',
        state: { prev: 1, curr: 2 },
      },
      {
        linkedList: [2, 1, 3, 4],
        activeNode: 0,
        message: 'Save nextNode = 3. Point 2.next backward to 1. Advance prev = 2, curr = 3.',
        state: { prev: 2, curr: 3 },
      },
      {
        linkedList: [3, 2, 1, 4],
        activeNode: 0,
        message: 'Save nextNode = 4. Point 3.next backward to 2. Advance prev = 3, curr = 4.',
        state: { prev: 3, curr: 4 },
      },
      {
        linkedList: [4, 3, 2, 1],
        activeNode: 0,
        message: 'Point 4.next backward to 3. curr becomes null. Reversal complete! New head is 4.',
        state: { newHead: 4, status: 'Reversed' },
      },
    ]
  }

  // 5. Default Fallback Trace for any problem
  const dummyArr = [3, 5, 7]
  return [
    {
      array: dummyArr,
      pointers: { 0: { label: 'START', color: '#38bdf8' } },
      message: `Examining input: ${sample?.input || 'Default values'}. Prepare execution state.`,
      state: { input: sample?.input || 'Default' },
    },
    {
      array: dummyArr,
      highlighted: [0],
      pointers: { 0: { label: 'CURR', color: '#fbbf24' } },
      message: 'Processing element at index 0. Check problem constraints and invariants.',
      state: { 'arr[0]': dummyArr[0] },
    },
    {
      array: dummyArr,
      highlighted: [1],
      pointers: { 1: { label: 'CURR', color: '#fbbf24' } },
      message: 'Processing element at index 1. Update intermediate variables.',
      state: { 'arr[1]': dummyArr[1] },
    },
    {
      array: dummyArr,
      highlighted: [2],
      pointers: { 2: { label: 'CURR', color: '#fbbf24' } },
      message: 'Processing element at index 2. Final calculation step.',
      state: { 'arr[2]': dummyArr[2] },
    },
    {
      array: dummyArr,
      matched: [0, 1, 2],
      message: `Algorithm completed! Expected output: ${sample?.output || 'Result verified'}.`,
      state: { finalOutput: sample?.output || '15', status: 'Completed' },
    },
  ]
}
