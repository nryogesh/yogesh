import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw, Waypoints } from 'lucide-react'
import { createVisualizationSteps, parseIntegerArray } from '../services/visualization-steps'
import './AlgorithmVisualizer.css'
import './LearningExperience.css'

const algorithms = [
  { id: 'bubble-sort', name: 'Bubble sort', complexity: 'O(n²) time · O(1) extra space', inputHint: 'Any whole numbers' },
  { id: 'insertion-sort', name: 'Insertion sort', complexity: 'O(n²) worst time · O(1) extra space', inputHint: 'Any whole numbers' },
  { id: 'linear-search', name: 'Linear search', complexity: 'O(n) time · O(1) extra space', inputHint: 'Any whole numbers' },
  { id: 'binary-search', name: 'Binary search', complexity: 'O(log n) time · O(1) extra space', inputHint: 'Ascending sorted values' },
]

function makeInitialSteps() {
  return createVisualizationSteps('bubble-sort', [9, 4, 7, 1, 6], '')
}

export default function AlgorithmVisualizer() {
  const [algorithm, setAlgorithm] = useState('bubble-sort')
  const [tracedAlgorithm, setTracedAlgorithm] = useState('bubble-sort')
  const [arrayInput, setArrayInput] = useState('9, 4, 7, 1, 6')
  const [target, setTarget] = useState('7')
  const [frames, setFrames] = useState(makeInitialSteps)
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(700)
  const [error, setError] = useState('')
  const selectedAlgorithm = algorithms.find((item) => item.id === algorithm)
  const activeAlgorithm = algorithms.find((item) => item.id === tracedAlgorithm)
  const frame = frames[stepIndex]
  const min = Math.min(...frame.array)
  const max = Math.max(...frame.array)
  const bars = useMemo(() => frame.array.map((value, index) => {
    const height = max === min ? 88 : 30 + ((value - min) / (max - min)) * 150
    return { value, index, height }
  }), [frame.array, max, min])

  useEffect(() => {
    if (!playing || stepIndex >= frames.length - 1) return undefined
    const timer = window.setTimeout(() => setStepIndex((current) => Math.min(current + 1, frames.length - 1)), speed)
    return () => window.clearTimeout(timer)
  }, [playing, stepIndex, frames.length, speed])

  const buildTrace = (event) => {
    event.preventDefault()
    setError('')
    setPlaying(false)
    try {
      const values = parseIntegerArray(arrayInput)
      const nextFrames = createVisualizationSteps(algorithm, values, target)
      setFrames(nextFrames)
      setTracedAlgorithm(algorithm)
      setStepIndex(0)
    } catch (traceError) {
      setError(traceError.message || 'Could not create the algorithm trace.')
    }
  }

  const togglePlayback = () => {
    if (playing) {
      setPlaying(false)
      return
    }
    if (stepIndex >= frames.length - 1) setStepIndex(0)
    setPlaying(true)
  }

  const changeStep = (offset) => {
    setPlaying(false)
    setStepIndex((current) => Math.max(0, Math.min(current + offset, frames.length - 1)))
  }

  const reset = () => {
    setPlaying(false)
    setStepIndex(0)
  }

  return <div className="workspace-page page-enter algorithm-visualizer">
    <header className="workspace-header"><div><p className="eyebrow accent-eyebrow">Algorithm lab</p><h2>Interactive visualizer</h2><p className="muted">Step through real array sorting and searching operations. Values, comparisons, and swaps update with each frame.</p></div></header>
    <div className="visualizer-layout">
      <form className="panel visualizer-settings" onSubmit={buildTrace}>
        <label htmlFor="visualizer-algorithm">Algorithm</label>
        <select id="visualizer-algorithm" value={algorithm} onChange={(event) => { setAlgorithm(event.target.value); setPlaying(false) }}>{algorithms.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select>
        <label htmlFor="visualizer-array">Array values</label>
        <input id="visualizer-array" value={arrayInput} onChange={(event) => setArrayInput(event.target.value)} aria-describedby="visualizer-input-help" />
        <small id="visualizer-input-help">Comma-separated integers, 1–20 values · {selectedAlgorithm.inputHint}</small>
        {(algorithm === 'linear-search' || algorithm === 'binary-search') && <><label htmlFor="visualizer-target">Search target</label><input id="visualizer-target" type="number" step="1" value={target} onChange={(event) => setTarget(event.target.value)} /></>}
        <button className="primary-button" type="submit"><Waypoints size={16} /> Build trace</button>
        <p className="visualizer-complexity">{selectedAlgorithm.complexity}</p>
        {error && <p className="problem-error" role="alert">{error}</p>}
      </form>

      <section className="panel visualizer-stage" aria-label={`${activeAlgorithm.name} visualization`}>
        <div className="visualizer-stage-heading"><div><p className="eyebrow">Step {stepIndex + 1} of {frames.length}</p><h3>{activeAlgorithm.name}</h3></div><span className="visualizer-speed"><label htmlFor="visualizer-speed">Speed</label><select id="visualizer-speed" value={speed} onChange={(event) => setSpeed(Number(event.target.value))}><option value={1300}>0.5×</option><option value={700}>1×</option><option value={350}>2×</option></select></span></div>
        <div className="array-bars" role="img" aria-label={`Array values: ${frame.array.join(', ')}`}>
          {bars.map(({ value, index, height }) => <div className={`array-bar ${frame.activeIndices.includes(index) ? 'active' : ''} ${frame.sortedIndices.includes(index) ? 'sorted' : ''} ${frame.resultIndices.includes(index) ? 'found' : ''}`} key={`${index}-${value}`} style={{ height: `${height}px` }}><strong>{value}</strong><span>index {index}</span></div>)}
        </div>
        <p className="visualizer-explanation" aria-live="polite">{frame.message}</p>
        <div className="visualizer-controls">
          <button type="button" className="quiet-button" onClick={reset} aria-label="Reset visualization"><RotateCcw size={15} /> Reset</button>
          <div><button type="button" className="icon-button" onClick={() => changeStep(-1)} disabled={stepIndex === 0} aria-label="Previous step"><ArrowLeft size={17} /></button><button type="button" className="primary-button" onClick={togglePlayback} disabled={frames.length < 2}>{playing && stepIndex < frames.length - 1 ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Play</>}</button><button type="button" className="icon-button" onClick={() => changeStep(1)} disabled={stepIndex >= frames.length - 1} aria-label="Next step"><ArrowRight size={17} /></button></div>
        </div>
        <div className="visualizer-progress" aria-label={`Step ${stepIndex + 1} of ${frames.length}`}><span style={{ width: `${((stepIndex + 1) / frames.length) * 100}%` }} /></div>
      </section>
    </div>
  </div>
}
