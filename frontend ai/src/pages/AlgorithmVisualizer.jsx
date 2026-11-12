import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Code2,
  Eye,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Waypoints,
} from 'lucide-react'
import { createVisualizationSteps, parseIntegerArray } from '../services/visualization-steps'
import { DSA_CONCEPTS } from '../data/dsa-concepts'
import ConceptVisualizer from '../components/ConceptVisualizer'
import ConceptLearningPage from '../components/ConceptLearningPage'
import './AlgorithmVisualizer.css'
import './LearningExperience.css'

const barAlgorithms = [
  { id: 'bubble-sort', name: 'Bubble Sort', category: 'Sorting', complexity: 'O(n²) time · O(1) space' },
  { id: 'insertion-sort', name: 'Insertion Sort', category: 'Sorting', complexity: 'O(n²) time · O(1) space' },
  { id: 'linear-search', name: 'Linear Search', category: 'Searching', complexity: 'O(n) time · O(1) space' },
  { id: 'binary-search', name: 'Binary Search (Bars)', category: 'Searching', complexity: 'O(log n) time · O(1) space' },
]

export default function AlgorithmVisualizer() {
  const [activeTab, setActiveTab] = useState('concepts') // 'concepts' or 'sorting-lab'
  const [selectedConceptId, setSelectedConceptId] = useState(DSA_CONCEPTS[0].id)
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('All')
  const [showFullConceptGuide, setShowFullConceptGuide] = useState(false)

  // Bar Visualizer State
  const [algorithm, setAlgorithm] = useState('bubble-sort')
  const [tracedAlgorithm, setTracedAlgorithm] = useState('bubble-sort')
  const [arrayInput, setArrayInput] = useState('9, 4, 7, 1, 6')
  const [target, setTarget] = useState('7')
  const [frames, setFrames] = useState(() => createVisualizationSteps('bubble-sort', [9, 4, 7, 1, 6], ''))
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(700)
  const [error, setError] = useState('')

  const activeAlgorithm = barAlgorithms.find((item) => item.id === tracedAlgorithm) || barAlgorithms[0]
  const currentConcept = DSA_CONCEPTS.find((c) => c.id === selectedConceptId) || DSA_CONCEPTS[0]

  // Topics for concept filtering
  const conceptTopics = ['All', 'Arrays', 'Searching', 'Two Pointers', 'Sliding Window', 'Linked Lists', 'Stacks', 'Queues', 'Recursion', 'Trees', 'Dynamic Programming']

  const filteredConcepts = DSA_CONCEPTS.filter((c) => {
    return selectedTopicFilter === 'All' || c.topicName.toLowerCase() === selectedTopicFilter.toLowerCase()
  })

  // Bar rendering
  const frame = frames[stepIndex] || frames[0]
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

  if (showFullConceptGuide && currentConcept) {
    return (
      <ConceptLearningPage
        concept={currentConcept}
        onBack={() => setShowFullConceptGuide(false)}
      />
    )
  }

  return (
    <div className="workspace-page page-enter algorithm-visualizer" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <header className="workspace-header" style={{ marginBottom: 0 }}>
        <div>
          <p className="eyebrow accent-eyebrow">Interactive Algorithm Lab</p>
          <h2>DSA Concept Visualizers</h2>
          <p className="muted">
            Step-by-step interactive visualizers for every core DSA concept. Trace operations, pointer updates, and data structure mutations in real time.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div style={{ display: 'flex', gap: '8px', background: '#121214', padding: '4px', borderRadius: '8px', border: '1px solid #27272a' }}>
          <button
            type="button"
            className={activeTab === 'concepts' ? 'primary-button' : 'quiet-button'}
            onClick={() => setActiveTab('concepts')}
            style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={14} /> Concept Visualizers ({DSA_CONCEPTS.length})
          </button>
          <button
            type="button"
            className={activeTab === 'sorting-lab' ? 'primary-button' : 'quiet-button'}
            onClick={() => setActiveTab('sorting-lab')}
            style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Waypoints size={14} /> Array Sorting Lab
          </button>
        </div>
      </header>

      {/* TAB 1: ALL CONCEPT VISUALIZERS */}
      {activeTab === 'concepts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Topic Filters */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {conceptTopics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setSelectedTopicFilter(topic)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: selectedTopicFilter === topic ? 600 : 400,
                  background: selectedTopicFilter === topic ? '#fbbf24' : '#18181b',
                  color: selectedTopicFilter === topic ? '#000' : '#a1a1aa',
                  border: '1px solid',
                  borderColor: selectedTopicFilter === topic ? '#fbbf24' : '#27272a',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Concept Selector Dropdown & Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: '#a1a1aa' }}>Select Concept:</span>
              <select
                value={selectedConceptId}
                onChange={(e) => setSelectedConceptId(e.target.value)}
                style={{
                  background: '#18181b',
                  color: '#fff',
                  border: '1px solid #3f3f46',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {filteredConcepts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.topicName} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="quiet-button"
              onClick={() => setShowFullConceptGuide(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '6px 14px' }}
            >
              <BookOpen size={14} /> Open 16-Point Complete Guide
            </button>
          </div>

          {/* Active Concept Visualizer */}
          {currentConcept && (
            <div>
              <ConceptVisualizer concept={currentConcept} />
            </div>
          )}

          {/* Grid of Concept Cards */}
          <div style={{ marginTop: '12px' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '15px', color: '#a1a1aa' }}>
              Explore Other Learning Concept Visualizers
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {filteredConcepts.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedConceptId(c.id)}
                  className="panel"
                  style={{
                    padding: '14px',
                    background: selectedConceptId === c.id ? 'rgba(251, 191, 36, 0.08)' : '#121214',
                    border: '1px solid',
                    borderColor: selectedConceptId === c.id ? '#fbbf24' : '#27272a',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 600 }}>{c.topicName}</span>
                    <span style={{ fontSize: '10px', background: '#27272a', color: '#a1a1aa', padding: '1px 6px', borderRadius: '3px' }}>
                      {c.level}
                    </span>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#fff', display: 'block', marginBottom: '4px' }}>
                    {c.name}
                  </strong>
                  <p style={{ margin: 0, fontSize: '12px', color: '#a1a1aa', lineHeight: '1.4' }}>
                    {c.intro.slice(0, 80)}...
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLASSIC ARRAY SORTING & SEARCHING LAB */}
      {activeTab === 'sorting-lab' && (
        <div className="visualizer-layout">
          <form className="panel visualizer-settings" onSubmit={buildTrace}>
            <label htmlFor="visualizer-algorithm">Algorithm</label>
            <select
              id="visualizer-algorithm"
              value={algorithm}
              onChange={(event) => { setAlgorithm(event.target.value); setPlaying(false); }}
            >
              {barAlgorithms.map((item) => (
                <option value={item.id} key={item.id}>{item.name}</option>
              ))}
            </select>

            <label htmlFor="visualizer-array">Array values</label>
            <input
              id="visualizer-array"
              value={arrayInput}
              onChange={(event) => setArrayInput(event.target.value)}
              aria-describedby="visualizer-input-help"
            />
            <small id="visualizer-input-help">Comma-separated integers, 1–20 values</small>

            {(algorithm === 'linear-search' || algorithm === 'binary-search') && (
              <>
                <label htmlFor="visualizer-target">Search target</label>
                <input
                  id="visualizer-target"
                  type="number"
                  step="1"
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                />
              </>
            )}

            <button className="primary-button" type="submit">
              <Waypoints size={16} /> Build trace
            </button>
            <p className="visualizer-complexity">{activeAlgorithm.complexity}</p>
            {error && <p className="problem-error" role="alert">{error}</p>}
          </form>

          <section className="panel visualizer-stage" aria-label={`${activeAlgorithm.name} visualization`}>
            <div className="visualizer-stage-heading">
              <div>
                <p className="eyebrow">Step {stepIndex + 1} of {frames.length}</p>
                <h3>{activeAlgorithm.name}</h3>
              </div>
              <span className="visualizer-speed">
                <label htmlFor="visualizer-speed">Speed</label>
                <select id="visualizer-speed" value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
                  <option value={1300}>0.5×</option>
                  <option value={700}>1×</option>
                  <option value={350}>2×</option>
                </select>
              </span>
            </div>

            <div className="array-bars" role="img" aria-label={`Array values: ${frame.array.join(', ')}`}>
              {bars.map(({ value, index, height }) => (
                <div
                  className={`array-bar ${frame.activeIndices.includes(index) ? 'active' : ''} ${frame.sortedIndices.includes(index) ? 'sorted' : ''} ${frame.resultIndices.includes(index) ? 'found' : ''}`}
                  key={`${index}-${value}`}
                  style={{ height: `${height}px` }}
                >
                  <strong>{value}</strong>
                  <span>index {index}</span>
                </div>
              ))}
            </div>

            <p className="visualizer-explanation" aria-live="polite">{frame.message}</p>

            <div className="visualizer-controls">
              <button type="button" className="quiet-button" onClick={reset} aria-label="Reset visualization">
                <RotateCcw size={15} /> Reset
              </button>
              <div>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => changeStep(-1)}
                  disabled={stepIndex === 0}
                  aria-label="Previous step"
                >
                  <ArrowLeft size={17} />
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={togglePlayback}
                  disabled={frames.length < 2}
                >
                  {playing && stepIndex < frames.length - 1 ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Play</>}
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => changeStep(1)}
                  disabled={stepIndex >= frames.length - 1}
                  aria-label="Next step"
                >
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>

            <div className="visualizer-progress" aria-label={`Step ${stepIndex + 1} of ${frames.length}`}>
              <span style={{ width: `${((stepIndex + 1) / frames.length) * 100}%` }} />
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
