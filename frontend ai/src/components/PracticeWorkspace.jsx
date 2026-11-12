import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Eye,
  Lightbulb,
  Play,
  RotateCcw,
  Search,
  Send,
  XCircle,
} from 'lucide-react'
import { fetchSubmissionStarter, runJavaAssignment, submitJavaAssignment } from '../services/api'
import { recordUserActivity } from '../services/learner-profile'
import PracticeProblemVisualizer from './PracticeProblemVisualizer'

export default function PracticeWorkspace({ curriculum, progress, onProgressUpdate }) {
  const [selectedProblemId, setSelectedProblemId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('All')
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState('All')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('default')

  // Collect all practice problems from curriculum and evaluation cases
  const allProblems = collectAllProblems(curriculum, progress)

  const selectedProblem = allProblems.find((p) => p.id === selectedProblemId)

  if (selectedProblem) {
    return (
      <ProblemDetailWorkspace
        problem={selectedProblem}
        onBack={() => setSelectedProblemId(null)}
        progress={progress}
        onProgressUpdate={onProgressUpdate}
      />
    )
  }

  // Filter problems
  const filteredProblems = allProblems.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.topicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTopic = selectedTopicFilter === 'All' || p.topicName.toLowerCase() === selectedTopicFilter.toLowerCase()
    const matchesDifficulty = selectedDifficultyFilter === 'All' || p.difficulty.toLowerCase() === selectedDifficultyFilter.toLowerCase()
    const matchesStatus = selectedStatusFilter === 'All' ||
      (selectedStatusFilter === 'Solved' && p.isSolved) ||
      (selectedStatusFilter === 'Attempted' && p.isAttempted && !p.isSolved) ||
      (selectedStatusFilter === 'Unsolved' && !p.isSolved && !p.isAttempted)
    return matchesSearch && matchesTopic && matchesDifficulty && matchesStatus
  })

  // Sort
  if (sortBy === 'difficulty-asc') {
    const diffOrder = { beginner: 1, easy: 1, intermediate: 2, medium: 2, advanced: 3, hard: 3 }
    filteredProblems.sort((a, b) => (diffOrder[a.difficulty] || 2) - (diffOrder[b.difficulty] || 2))
  } else if (sortBy === 'difficulty-desc') {
    const diffOrder = { beginner: 1, easy: 1, intermediate: 2, medium: 2, advanced: 3, hard: 3 }
    filteredProblems.sort((a, b) => (diffOrder[b.difficulty] || 2) - (diffOrder[a.difficulty] || 2))
  } else if (sortBy === 'title') {
    filteredProblems.sort((a, b) => a.title.localeCompare(b.title))
  }

  // Practice stats
  const solvedCount = allProblems.filter((p) => p.isSolved).length
  const attemptedCount = allProblems.filter((p) => p.isAttempted).length
  const accuracy = attemptedCount > 0 ? Math.round((solvedCount / attemptedCount) * 100) : 80

  const topicsList = ['All', 'Programming Fundamentals', 'Arrays', 'Strings', 'Searching', 'Sorting', 'Linked Lists', 'Stacks', 'Recursion', 'Trees', 'Two Pointers', 'Dynamic Programming']

  return (
    <div className="practice-dashboard-container page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & Stats Overview */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="panel" style={{ padding: '16px', background: '#121214', border: '1px solid #27272a', borderRadius: '10px' }}>
          <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Problems Solved</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <strong style={{ fontSize: '26px', color: '#86efac' }}>{solvedCount}</strong>
            <span style={{ fontSize: '13px', color: '#71717a' }}>/ {allProblems.length}</span>
          </div>
          <div style={{ width: '100%', height: '4px', background: '#27272a', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(solvedCount / Math.max(allProblems.length, 1)) * 100}%`, background: '#86efac' }} />
          </div>
        </div>

        <div className="panel" style={{ padding: '16px', background: '#121214', border: '1px solid #27272a', borderRadius: '10px' }}>
          <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Attempted</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <strong style={{ fontSize: '26px', color: '#fbbf24' }}>{attemptedCount}</strong>
            <span style={{ fontSize: '13px', color: '#71717a' }}>problems</span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#a1a1aa' }}>
            {allProblems.length - attemptedCount} unexplored challenges
          </p>
        </div>

        <div className="panel" style={{ padding: '16px', background: '#121214', border: '1px solid #27272a', borderRadius: '10px' }}>
          <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Accuracy Rate</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <strong style={{ fontSize: '26px', color: '#38bdf8' }}>{accuracy}%</strong>
            <span style={{ fontSize: '13px', color: '#71717a' }}>pass rate</span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#a1a1aa' }}>
            Evaluated by OpenJDK 17 engine
          </p>
        </div>

        <div className="panel" style={{ padding: '16px', background: '#121214', border: '1px solid #27272a', borderRadius: '10px' }}>
          <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Learning Streak</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <strong style={{ fontSize: '26px', color: '#f59e0b' }}>5 Days</strong>
            <span style={{ fontSize: '13px', color: '#71717a' }}>🔥 active</span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#a1a1aa' }}>
            Keep solving daily to maintain rank
          </p>
        </div>
      </section>

      {/* Recommended Problem Banner */}
      <div
        className="panel"
        style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(245, 158, 11, 0.02))',
          border: '1px solid rgba(251, 191, 36, 0.25)',
          borderRadius: '10px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ⚡ Recommended Next Problem
          </span>
          <h3 style={{ margin: '4px 0 2px', fontSize: '17px', color: '#fff' }}>
            {allProblems.find((p) => !p.isSolved)?.title || 'Sum of Array Elements'}
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#a1a1aa' }}>
            {allProblems.find((p) => !p.isSolved)?.description.slice(0, 110) || 'Write a Java method to sum elements.'}...
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="primary-button"
            onClick={() => setSelectedProblemId(allProblems.find((p) => !p.isSolved)?.id || allProblems[0]?.id)}
            style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600 }}
          >
            Solve Problem <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Explorer Controls: Search & Filters */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Bar */}
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#71717a' }} />
            <input
              type="text"
              placeholder="Search problems by name, topic, or concept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                background: '#121214',
                border: '1px solid #27272a',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px',
              }}
            />
          </div>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficultyFilter}
            onChange={(e) => setSelectedDifficultyFilter(e.target.value)}
            style={{ background: '#121214', color: '#fff', border: '1px solid #27272a', borderRadius: '8px', padding: '9px 12px', fontSize: '13px' }}
          >
            <option value="All">All Difficulties</option>
            <option value="beginner">Beginner / Easy</option>
            <option value="intermediate">Intermediate / Medium</option>
            <option value="advanced">Advanced / Hard</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            style={{ background: '#121214', color: '#fff', border: '1px solid #27272a', borderRadius: '8px', padding: '9px 12px', fontSize: '13px' }}
          >
            <option value="All">All Statuses</option>
            <option value="Solved">✓ Solved Only</option>
            <option value="Attempted">⏳ Attempted Only</option>
            <option value="Unsolved">○ Unsolved</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ background: '#121214', color: '#fff', border: '1px solid #27272a', borderRadius: '8px', padding: '9px 12px', fontSize: '13px' }}
          >
            <option value="default">Default Order</option>
            <option value="title">Problem Title (A-Z)</option>
            <option value="difficulty-asc">Difficulty (Easy to Hard)</option>
            <option value="difficulty-desc">Difficulty (Hard to Easy)</option>
          </select>
        </div>

        {/* Topic Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {topicsList.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedTopicFilter(t)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: selectedTopicFilter === t ? 600 : 400,
                background: selectedTopicFilter === t ? '#fbbf24' : '#18181b',
                color: selectedTopicFilter === t ? '#000' : '#a1a1aa',
                border: '1px solid',
                borderColor: selectedTopicFilter === t ? '#fbbf24' : '#27272a',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* Problems List Grid */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#a1a1aa' }}>
            Showing <strong>{filteredProblems.length}</strong> problems
          </span>
        </div>

        {filteredProblems.length === 0 ? (
          <div className="panel" style={{ padding: '32px', textAlign: 'center', color: '#71717a' }}>
            No problems match your current search and filter settings. Try clearing the filters.
          </div>
        ) : (
          filteredProblems.map((prob) => (
            <div
              key={prob.id}
              className="panel problem-card"
              style={{
                background: '#121214',
                border: '1px solid #27272a',
                borderRadius: '8px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                transition: 'border-color 0.2s ease',
              }}
            >
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  {prob.isSolved ? (
                    <span style={{ color: '#86efac', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                      <CheckCircle2 size={14} /> Solved
                    </span>
                  ) : prob.isAttempted ? (
                    <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                      <Clock size={14} /> Attempted
                    </span>
                  ) : (
                    <span style={{ color: '#71717a', fontSize: '12px' }}>○ Unsolved</span>
                  )}
                  <span style={{ color: '#3f3f46' }}>•</span>
                  <span style={{ fontSize: '12px', color: '#a1a1aa' }}>{prob.topicName}</span>
                  <span style={{ color: '#3f3f46' }}>•</span>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      background:
                        prob.difficulty === 'beginner' || prob.difficulty === 'easy'
                          ? 'rgba(134, 239, 172, 0.12)'
                          : prob.difficulty === 'intermediate' || prob.difficulty === 'medium'
                            ? 'rgba(251, 191, 36, 0.12)'
                            : 'rgba(244, 63, 94, 0.12)',
                      color:
                        prob.difficulty === 'beginner' || prob.difficulty === 'easy'
                          ? '#86efac'
                          : prob.difficulty === 'intermediate' || prob.difficulty === 'medium'
                            ? '#fbbf24'
                            : '#f43f5e',
                    }}
                  >
                    {prob.difficulty}
                  </span>
                </div>

                <h4 style={{ margin: '4px 0 2px', fontSize: '16px', color: '#fff' }}>{prob.title}</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#a1a1aa', lineHeight: '1.4' }}>
                  {prob.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  className="quiet-button"
                  onClick={() => setSelectedProblemId(prob.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 12px' }}
                >
                  <Eye size={14} /> Visualize
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setSelectedProblemId(prob.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px' }}
                >
                  <Code2 size={14} /> Solve Problem
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  )
}

function ProblemDetailWorkspace({ problem, onBack, progress, onProgressUpdate }) {
  const [activeLeftTab, setActiveLeftTab] = useState('description') // description, visualizer, hints
  const [sourceCode, setSourceCode] = useState(problem.starterCode || '')
  const [customInput, setCustomInput] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [evaluationResult, setEvaluationResult] = useState(null)
  const [runResult, setRunResult] = useState(null)
  const [errorNotice, setErrorNotice] = useState('')
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState(0)
  const [copied, setCopied] = useState(false)

  // Load starter if needed
  useEffect(() => {
    if (!problem.starterCode) {
      fetchSubmissionStarter(problem.id)
        .then((data) => {
          if (data.starterCode) setSourceCode(data.starterCode)
        })
        .catch(() => {})
    }
  }, [problem.id])

  const handleRun = async () => {
    setIsRunning(true)
    setErrorNotice('')
    setRunResult(null)
    setEvaluationResult(null)
    try {
      const res = await runJavaAssignment(problem.id, sourceCode, showCustomInput ? customInput : null)
      setRunResult(res)
    } catch (err) {
      setErrorNotice(err.message || 'Run execution failed.')
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setErrorNotice('')
    setRunResult(null)
    setEvaluationResult(null)
    try {
      const res = await submitJavaAssignment(problem.id, sourceCode)
      setEvaluationResult(res)

      // Update progress and learner profile
      recordUserActivity({
        type: res.passed ? 'assignment-passed' : 'assignment-failed',
        id: problem.id,
        title: problem.title,
        topic: problem.topicName,
        status: res.status,
      })

      if (onProgressUpdate) onProgressUpdate()
    } catch (err) {
      setErrorNotice(err.message || 'Submission evaluation failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard?.writeText(sourceCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetCode = () => {
    setSourceCode(problem.starterCode || '')
    setRunResult(null)
    setEvaluationResult(null)
    setErrorNotice('')
  }

  return (
    <div className="practice-question-workspace page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
      {/* Top Navigation Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #27272a', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="quiet-button"
            onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '6px 10px' }}
          >
            <ArrowLeft size={15} /> All Problems
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', color: '#fff' }}>{problem.title}</h3>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 600,
                background:
                  problem.difficulty === 'beginner' || problem.difficulty === 'easy'
                    ? 'rgba(134, 239, 172, 0.12)'
                    : 'rgba(251, 191, 36, 0.12)',
                color:
                  problem.difficulty === 'beginner' || problem.difficulty === 'easy'
                    ? '#86efac'
                    : '#fbbf24',
              }}
            >
              {problem.difficulty}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Language: </span>
          <span style={{ fontSize: '12px', background: '#1f1f23', padding: '3px 8px', borderRadius: '4px', color: '#fbbf24', fontWeight: 600 }}>
            Java 17 (OpenJDK)
          </span>
        </div>
      </div>

      {/* Split Workspace Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) minmax(360px, 1.15fr)', gap: '16px', alignItems: 'start' }}>
        {/* Left Panel: Description / Visualizer / Hints */}
        <div className="panel" style={{ background: '#121214', border: '1px solid #27272a', borderRadius: '10px', overflow: 'hidden' }}>
          {/* Left Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #27272a', background: '#0e0e11' }}>
            <button
              type="button"
              onClick={() => setActiveLeftTab('description')}
              style={{
                flex: 1,
                padding: '10px 14px',
                background: activeLeftTab === 'description' ? '#121214' : 'transparent',
                border: 'none',
                borderBottom: activeLeftTab === 'description' ? '2px solid #fbbf24' : 'none',
                color: activeLeftTab === 'description' ? '#fff' : '#a1a1aa',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Description
            </button>
            <button
              type="button"
              onClick={() => setActiveLeftTab('visualizer')}
              style={{
                flex: 1,
                padding: '10px 14px',
                background: activeLeftTab === 'visualizer' ? '#121214' : 'transparent',
                border: 'none',
                borderBottom: activeLeftTab === 'visualizer' ? '2px solid #38bdf8' : 'none',
                color: activeLeftTab === 'visualizer' ? '#38bdf8' : '#a1a1aa',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Eye size={14} /> Visualize Problem
            </button>
            <button
              type="button"
              onClick={() => setActiveLeftTab('hints')}
              style={{
                flex: 1,
                padding: '10px 14px',
                background: activeLeftTab === 'hints' ? '#121214' : 'transparent',
                border: 'none',
                borderBottom: activeLeftTab === 'hints' ? '2px solid #fbbf24' : 'none',
                color: activeLeftTab === 'hints' ? '#fff' : '#a1a1aa',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Lightbulb size={14} /> Hints & AI
            </button>
          </div>

          <div style={{ padding: '16px', maxHeight: '680px', overflowY: 'auto' }}>
            {/* Tab 1: Description */}
            {activeLeftTab === 'description' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '14px', color: '#fbbf24' }}>Problem Statement</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#e4e4e7', lineHeight: '1.6' }}>
                    {problem.description}
                  </p>
                </div>

                {problem.examples && problem.examples.length > 0 && (
                  <div>
                    <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#fbbf24' }}>Examples</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {problem.examples.map((ex, idx) => (
                        <div key={idx} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '6px', padding: '10px 12px' }}>
                          <span style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 600 }}>Example {idx + 1}:</span>
                          <div style={{ marginTop: '4px', fontSize: '13px', fontFamily: 'monospace' }}>
                            <div><strong style={{ color: '#a1a1aa' }}>Input: </strong><span style={{ color: '#fff' }}>{ex.input}</span></div>
                            <div><strong style={{ color: '#a1a1aa' }}>Output: </strong><span style={{ color: '#86efac' }}>{ex.output}</span></div>
                          </div>
                          {ex.explanation && (
                            <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#a1a1aa' }}>
                              <em>Explanation:</em> {ex.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {problem.constraints && problem.constraints.length > 0 && (
                  <div>
                    <h4 style={{ margin: '0 0 6px', fontSize: '14px', color: '#fbbf24' }}>Constraints</h4>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#a1a1aa', lineHeight: '1.6' }}>
                      {problem.constraints.map((c, idx) => (
                        <li key={idx}><code style={{ color: '#e4e4e7', background: '#18181b', padding: '1px 4px', borderRadius: '3px' }}>{c}</code></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Question Visualizer */}
            {activeLeftTab === 'visualizer' && (
              <PracticeProblemVisualizer assignment={problem} />
            )}

            {/* Tab 3: Hints & AI Mentor */}
            {activeLeftTab === 'hints' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BrainCircuit size={16} style={{ color: '#fbbf24' }} />
                    <strong style={{ fontSize: '14px', color: '#fff' }}>Socratic AI Mentor Hints</strong>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#a1a1aa' }}>
                    Stuck? Reveal sequential hints or ask the AI Tutor for a tailored algorithmic walkthrough.
                  </p>
                </div>

                {problem.hints && problem.hints.map((hint, idx) => (
                  <div key={idx} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '6px', padding: '10px 14px' }}>
                    <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 600 }}>Hint {idx + 1}:</span>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#e4e4e7' }}>{hint}</p>
                  </div>
                ))}

                <Link
                  to="/tutor"
                  state={{ topic: problem.topicName, difficulty: problem.difficulty, assignmentId: problem.id }}
                  className="quiet-button"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', marginTop: '8px' }}
                >
                  <BrainCircuit size={15} /> Open AI Tutor with this Problem Context
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Java Code Editor & Evaluation Console */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Editor Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '8px 8px 0 0',
              padding: '8px 14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={15} style={{ color: '#fbbf24' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Solution.java</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="quiet-button"
                onClick={copyCode}
                style={{ padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Copy size={13} /> {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                type="button"
                className="quiet-button"
                onClick={resetCode}
                style={{ padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={13} /> Reset
              </button>
            </div>
          </div>

          {/* Textarea Code Editor */}
          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            spellCheck="false"
            style={{
              width: '100%',
              minHeight: '260px',
              height: '320px',
              background: '#09090b',
              border: '1px solid #27272a',
              borderRadius: '0 0 8px 8px',
              marginTop: '-12px',
              padding: '14px',
              color: '#f4f4f5',
              fontFamily: '"DM Mono", Menlo, Monaco, Consolas, monospace',
              fontSize: '13px',
              lineHeight: '1.5',
              resize: 'vertical',
            }}
          />

          {/* Custom Input Toggle & Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#a1a1aa', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showCustomInput}
                  onChange={(e) => setShowCustomInput(e.target.checked)}
                />
                Test with Custom Input
              </label>
            </div>

            {showCustomInput && (
              <input
                type="text"
                placeholder='e.g. {"values": [1, 2, 3]}'
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                style={{
                  padding: '8px 12px',
                  background: '#121214',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  color: '#fff',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              />
            )}
          </div>

          {/* Action Buttons: Run & Submit */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="quiet-button"
              onClick={handleRun}
              disabled={isRunning || isSubmitting || !sourceCode.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 600,
                border: '1px solid #3f3f46',
              }}
            >
              <Play size={14} style={{ color: '#38bdf8' }} /> {isRunning ? 'Running...' : 'Run Code'}
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={handleSubmit}
              disabled={isRunning || isSubmitting || !sourceCode.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 700,
                background: '#10b981',
                borderColor: '#059669',
              }}
            >
              <Send size={14} /> {isSubmitting ? 'Evaluating...' : 'Submit Solution'}
            </button>
          </div>

          {/* Output / Results Console */}
          {(runResult || evaluationResult || errorNotice) && (
            <div
              className="panel"
              style={{
                background: '#121214',
                border: '1px solid #27272a',
                borderRadius: '8px',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {errorNotice && (
                <div style={{ color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <XCircle size={15} /> {errorNotice}
                </div>
              )}

              {/* Status Badge */}
              {(runResult || evaluationResult) && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: 700,
                        background:
                          (evaluationResult?.status === 'Accepted' || runResult?.passed)
                            ? 'rgba(16, 185, 129, 0.2)'
                            : (evaluationResult?.status === 'Compilation Error' || runResult?.status === 'Compilation Error')
                              ? 'rgba(251, 191, 36, 0.2)'
                              : 'rgba(244, 63, 94, 0.2)',
                        color:
                          (evaluationResult?.status === 'Accepted' || runResult?.passed)
                            ? '#86efac'
                            : (evaluationResult?.status === 'Compilation Error' || runResult?.status === 'Compilation Error')
                              ? '#fbbf24'
                              : '#fca5a5',
                      }}
                    >
                      {evaluationResult?.status || runResult?.status}
                    </span>
                    {evaluationResult?.executionTimeMs && (
                      <span style={{ fontSize: '12px', color: '#71717a' }}>
                        Runtime: {evaluationResult.executionTimeMs} ms
                      </span>
                    )}
                  </div>

                  {evaluationResult && (
                    <span style={{ fontSize: '12px', color: '#a1a1aa' }}>
                      {evaluationResult.passedTests} / {evaluationResult.totalTests} tests passed
                    </span>
                  )}
                </div>
              )}

              {/* Feedback Message */}
              {(evaluationResult?.feedback || runResult?.feedback) && (
                <p style={{ margin: 0, fontSize: '13px', color: '#e4e4e7', lineHeight: '1.4' }}>
                  {evaluationResult?.feedback || runResult?.feedback}
                </p>
              )}

              {/* Compiler Diagnostics if any */}
              {(((evaluationResult?.diagnostics && evaluationResult.diagnostics.length > 0) ||
                (runResult?.diagnostics && runResult.diagnostics.length > 0))) && (
                <div style={{ background: '#1c1917', border: '1px solid #44403c', borderRadius: '6px', padding: '10px', fontSize: '12px', fontFamily: 'monospace', color: '#fde047' }}>
                  <strong>Compilation Errors:</strong>
                  {(evaluationResult?.diagnostics || runResult?.diagnostics || []).map((diag, i) => (
                    <div key={i} style={{ marginTop: '4px' }}>
                      {diag.line ? `Line ${diag.line}: ` : ''}{diag.message}
                    </div>
                  ))}
                </div>
              )}

              {/* Test Case Breakdown */}
              {(((evaluationResult?.results && evaluationResult.results.length > 0) ||
                (runResult?.results && runResult.results.length > 0))) && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #27272a', paddingBottom: '6px' }}>
                    {(evaluationResult?.results || runResult?.results || []).map((tc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveTestCaseIdx(idx)}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: activeTestCaseIdx === idx ? '#27272a' : 'transparent',
                          color: tc.passed ? '#86efac' : '#fca5a5',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Case {idx + 1} {tc.passed ? '✓' : '✗'}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const currentTc = (evaluationResult?.results || runResult?.results)?.[activeTestCaseIdx]
                    if (!currentTc) return null
                    return (
                      <div style={{ padding: '8px 0', fontSize: '12px', fontFamily: 'monospace' }}>
                        <div><strong style={{ color: '#a1a1aa' }}>Input: </strong>{JSON.stringify(currentTc.input)}</div>
                        <div><strong style={{ color: '#a1a1aa' }}>Expected: </strong><span style={{ color: '#86efac' }}>{currentTc.expected}</span></div>
                        <div><strong style={{ color: '#a1a1aa' }}>Your Output: </strong><span style={{ color: currentTc.passed ? '#86efac' : '#fca5a5' }}>{currentTc.actual}</span></div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function collectAllProblems(curriculum, progress) {
  const completedAssignmentIds = progress?.completedAssignmentIds || []
  const attemptedIds = (progress?.recentActivity || [])
    .filter((a) => a.type?.startsWith('assignment-'))
    .map((a) => a.id)

  const defaultProblems = [
    {
      id: 'pf-assignment-1',
      title: 'Sum of Array Elements',
      topicName: 'Programming Fundamentals',
      difficulty: 'beginner',
      description: 'Write a Java method that calculates and returns the sum of all elements in an integer array.',
      constraints: ['0 <= values.length <= 10^5', '-10^4 <= values[i] <= 10^4'],
      examples: [
        { input: 'values = [3, 5, 7]', output: '15', explanation: '3 + 5 + 7 = 15.' },
        { input: 'values = [1, 2, 3, 4, 5]', output: '15', explanation: 'Sum of first 5 positive integers.' },
      ],
      hints: ['Initialize a running total variable to 0.', 'Use an enhanced for loop to iterate over values.', 'Return the total after the loop finishes.'],
      starterCode: `class Solution {\n    public int sum(int[] values) {\n        int total = 0;\n        for (int v : values) {\n            total += v;\n        }\n        return total;\n    }\n}`,
    },
    {
      id: 'arrays-assignment-1',
      title: 'Find Maximum Element',
      topicName: 'Arrays',
      difficulty: 'beginner',
      description: 'Write a Java method that finds and returns the largest value in an integer array.',
      constraints: ['1 <= values.length <= 10^5', 'Values fit in signed 32-bit int'],
      examples: [
        { input: 'values = [2, 7, 1, 9, 4]', output: '9', explanation: '9 is the highest value in the array.' },
      ],
      hints: ['Initialize max with values[0].', 'Compare every subsequent element with max.', 'Update max whenever a larger value is encountered.'],
      starterCode: `class Solution {\n    public int findMax(int[] values) {\n        int max = values[0];\n        for (int i = 1; i < values.length; i++) {\n            if (values[i] > max) max = values[i];\n        }\n        return max;\n    }\n}`,
    },
    {
      id: 'two-sum',
      title: 'Two Sum II (Sorted Array)',
      topicName: 'Two Pointers',
      difficulty: 'easy',
      description: 'Given a 1-indexed sorted integer array numbers, find two numbers such that they add up to a specific target number.',
      constraints: ['2 <= numbers.length <= 3 * 10^4', 'numbers is sorted in non-decreasing order'],
      examples: [
        { input: 'numbers = [2, 7, 11, 15], target = 9', output: '[1, 2]', explanation: 'numbers[0] + numbers[1] == 9. Return 1-based indices.' },
      ],
      hints: ['Use two pointers starting at the beginning and end.', 'If sum is too small, advance left pointer.', 'If sum is too large, retreat right pointer.'],
      starterCode: `class Solution {\n    public int[] twoSum(int[] numbers, int target) {\n        int left = 0, right = numbers.length - 1;\n        while (left < right) {\n            int sum = numbers[left] + numbers[right];\n            if (sum == target) return new int[]{left + 1, right + 1};\n            else if (sum < target) left++;\n            else right--;\n        }\n        return new int[]{-1, -1};\n    }\n}`,
    },
    {
      id: 'searching-assignment-1',
      title: 'Binary Search in Sorted Array',
      topicName: 'Searching',
      difficulty: 'beginner',
      description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums in O(log n) time.',
      constraints: ['1 <= nums.length <= 10^4', '-10^4 < nums[i], target < 10^4', 'All integers in nums are unique and sorted'],
      examples: [
        { input: 'nums = [-1, 0, 3, 5, 9, 12], target = 9', output: '4', explanation: '9 exists in nums and its index is 4.' },
      ],
      hints: ['Set low = 0 and high = nums.length - 1.', 'Calculate mid = low + (high - low) / 2 to avoid overflow.', 'Compare nums[mid] to target and halve the search interval.'],
      starterCode: `class Solution {\n    public int binarySearch(int[] values, int target) {\n        int low = 0, high = values.length - 1;\n        while (low <= high) {\n            int mid = low + (high - low) / 2;\n            if (values[mid] == target) return mid;\n            else if (values[mid] < target) low = mid + 1;\n            else high = mid - 1;\n        }\n        return -1;\n    }\n}`,
    },
    {
      id: 'strings-assignment-1',
      title: 'Valid Palindrome',
      topicName: 'Strings',
      difficulty: 'beginner',
      description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
      constraints: ['1 <= s.length <= 2 * 10^5', 's consists only of printable ASCII characters'],
      examples: [
        { input: 's = "racecar"', output: 'true', explanation: 'Reads identically in both directions.' },
        { input: 's = "hello"', output: 'false', explanation: 'Not a palindrome.' },
      ],
      hints: ['Use Character.isLetterOrDigit() to skip punctuation.', 'Use Character.toLowerCase() for comparison.', 'Compare characters from opposite ends inward.'],
      starterCode: `class Solution {\n    public boolean isPalindrome(String s) {\n        int left = 0, right = s.length() - 1;\n        while (left < right) {\n            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;\n            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;\n            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) return false;\n            left++;\n            right--;\n        }\n        return true;\n    }\n}`,
    },
    {
      id: 'stacks-assignment-1',
      title: 'Valid Parentheses',
      topicName: 'Stacks',
      difficulty: 'beginner',
      description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
      constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only "()[]{}"'],
      examples: [
        { input: 's = "()"', output: 'true', explanation: 'Valid matching pair.' },
        { input: 's = "()[]{}"', output: 'true', explanation: 'All pairs properly closed in order.' },
        { input: 's = "(]"', output: 'false', explanation: 'Mismatched brackets.' },
      ],
      hints: ['When seeing an opening bracket, push the corresponding closing bracket.', 'When seeing a closing bracket, check if stack top matches and pop.', 'At the end, stack must be empty.'],
      starterCode: `import java.util.Stack;\n\nclass Solution {\n    public boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}`,
    },
    {
      id: 'linked-lists-assignment-1',
      title: 'Reverse a Singly Linked List',
      topicName: 'Linked Lists',
      difficulty: 'beginner',
      description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
      constraints: ['The number of nodes in the list is the range [0, 5000]', '-5000 <= Node.val <= 5000'],
      examples: [
        { input: 'head = [1, 2, 3, 4, 5]', output: '[5, 4, 3, 2, 1]', explanation: 'List redirected backward.' },
      ],
      hints: ['Keep three pointers: prev, curr, and next.', 'Save next node before rewiring curr.next to prev.', 'Advance prev to curr and curr to next.'],
      starterCode: `class Solution {\n    public Harness.ListNode reverseList(Harness.ListNode head) {\n        Harness.ListNode prev = null;\n        Harness.ListNode curr = head;\n        while (curr != null) {\n            Harness.ListNode nextNode = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = nextNode;\n        }\n        return prev;\n    }\n}`,
    },
    {
      id: 'climbing-stairs',
      title: 'Climbing Stairs',
      topicName: 'Dynamic Programming',
      difficulty: 'easy',
      description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
      constraints: ['1 <= n <= 45'],
      examples: [
        { input: 'n = 2', output: '2', explanation: '1+1 step or 2 steps.' },
        { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, or 2+1.' },
      ],
      hints: ['To reach step n, you must come from step n-1 or n-2.', 'ways(n) = ways(n-1) + ways(n-2).', 'This matches Fibonacci sequence.'],
      starterCode: `class Solution {\n    public int climbStairs(int n) {\n        if (n <= 2) return n;\n        int prev2 = 1, prev1 = 2;\n        for (int i = 3; i <= n; i++) {\n            int curr = prev1 + prev2;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n}`,
    },
  ]

  return defaultProblems.map((p) => ({
    ...p,
    isSolved: completedAssignmentIds.includes(p.id) || p.id === 'pf-assignment-1',
    isAttempted: attemptedIds.includes(p.id) || p.id === 'pf-assignment-1',
  }))
}
