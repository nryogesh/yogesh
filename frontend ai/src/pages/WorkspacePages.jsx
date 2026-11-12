import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import './WorkspacePages.css'
import './PracticeProblem.css'
import './Curriculum.css'
import './LearningExperience.css'
import { fetchCurriculum, submitCurriculumQuiz } from '../services/api'
import { loadLearningProgress, markLessonViewed, markQuizPassed, saveLearningProgress } from '../services/learning-progress'
import { summarizeLearning } from '../services/learning-summary'
import { loadLearnerProfile, saveLearnerProfile, createDefaultDemoProfile } from '../services/learner-profile'
import PracticeWorkspace from '../components/PracticeWorkspace'
import ConceptVisualizer from '../components/ConceptVisualizer'
import { DSA_CONCEPTS } from '../data/dsa-concepts'
import {
  ArrowRight, BookOpen, BrainCircuit, Search,
} from 'lucide-react'

function PageHeader({ eyebrow, title, description, action }) {
  return <section className="workspace-header"><div><p className="eyebrow accent-eyebrow">{eyebrow}</p><h2>{title}</h2><p className="muted">{description}</p></div>{action}</section>
}

function Roadmap() {
  const [topics, setTopics] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCurriculum(loadLearningProgress()).then(setTopics).catch((requestError) => setError(requestError.message))
  }, [])

  const topicName = (id) => topics.find((topic) => topic.id === id)?.name || id

  return <div className="workspace-page page-enter">
    <PageHeader eyebrow="Curriculum" title="Learning roadmap" description="Prerequisites unlock topics; each topic lists its concrete completion requirements." />
    {error && <p className="curriculum-state problem-error" role="alert">{error}</p>}
    {!error && topics.length === 0 && <p className="curriculum-state" role="status">Loading roadmap...</p>}
    <ol className="roadmap-learning-list">{topics.map((topic, index) => <li className={`roadmap-learning-item status-${topic.progression.status}`} key={topic.id}>
      <span className="roadmap-marker">{index + 1}</span>
      <div className="roadmap-learning-copy">
        <div className="curriculum-lesson-header"><div><p className="eyebrow">{topic.level} · {topic.category}</p><h3>{topic.name}</h3><p>{topic.description}</p></div><span className={`curriculum-status state-${topic.progression.status}`}>{topic.progression.status.replace('-', ' ')}</span></div>
        {topic.progression.unmetPrerequisites.length > 0 && <p><strong>Prerequisites to complete:</strong> {topic.progression.unmetPrerequisites.map(topicName).join(', ')}</p>}
        <p>{topic.progression.lessonViewed ? 'Lesson viewed' : topic.lessonAvailable ? 'Lesson not viewed' : 'Lesson still being authored'} · {topic.progression.completedAssignmentIds.length} / {topic.completionRequirements.assignmentIds.length} assignments · {topic.progression.passedQuizIds.length} / {topic.completionRequirements.quizIds.length} quizzes passed</p>
        {topic.progression.nextRecommendedTopic && <p><strong>Next recommended:</strong> {topic.progression.nextRecommendedTopic.title}</p>}
        <Link className="text-button" to={`/topics/${topic.id}`}>Open topic <ArrowRight size={14} /></Link>
      </div>
    </li>)}</ol>
  </div>
}

function Topics({ routeTopicId }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [topics, setTopics] = useState([])
  const [selectedTopicId, setSelectedTopicId] = useState('')
  const [progress, setProgress] = useState(loadLearningProgress)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizStatus, setQuizStatus] = useState({})

  useEffect(() => {
    let active = true

    fetchCurriculum(loadLearningProgress())
      .then((curriculum) => {
        if (!active) return
        setTopics(curriculum)
        setSelectedTopicId((currentId) => (
          curriculum.some((topic) => topic.id === currentId)
            ? currentId
            : curriculum.find((topic) => topic.progression.status === 'available')?.id || curriculum.find((topic) => topic.status === 'published')?.id || curriculum[0]?.id || ''
        ))
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load the curriculum')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [reloadKey])

  useEffect(() => {
    if (routeTopicId && topics.length > 0 && !topics.some((topic) => topic.id === routeTopicId)) {
      navigate('/topics', { replace: true })
    }
  }, [routeTopicId, topics, navigate])

  const filteredTopics = topics.filter((topic) => topic.name.toLowerCase().includes(query.toLowerCase()))
  const selectedTopic = topics.find((topic) => topic.id === (routeTopicId || selectedTopicId))
  const getTopicName = (topicId) => topics.find((topic) => topic.id === topicId)?.name || topicId
  const openTopic = (topicId) => {
    setSelectedTopicId(topicId)
    navigate(`/topics/${topicId}`)
  }
  const updateProgress = async (nextProgress) => {
    try {
      const savedProgress = saveLearningProgress(nextProgress)
      setProgress(savedProgress)
      const updatedTopics = await fetchCurriculum(savedProgress)
      setTopics(updatedTopics)
      setError('')
    } catch (progressError) {
      setError(progressError.message || 'Could not save learning progress')
    }
  }
  const submitQuiz = async (quiz) => {
    const answers = quiz.questions.map((_question, index) => quizAnswers[quiz.id]?.[index] || '')
    setQuizStatus((current) => ({ ...current, [quiz.id]: { loading: true, message: '' } }))
    try {
      const result = await submitCurriculumQuiz({
        topicId: selectedTopic.id,
        quizId: quiz.id,
        answers,
        progress,
      })
      if (result.passed) {
        const nextProgress = markQuizPassed(progress, quiz.id)
        await updateProgress(nextProgress)
      }
      setQuizStatus((current) => ({
        ...current,
        [quiz.id]: { loading: false, message: result.passed ? 'Passed. This knowledge check is complete.' : 'Not passed yet. Review the lesson and try again.' },
      }))
    } catch (quizError) {
      setQuizStatus((current) => ({ ...current, [quiz.id]: { loading: false, message: quizError.message } }))
    }
  }
  const statusLabel = (topic) => topic.progression.status.replace('-', ' ')
  const requirementsRemaining = (topic) => (
    (topic.completionRequirements.lessonViewed && !topic.progression.lessonViewed ? 1 : 0) +
    topic.completionRequirements.assignmentIds.filter((id) => !topic.progression.completedAssignmentIds.includes(id)).length +
    topic.completionRequirements.quizIds.filter((id) => !topic.progression.passedQuizIds.includes(id)).length
  )
  const startOrContinueTopic = (topic) => {
    if (topic.progression.status === 'available') {
      updateProgress(markLessonViewed(progress, topic.id))
    } else {
      document.getElementById('topic-lesson')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return <div className="workspace-page page-enter">
    <PageHeader eyebrow="Curriculum" title="Topics" description="Unlock topics through prerequisites and complete explicit lesson, assignment, and quiz requirements. Progress is saved in this browser." action={<div className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search topics" aria-label="Search topics" /></div>} />
    {loading && <p className="curriculum-state" role="status">Loading curriculum...</p>}
    {!loading && error && <div className="curriculum-state curriculum-error" role="alert"><p>{error}</p><button className="quiet-button" onClick={() => { setLoading(true); setError(''); setReloadKey((key) => key + 1) }}>Try again</button></div>}
    {!loading && !error && topics.length === 0 && <p className="curriculum-state">No curriculum topics are available yet.</p>}
    {!loading && !error && topics.length > 0 && <div className="curriculum-layout">
      <nav className="curriculum-directory" aria-label="Curriculum topics">
        {filteredTopics.length === 0 && <p className="curriculum-state">No topics match your search.</p>}
        {filteredTopics.map((topic) => <button className={`curriculum-topic-link ${(routeTopicId || selectedTopicId) === topic.id ? 'selected' : ''}`} key={topic.id} onClick={() => openTopic(topic.id)} aria-current={(routeTopicId || selectedTopicId) === topic.id ? 'page' : undefined}>
          <span className="curriculum-topic-icon"><BookOpen size={16} /></span>
          <span className="curriculum-topic-copy"><strong>{topic.name}</strong><small>{topic.category} · {topic.level}</small></span>
          <span className={`curriculum-status state-${topic.progression.status}`}>{statusLabel(topic)}</span>
        </button>)}
      </nav>
      <section className="curriculum-content" aria-live="polite">
        {!selectedTopic && <p className="curriculum-state">Choose a topic to view its curriculum.</p>}
        {selectedTopic && <article className="curriculum-lesson">
          <header className="curriculum-lesson-header"><div><p className="eyebrow">{selectedTopic.category} · {selectedTopic.level}</p><h3>{selectedTopic.name}</h3><p>{selectedTopic.description}</p></div><span className={`curriculum-status state-${selectedTopic.progression.status}`}>{statusLabel(selectedTopic)}</span></header>
          {!selectedTopic.progression.unlocked && <section className="curriculum-section curriculum-unavailable"><h4>{selectedTopic.lessonAvailable ? 'Locked' : 'Lesson still being authored'}</h4><p>{selectedTopic.lessonAvailable ? 'Complete these prerequisite topics first:' : 'This topic cannot be started until its lesson content is authored.'}</p>{selectedTopic.prerequisites.length > 0 && <ul>{selectedTopic.prerequisites.map((topicId) => {
            const prerequisite = topics.find((topic) => topic.id === topicId)
            const unmet = selectedTopic.progression.unmetPrerequisites.includes(topicId)
            const assignmentsRemaining = prerequisite
              ? prerequisite.completionRequirements.assignmentIds.length - prerequisite.progression.completedAssignmentIds.length
              : 0
            const quizzesRemaining = prerequisite
              ? prerequisite.completionRequirements.quizIds.length - prerequisite.progression.passedQuizIds.length
              : 0
            return <li key={topicId}><button className="text-button" onClick={() => openTopic(topicId)}>{getTopicName(topicId)}</button>{unmet ? ` — ${prerequisite?.progression.lessonViewed ? 'lesson viewed' : 'view lesson'}, ${assignmentsRemaining} assignment(s), ${quizzesRemaining} quiz(es) remaining` : ' — complete'}</li>
          })}</ul>}</section>}
          {selectedTopic.progression.unlocked && <>
          <section className="topic-progress-panel" aria-label="Topic progress">
            {selectedTopic.progression.status === 'completed'
              ? <><strong>Topic completed</strong><p>Lesson viewed, all assignments completed, and quiz passed.</p>{selectedTopic.progression.nextRecommendedTopic && <button className="primary-button" onClick={() => openTopic(selectedTopic.progression.nextRecommendedTopic.id)}>Continue to {selectedTopic.progression.nextRecommendedTopic.title}<ArrowRight size={14} /></button>}</>
              : <><strong>{selectedTopic.progression.status === 'available' ? 'Ready to start' : 'In progress'}</strong><p>{selectedTopic.progression.status === 'available' ? 'Start the lesson when you are ready.' : `${requirementsRemaining(selectedTopic)} completion requirement${requirementsRemaining(selectedTopic) === 1 ? '' : 's'} remaining.`}</p><button className="primary-button" onClick={() => startOrContinueTopic(selectedTopic)}>{selectedTopic.progression.status === 'available' ? 'Start Learning' : 'Continue Learning'} <ArrowRight size={14} /></button></>}
            <Link className="quiet-button" to="/tutor" state={{ topic: selectedTopic.name, difficulty: selectedTopic.level }}><BrainCircuit size={15} /> Ask AI Tutor</Link>
          </section>
          <section className="curriculum-section topic-objectives"><h4>1. Learning objectives</h4><ul>{selectedTopic.learningObjectives.map((objective) => <li key={objective}>{objective}</li>)}</ul></section>
          {(() => {
            const matchingConcept = DSA_CONCEPTS.find((c) => c.topicName.toLowerCase() === selectedTopic.name.toLowerCase() || c.id.toLowerCase().includes(selectedTopic.id.toLowerCase())) || DSA_CONCEPTS[0]
            return (
              <section className="curriculum-section topic-visualizer" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0 }}>Interactive Concept Visualizer</h4>
                  <Link to="/visualizer" className="text-button" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Open in Full Visualizer Lab <ArrowRight size={13} />
                  </Link>
                </div>
                <ConceptVisualizer concept={matchingConcept} />
              </section>
            )
          })()}
          <section className="curriculum-section topic-lesson" id="topic-lesson"><h4>2. Lesson / concept explanation</h4>{selectedTopic.lessonSections.map((section, index) => <article className="topic-concept-card" key={section.title}><span className="topic-step-number">{index + 1}</span><div><h5>{section.title}</h5><p>{section.explanation}</p></div></article>)}<button className="quiet-button" disabled={selectedTopic.progression.lessonViewed} onClick={() => updateProgress(markLessonViewed(progress, selectedTopic.id))}>{selectedTopic.progression.lessonViewed ? 'Lesson viewed' : 'Mark lesson viewed'}</button></section>
          <section className="curriculum-section topic-example"><h4>3. Worked example</h4><article className="worked-example-card"><h5>{selectedTopic.workedExample.title}</h5><ol>{selectedTopic.workedExample.steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol><p className="curriculum-dry-run"><strong>Dry run:</strong> {selectedTopic.workedExample.dryRun}</p></article></section>
          {selectedTopic.javaExample && <section className="curriculum-section topic-java-example"><h4>4. Java implementation</h4><h5>{selectedTopic.javaExample.title}</h5><p>{selectedTopic.javaExample.explanation}</p><pre><code>{selectedTopic.javaExample.code}</code></pre><p><strong>Expected output</strong></p><pre><code>{selectedTopic.javaExample.expectedOutput}</code></pre></section>}
          {selectedTopic.complexityNote && <section className="curriculum-section topic-complexity"><h4>5. Complexity</h4><p>{selectedTopic.complexityNote}</p></section>}
          <section className="curriculum-section topic-notes"><h4>6. Notes / key points</h4><ul>{selectedTopic.referenceNotes.map((note) => <li key={note}>{note}</li>)}</ul>{selectedTopic.commonMistakes?.length > 0 && <><h5>Common mistakes</h5><ul>{selectedTopic.commonMistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul></>}{selectedTopic.referenceLinks.length > 0 && <div className="curriculum-links"><h5>Further reading</h5>{selectedTopic.referenceLinks.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label}<span>{link.kind}</span></a>)}</div>}</section>
          <section className="curriculum-section topic-practice"><h4>7. Practice assignments</h4><p>Work through the exercises; assignment completion is recorded after the evaluator confirms a passing solution.</p>{['beginner', 'intermediate', 'advanced'].map((difficulty) => {
            const assignments = selectedTopic.assignments.filter((assignment) => assignment.difficulty === difficulty)
            return <div className="topic-difficulty-group" key={difficulty}><h5><span className={`difficulty ${difficulty}`}>{difficulty}</span></h5>{assignments.length === 0 ? <p>No {difficulty} assignments are available for this topic yet.</p> : <ul>{assignments.map((assignment) => <li key={assignment.id}>{assignment.title} — {selectedTopic.progression.completedAssignmentIds.includes(assignment.id) ? 'completed' : 'not completed'}</li>)}</ul>}</div>
          })}<Link className="text-button" to="/practice">Open Practice assignments <ArrowRight size={14} /></Link></section>
          <section className="curriculum-section topic-quiz"><h4>8. Quiz</h4>{selectedTopic.quizzes.map((quiz) => <article className="curriculum-question" key={quiz.id}><h5>Check your understanding</h5>{quiz.questions.map((question, questionIndex) => <fieldset className="curriculum-quiz-question" key={`${quiz.id}-${questionIndex}`}><legend>{question.question}</legend>{question.options.map((option) => <label key={option}><input type="radio" name={`${quiz.id}-${questionIndex}`} value={option} checked={quizAnswers[quiz.id]?.[questionIndex] === option} onChange={() => setQuizAnswers((current) => ({ ...current, [quiz.id]: { ...current[quiz.id], [questionIndex]: option } }))} />{option}</label>)}</fieldset>)}<button className="quiet-button" onClick={() => submitQuiz(quiz)} disabled={quizStatus[quiz.id]?.loading || selectedTopic.progression.passedQuizIds.includes(quiz.id)}>{quizStatus[quiz.id]?.loading ? 'Checking...' : selectedTopic.progression.passedQuizIds.includes(quiz.id) ? 'Quiz passed' : 'Submit quiz'}</button>{quizStatus[quiz.id]?.message && <p role="status">{quizStatus[quiz.id].message}</p>}</article>)}</section>
          <section className="curriculum-section topic-tutor"><h4>9. Ask AI Tutor</h4><p>Ask a question about {selectedTopic.name} or request a simpler explanation or example.</p><Link className="primary-button" to="/tutor" state={{ topic: selectedTopic.name, difficulty: selectedTopic.level }}><BrainCircuit size={15} /> Ask AI Tutor <ArrowRight size={14} /></Link></section>
          </>}
        </article>}
      </section>
    </div>}
  </div>
}

function Notes() {
  const [query, setQuery] = useState('')
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetchCurriculum()
      .then((curriculum) => {
        if (active) setTopics(curriculum.filter((topic) => topic.notesAvailable && topic.referenceNotes?.length))
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load topic notes.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const filteredTopics = topics.filter((topic) => (
    topic.name.toLowerCase().includes(query.toLowerCase()) ||
    topic.referenceNotes.some((note) => note.toLowerCase().includes(query.toLowerCase()))
  ))

  return <div className="workspace-page page-enter">
    <PageHeader eyebrow="Study materials" title="Topic notes" description="Review the notes authored for each published topic. Open a topic for its lesson, worked example, assignments, and quiz." action={<div className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes" aria-label="Search notes" /></div>} />
    {loading && <p className="curriculum-state" role="status">Loading topic notes...</p>}
    {error && <p className="curriculum-state problem-error" role="alert">{error}</p>}
    {!loading && !error && filteredTopics.length === 0 && <p className="curriculum-state">{topics.length ? 'No notes match your search.' : 'No authored topic notes are available yet.'}</p>}
    <div className="notes-topic-list">{filteredTopics.map((topic) => <article className="panel notes-topic-card" key={topic.id}>
      <header className="notes-topic-heading"><div><p className="eyebrow">{topic.category} · {topic.level}</p><h3>{topic.name}</h3></div><Link className="text-button" to={`/topics/${topic.id}`}>Open lesson <ArrowRight size={14} /></Link></header>
      <ul>{topic.referenceNotes.map((note) => <li key={note}>{note}</li>)}</ul>
      {topic.referenceLinks.length > 0 && <div className="curriculum-links"><h4>Further reading</h4>{topic.referenceLinks.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label}<span>{link.kind}</span></a>)}</div>}
    </article>)}</div>
  </div>
}

function Practice() {
  const [curriculum, setCurriculum] = useState([])
  const [progress, setProgress] = useState(loadLearningProgress)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshData = () => {
    const currentProgress = loadLearningProgress()
    setProgress(currentProgress)
    fetchCurriculum(currentProgress)
      .then(setCurriculum)
      .catch((err) => setError(err.message || 'Could not load practice curriculum.'))
  }

  useEffect(() => {
    let active = true
    fetchCurriculum(loadLearningProgress())
      .then((topics) => {
        if (!active) return
        setCurriculum(topics)
      })
      .catch((err) => {
        if (active) setError(err.message || 'Could not load assignments')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return <div className="workspace-page page-enter"><p className="curriculum-state" role="status">Loading practice problems...</p></div>
  }

  if (error) {
    return (
      <div className="workspace-page page-enter">
        <div className="curriculum-state curriculum-error" role="alert">
          <p>{error}</p>
          <button className="quiet-button" onClick={refreshData}>Try again</button>
        </div>
      </div>
    )
  }

  return (
    <div className="workspace-page page-enter">
      <PageHeader
        eyebrow="Practice & Assessment"
        title="Java DSA Practice Workspace"
        description="Write and test your solutions with real Java 17 execution. Traced step-by-step with problem visualizers."
      />
      <PracticeWorkspace
        curriculum={curriculum}
        progress={progress}
        onProgressUpdate={refreshData}
      />
    </div>
  )
}

function Progress() {
  const [topics, setTopics] = useState([])
  const [progress] = useState(loadLearningProgress)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCurriculum(progress).then(setTopics).catch((requestError) => setError(requestError.message))
  }, [progress])

  const counts = topics.reduce((result, topic) => {
    result[topic.progression.status] += 1
    return result
  }, { locked: 0, available: 0, 'in-progress': 0, completed: 0 })
  const startedTopics = topics.filter((topic) => topic.progression.status === 'in-progress' || topic.progression.status === 'completed')
  const summary = summarizeLearning(topics, progress)

  return <div className="workspace-page page-enter">
    <PageHeader eyebrow="Your trajectory" title="Progress" description="Progress is based on lesson views, evaluator-confirmed assignment completion, and passed quizzes stored in this browser." />
    {error && <p className="curriculum-state problem-error" role="alert">{error}</p>}
    {!error && topics.length === 0 && <p className="curriculum-state" role="status">Loading progress...</p>}
    {topics.length > 0 && <>
      <section className="roadmap-summary">
        <article className="summary-stat"><strong>{summary.problemsSolved}</strong><span>problems solved</span></article>
        <article className="summary-stat"><strong>{summary.accuracy === null ? '—' : `${summary.accuracy}%`}</strong><span>evaluator pass rate · {summary.assignmentAttempts} attempts</span></article>
        <article className="summary-stat"><strong>{summary.streak} day{summary.streak === 1 ? '' : 's'}</strong><span>current learning streak</span></article>
      </section>
      <section className="roadmap-summary">
        {Object.entries(counts).map(([status, count]) => <article className="summary-stat" key={status}><span className={`status-dot state-${status}`} /><div><strong>{count}</strong><span>{status.replace('-', ' ')}</span></div></article>)}
      </section>
      {startedTopics.length === 0
        ? <section className="curriculum-state"><h3>No topic progress yet</h3><p>Start with Programming Fundamentals. Nothing is marked complete until you record learner activity.</p><Link className="primary-button" to="/topics">Open topics <ArrowRight size={14} /></Link></section>
        : <ol className="roadmap-learning-list">{startedTopics.map((topic) => <li className={`roadmap-learning-item status-${topic.progression.status}`} key={topic.id}><div className="roadmap-learning-copy"><div className="curriculum-lesson-header"><div><h3>{topic.name}</h3></div><span className={`curriculum-status state-${topic.progression.status}`}>{topic.progression.status.replace('-', ' ')}</span></div><p>Lesson {topic.progression.lessonViewed ? 'viewed' : 'not viewed'} · {topic.progression.completedAssignmentIds.length} / {topic.completionRequirements.assignmentIds.length} assignments · {topic.progression.passedQuizIds.length} / {topic.completionRequirements.quizIds.length} quizzes</p><Link className="text-button" to={`/topics/${topic.id}`}>Continue topic <ArrowRight size={14} /></Link></div></li>)}</ol>}
    </>}
  </div>
}

function Profile() {
  const [profile, setProfile] = useState(loadLearnerProfile)
  const [displayName, setDisplayName] = useState(profile?.displayName || 'Alex Rivers')
  const [learningGoal, setLearningGoal] = useState(profile?.learningGoal || 'Master LeetCode Mediums and Data Structures in Java')
  const [level, setLevel] = useState(profile?.level || 'Intermediate')
  const [topics, setTopics] = useState([])
  const [progress] = useState(loadLearningProgress)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    fetchCurriculum(progress)
      .then((curriculum) => {
        if (active) setTopics(curriculum)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load learning statistics.')
      })
    return () => {
      active = false
    }
  }, [progress])

  const summary = summarizeLearning(topics, progress)

  const saveProfile = (event) => {
    event.preventDefault()
    setError('')
    setSaved(false)
    try {
      const nextProfile = saveLearnerProfile({ displayName, learningGoal, level })
      setProfile(nextProfile)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (profileError) {
      setError(profileError.message || 'Could not save your profile.')
    }
  }

  const resetToDefaultDemo = () => {
    const fresh = createDefaultDemoProfile()
    setProfile(fresh)
    setDisplayName(fresh.displayName)
    setLearningGoal(fresh.learningGoal)
    setLevel(fresh.level)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const realActivity = profile?.realActivity || []
  const sampleActivity = profile?.sampleActivity || []

  return (
    <div className="workspace-page page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        eyebrow="Learner Identity"
        title="Learner Profile & Activity"
        description="Your local demo profile, learning statistics, skill level, and execution records."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(320px, 1fr)', gap: '18px' }}>
        {/* Left: Profile Edit Card */}
        <section className="panel" style={{ background: '#121214', border: '1px solid #27272a', borderRadius: '10px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid #27272a' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                color: '#000',
                display: 'grid',
                placeItems: 'center',
                fontSize: '22px',
                fontWeight: 800,
              }}
            >
              {profile?.avatar || displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'AR'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>{displayName}</h3>
                <span style={{ fontSize: '11px', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  {profile?.level || 'Intermediate'}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', color: '#a1a1aa', fontSize: '13px' }}>
                {profile?.isDemo ? '⭐ Demo Learner Profile' : 'Local Browser Learner'}
              </p>
            </div>
          </div>

          <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
            <div>
              <label htmlFor="profile-display-name" style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>
                Display Name
              </label>
              <input
                id="profile-display-name"
                value={displayName}
                maxLength={60}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: '#18181b', border: '1px solid #27272a', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                required
              />
            </div>

            <div>
              <label htmlFor="profile-learning-goal" style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>
                Learning Goal
              </label>
              <input
                id="profile-learning-goal"
                value={learningGoal}
                maxLength={120}
                onChange={(e) => setLearningGoal(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: '#18181b', border: '1px solid #27272a', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                required
              />
            </div>

            <div>
              <label htmlFor="profile-level" style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>
                Skill Level
              </label>
              <select
                id="profile-level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: '#18181b', border: '1px solid #27272a', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
              >
                <option value="Beginner">Beginner (Foundations & Syntax)</option>
                <option value="Intermediate">Intermediate (Trees, Binary Search, DP)</option>
                <option value="Advanced">Advanced (Graphs, Hard DP, Segment Trees)</option>
              </select>
            </div>

            {error && <p className="problem-error" role="alert">{error}</p>}
            {saved && <p style={{ color: '#86efac', fontSize: '13px', margin: 0 }}>✓ Profile updated successfully.</p>}

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button className="primary-button" type="submit" style={{ flex: 1, padding: '10px' }}>
                Save Profile Details
              </button>
              <button
                type="button"
                className="quiet-button"
                onClick={resetToDefaultDemo}
                style={{ padding: '10px', fontSize: '12px' }}
                title="Reset demo user profile"
              >
                Reset Demo
              </button>
            </div>
          </form>
        </section>

        {/* Right: Learning Stats */}
        <section className="panel" style={{ background: '#121214', border: '1px solid #27272a', borderRadius: '10px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', color: '#fff' }}>Performance Statistics</h3>
            <span style={{ fontSize: '11px', background: '#18181b', color: '#86efac', padding: '3px 8px', borderRadius: '4px' }}>
              Real-time Tracker
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{ background: '#18181b', borderRadius: '8px', padding: '14px', border: '1px solid #27272a' }}>
              <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Total XP</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>
                {profile?.stats?.totalXp || 1450} XP
              </div>
            </div>

            <div style={{ background: '#18181b', borderRadius: '8px', padding: '14px', border: '1px solid #27272a' }}>
              <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Learning Streak</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
                🔥 {profile?.stats?.streakDays || 5} Days
              </div>
            </div>

            <div style={{ background: '#18181b', borderRadius: '8px', padding: '14px', border: '1px solid #27272a' }}>
              <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Problems Solved</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#86efac', marginTop: '4px' }}>
                {summary.problemsSolved + (profile?.stats?.problemsSolved || 14)}
              </div>
            </div>

            <div style={{ background: '#18181b', borderRadius: '8px', padding: '14px', border: '1px solid #27272a' }}>
              <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Pass Rate</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                {summary.accuracy !== null ? `${summary.accuracy}%` : `${profile?.stats?.accuracy || 82}%`}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '18px', padding: '12px', background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '6px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#d4d4d8', lineHeight: '1.5' }}>
              <strong>Browser Persistence:</strong> Your code attempts, quiz completions, and profile changes are automatically persisted to LocalStorage on this device.
            </p>
          </div>
        </section>
      </div>

      {/* Distinction: Actual User Activity vs Sample Demo Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1fr)', gap: '18px' }}>
        {/* Real User Activity */}
        <section className="panel" style={{ background: '#121214', border: '1px solid #27272a', borderRadius: '10px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', color: '#86efac' }}>Actual User Activity</h4>
              <small style={{ color: '#a1a1aa' }}>Verified actions performed in this browser session</small>
            </div>
            <span style={{ fontSize: '11px', background: 'rgba(134, 239, 172, 0.15)', color: '#86efac', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              Live Record ({realActivity.length})
            </span>
          </div>

          {realActivity.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#71717a', fontSize: '13px' }}>
              No real submissions yet in this session. Head to <Link to="/practice" style={{ color: '#fbbf24' }}>Practice</Link> to run and submit code!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
              {realActivity.map((act, idx) => (
                <div key={idx} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '6px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#fff' }}>{act.title || act.id}</strong>
                    <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px' }}>
                      {act.type?.replace('-', ' ')} • {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, background: act.type?.includes('passed') ? 'rgba(134, 239, 172, 0.15)' : 'rgba(244, 63, 94, 0.15)', color: act.type?.includes('passed') ? '#86efac' : '#fca5a5' }}>
                    {act.status || (act.type?.includes('passed') ? 'Accepted' : 'Wrong Answer')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sample Demo Activity */}
        <section className="panel" style={{ background: '#121214', border: '1px solid #27272a', borderRadius: '10px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', color: '#fbbf24' }}>Sample Demo Activity</h4>
              <small style={{ color: '#a1a1aa' }}>Pre-populated historical data for demonstration</small>
            </div>
            <span style={{ fontSize: '11px', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              Demo Fixture
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
            {sampleActivity.map((act) => (
              <div key={act.id} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '6px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '13px', color: '#fff' }}>{act.title}</strong>
                  <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px' }}>
                    {act.topic} • {act.difficulty} • {act.date}
                  </div>
                </div>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, background: act.status === 'Accepted' ? 'rgba(134, 239, 172, 0.15)' : 'rgba(251, 191, 36, 0.15)', color: act.status === 'Accepted' ? '#86efac' : '#fbbf24' }}>
                  {act.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default function WorkspacePages({ page }) {
  const { topicId } = useParams()
  if (page === 'roadmap') return <Roadmap />
  if (page === 'topics') return <Topics routeTopicId={topicId} />
  if (page === 'notes') return <Notes />
  if (page === 'practice') return <Practice />
  if (page === 'progress') return <Progress />
  return <Profile />
}
