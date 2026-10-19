import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './WorkspacePages.css'
import './PracticeProblem.css'
import './Curriculum.css'
import { fetchCurriculum, fetchSubmissionStarter, generateProblem, postHint, submitCurriculumQuiz, submitJavaAssignment } from '../services/api'
import { loadLearningProgress, markAssignmentPassed, markLessonViewed, markQuizPassed, saveLearningProgress } from '../services/learning-progress'
import {
  ArrowRight, BookOpen, BrainCircuit, Search, Settings, UserRound, Zap,
} from 'lucide-react'

function PageHeader({ eyebrow, title, description, action }) {
  const note = eyebrow === 'Deliberate practice'
    ? 'Practice suggestions are static examples; results are not saved.'
    : eyebrow === 'Your workspace'
      ? 'Profile activity values are sample data; progress is not tracked.'
      : ''
  const headerDescription = eyebrow === 'Deliberate practice'
    ? 'Generate a practice problem on request. Practice results are not saved.'
    : description

  return <section className="workspace-header"><div><p className="eyebrow accent-eyebrow">{eyebrow}</p><h2>{title}</h2><p className="muted">{headerDescription}</p>{note && <p className="workspace-disclaimer">{note}</p>}</div>{eyebrow !== 'Deliberate practice' && action}</section>
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
        <Link className="text-button" to="/topics">Open topic <ArrowRight size={14} /></Link>
      </div>
    </li>)}</ol>
  </div>
}

function Topics() {
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

  const filteredTopics = topics.filter((topic) => topic.name.toLowerCase().includes(query.toLowerCase()))
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId)
  const getTopicName = (topicId) => topics.find((topic) => topic.id === topicId)?.name || topicId
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
        {filteredTopics.map((topic) => <button className={`curriculum-topic-link ${selectedTopicId === topic.id ? 'selected' : ''}`} key={topic.id} onClick={() => setSelectedTopicId(topic.id)} aria-current={selectedTopicId === topic.id ? 'page' : undefined}>
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
            return <li key={topicId}><button className="text-button" onClick={() => setSelectedTopicId(topicId)}>{getTopicName(topicId)}</button>{unmet ? ` — ${prerequisite?.progression.lessonViewed ? 'lesson viewed' : 'view lesson'}, ${assignmentsRemaining} assignment(s), ${quizzesRemaining} quiz(es) remaining` : ' — complete'}</li>
          })}</ul>}</section>}
          {selectedTopic.progression.unlocked && <>
          <section className="topic-progress-panel" aria-label="Topic progress">
            {selectedTopic.progression.status === 'completed'
              ? <><strong>Topic completed</strong><p>Lesson viewed, all assignments completed, and quiz passed.</p>{selectedTopic.progression.nextRecommendedTopic && <button className="primary-button" onClick={() => setSelectedTopicId(selectedTopic.progression.nextRecommendedTopic.id)}>Continue to {selectedTopic.progression.nextRecommendedTopic.title}<ArrowRight size={14} /></button>}</>
              : <><strong>{selectedTopic.progression.status === 'available' ? 'Ready to start' : 'In progress'}</strong><p>{selectedTopic.progression.status === 'available' ? 'Start the lesson when you are ready.' : `${requirementsRemaining(selectedTopic)} completion requirement${requirementsRemaining(selectedTopic) === 1 ? '' : 's'} remaining.`}</p><button className="primary-button" onClick={() => startOrContinueTopic(selectedTopic)}>{selectedTopic.progression.status === 'available' ? 'Start Learning' : 'Continue Learning'} <ArrowRight size={14} /></button></>}
            <Link className="quiet-button" to="/tutor" state={{ topic: selectedTopic.name, difficulty: selectedTopic.level }}><BrainCircuit size={15} /> Ask AI Tutor</Link>
          </section>
          <section className="curriculum-section topic-objectives"><h4>1. Learning objectives</h4><ul>{selectedTopic.learningObjectives.map((objective) => <li key={objective}>{objective}</li>)}</ul></section>
          <section className="curriculum-section topic-lesson" id="topic-lesson"><h4>2. Lesson / concept explanation</h4>{selectedTopic.lessonSections.map((section, index) => <article className="topic-concept-card" key={section.title}><span className="topic-step-number">{index + 1}</span><div><h5>{section.title}</h5><p>{section.explanation}</p></div></article>)}<button className="quiet-button" disabled={selectedTopic.progression.lessonViewed} onClick={() => updateProgress(markLessonViewed(progress, selectedTopic.id))}>{selectedTopic.progression.lessonViewed ? 'Lesson viewed' : 'Mark lesson viewed'}</button></section>
          <section className="curriculum-section topic-example"><h4>3. Worked example</h4><article className="worked-example-card"><h5>{selectedTopic.workedExample.title}</h5><ol>{selectedTopic.workedExample.steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol><p className="curriculum-dry-run"><strong>Dry run:</strong> {selectedTopic.workedExample.dryRun}</p></article></section>
          <section className="curriculum-section topic-notes"><h4>4. Notes / key points</h4><ul>{selectedTopic.referenceNotes.map((note) => <li key={note}>{note}</li>)}</ul>{selectedTopic.referenceLinks.length > 0 && <div className="curriculum-links"><h5>Further reading</h5>{selectedTopic.referenceLinks.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label}<span>{link.kind}</span></a>)}</div>}</section>
          <section className="curriculum-section topic-practice"><h4>5. Practice assignments</h4><p>Work through the exercises; assignment completion is recorded after the evaluator confirms a passing solution.</p>{['beginner', 'intermediate', 'advanced'].map((difficulty) => {
            const assignments = selectedTopic.assignments.filter((assignment) => assignment.difficulty === difficulty)
            return <div className="topic-difficulty-group" key={difficulty}><h5><span className={`difficulty ${difficulty}`}>{difficulty}</span></h5>{assignments.length === 0 ? <p>No {difficulty} assignments are available for this topic yet.</p> : <ul>{assignments.map((assignment) => <li key={assignment.id}>{assignment.title} — {selectedTopic.progression.completedAssignmentIds.includes(assignment.id) ? 'completed' : 'not completed'}</li>)}</ul>}</div>
          })}<Link className="text-button" to="/practice">Open Practice assignments <ArrowRight size={14} /></Link></section>
          <section className="curriculum-section topic-quiz"><h4>6. Quiz</h4>{selectedTopic.quizzes.map((quiz) => <article className="curriculum-question" key={quiz.id}><h5>Check your understanding</h5>{quiz.questions.map((question, questionIndex) => <fieldset className="curriculum-quiz-question" key={`${quiz.id}-${questionIndex}`}><legend>{question.question}</legend>{question.options.map((option) => <label key={option}><input type="radio" name={`${quiz.id}-${questionIndex}`} value={option} checked={quizAnswers[quiz.id]?.[questionIndex] === option} onChange={() => setQuizAnswers((current) => ({ ...current, [quiz.id]: { ...current[quiz.id], [questionIndex]: option } }))} />{option}</label>)}</fieldset>)}<button className="quiet-button" onClick={() => submitQuiz(quiz)} disabled={quizStatus[quiz.id]?.loading || selectedTopic.progression.passedQuizIds.includes(quiz.id)}>{quizStatus[quiz.id]?.loading ? 'Checking...' : selectedTopic.progression.passedQuizIds.includes(quiz.id) ? 'Quiz passed' : 'Submit quiz'}</button>{quizStatus[quiz.id]?.message && <p role="status">{quizStatus[quiz.id].message}</p>}</article>)}</section>
          <section className="curriculum-section topic-tutor"><h4>7. Ask AI Tutor</h4><p>Ask a question about {selectedTopic.name} or request a simpler explanation or example.</p><Link className="primary-button" to="/tutor" state={{ topic: selectedTopic.name, difficulty: selectedTopic.level }}><BrainCircuit size={15} /> Ask AI Tutor <ArrowRight size={14} /></Link></section>
          </>}
        </article>}
      </section>
    </div>}
  </div>
}

function Practice() {
  const [curriculum, setCurriculum] = useState([])
  const [progress, setProgress] = useState(loadLearningProgress)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [filter, setFilter] = useState('All')
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('')
  const [shownHints, setShownHints] = useState(0)
  const [tutorHints, setTutorHints] = useState([])
  const [hintLoading, setHintLoading] = useState(false)
  const [hintError, setHintError] = useState('')
  const [starterByAssignmentId, setStarterByAssignmentId] = useState({})
  const [submissionSources, setSubmissionSources] = useState({})
  const [submissionLoadingId, setSubmissionLoadingId] = useState('')
  const [submissionResults, setSubmissionResults] = useState({})
  const [submissionErrors, setSubmissionErrors] = useState({})
  const [generatedProblem, setGeneratedProblem] = useState(null)
  const [generationError, setGenerationError] = useState('')
  const [generating, setGenerating] = useState(false)
  const problemRequestRef = useRef(false)
  const [shownGeneratedHints, setShownGeneratedHints] = useState(0)
  const filters = ['All', 'Beginner', 'Intermediate', 'Advanced']

  useEffect(() => {
    let active = true
    fetchCurriculum(loadLearningProgress())
      .then((topics) => {
        if (!active) return
        setCurriculum(topics)
        const firstAssignment = topics.find((topic) => topic.progression.unlocked && topic.assignments.length)?.assignments[0]
        setSelectedAssignmentId((currentId) => currentId || firstAssignment?.id || '')
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load assignments')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [reloadKey])

  useEffect(() => {
    if (!selectedAssignmentId) return undefined

    let active = true

    fetchSubmissionStarter(selectedAssignmentId)
      .then((submissionStarter) => {
        if (!active) return
        setStarterByAssignmentId((current) => ({ ...current, [selectedAssignmentId]: { data: submissionStarter } }))
        setSubmissionSources((current) => current[selectedAssignmentId] === undefined
          ? { ...current, [selectedAssignmentId]: submissionStarter.starterCode || '' }
          : current)
      })
      .catch((requestError) => {
        if (active) setStarterByAssignmentId((current) => ({
          ...current,
          [selectedAssignmentId]: { error: requestError.message || 'Could not load the Java starter code' },
        }))
      })

    return () => {
      active = false
    }
  }, [selectedAssignmentId])

  const assignments = curriculum
    .filter((topic) => topic.progression.unlocked)
    .flatMap((topic) => topic.assignments.map((assignment) => ({
      ...assignment,
      topicId: topic.id,
      topicName: topic.name,
      completed: topic.progression.completedAssignmentIds.includes(assignment.id),
    })))
  const visibleAssignments = assignments.filter((assignment) => (
    filter === 'All' || assignment.difficulty === filter.toLowerCase()
  ))
  const selectedAssignment = visibleAssignments.find((assignment) => assignment.id === selectedAssignmentId)
    || visibleAssignments[0]
  const starterEntry = starterByAssignmentId[selectedAssignmentId]
  const starter = starterEntry?.data || null
  const starterLoading = Boolean(selectedAssignmentId && !starterEntry)
  const starterError = starterEntry?.error || ''
  const submissionSource = submissionSources[selectedAssignmentId] || ''
  const submissionLoading = submissionLoadingId === selectedAssignmentId
  const submissionResult = submissionResults[selectedAssignmentId]
  const submissionError = submissionErrors[selectedAssignmentId] || ''
  const submissionSourceBytes = new TextEncoder().encode(submissionSource).length

  const selectAssignment = (assignment) => {
    setSelectedAssignmentId(assignment.id)
    setShownHints(0)
    setTutorHints([])
    setHintError('')
  }

  const requestTutorHint = async () => {
    if (!selectedAssignment || hintLoading) return

    setHintLoading(true)
    setHintError('')

    try {
      const result = await postHint({
        topic: selectedAssignment.topicName,
        difficulty: selectedAssignment.difficulty,
        assignmentId: selectedAssignment.id,
        hintStage: Math.min(3, shownHints + tutorHints.length + 1),
        conversationHistory: [
          ...selectedAssignment.hints.slice(0, shownHints).map((hint) => ({ role: 'assistant', content: hint })),
          ...tutorHints.map((hint) => ({ role: 'assistant', content: hint })),
        ],
      })
      setTutorHints((currentHints) => [...currentHints, result.hint])
    } catch (requestError) {
      setHintError(requestError.message || 'Could not get a hint')
    } finally {
      setHintLoading(false)
    }
  }

  const requestProblem = async () => {
    if (problemRequestRef.current) return
    problemRequestRef.current = true
    setGenerating(true)
    setGenerationError('')
    setShownGeneratedHints(0)
    try {
      setGeneratedProblem(await generateProblem({
        topic: selectedAssignment?.topicName || 'Arrays',
        difficulty: filter === 'Beginner' ? 'easy' : filter === 'Advanced' ? 'hard' : 'medium',
        userLevel: filter === 'Beginner' ? 'beginner' : filter === 'Advanced' ? 'advanced' : 'intermediate',
      }))
    } catch (error) {
      setGenerationError(error.message || 'Could not generate a practice problem')
    } finally {
      problemRequestRef.current = false
      setGenerating(false)
    }
  }

  const submitAssignment = async () => {
    if (!selectedAssignment || !starter?.evaluationAvailable || submissionLoading) return

    setSubmissionLoadingId(selectedAssignment.id)
    setSubmissionResults((current) => {
      const next = { ...current }
      delete next[selectedAssignment.id]
      return next
    })
    setSubmissionErrors((current) => {
      const next = { ...current }
      delete next[selectedAssignment.id]
      return next
    })
    try {
      const result = await submitJavaAssignment(selectedAssignment.id, submissionSource)
      setSubmissionResults((current) => ({ ...current, [selectedAssignment.id]: result }))
      const passedProgress = markAssignmentPassed(progress, selectedAssignment.id, result)
      if (passedProgress !== progress) {
        const nextProgress = saveLearningProgress(passedProgress)
        setProgress(nextProgress)
        setCurriculum(await fetchCurriculum(nextProgress))
      }
    } catch (requestError) {
      setSubmissionErrors((current) => ({
        ...current,
        [selectedAssignment.id]: requestError.message || 'Could not evaluate this Java submission',
      }))
    } finally {
      setSubmissionLoadingId('')
    }
  }

  return <div className="workspace-page page-enter">
    <PageHeader eyebrow="Practice" title="Assignments" description="Submit your Java solution for evaluation. An assignment is marked complete only after the evaluator confirms that it passed." action={<button className="quiet-button" onClick={requestProblem} disabled={generating}><Zap size={16} /> {generating ? 'Generating...' : 'Generate problem'}</button>} />
    {loading && <p className="curriculum-state" role="status">Loading assignments...</p>}
    {!loading && error && <div className="curriculum-state curriculum-error" role="alert"><p>{error}</p><button className="quiet-button" onClick={() => { setLoading(true); setError(''); setReloadKey((key) => key + 1) }}>Try again</button></div>}
    {!loading && !error && assignments.length === 0 && <p className="curriculum-state">No unlocked assignments are available yet. Complete the programming fundamentals topic to unlock the next topics.</p>}
    {!loading && !error && assignments.length > 0 && <>
      <div className="filter-row"><div className="segmented-control">{filters.map((item) => <button className={filter === item ? 'selected' : ''} key={item} onClick={() => { setFilter(item); setShownHints(0); setTutorHints([]); setHintError('') }}>{item}</button>)}</div><span className="muted">{visibleAssignments.length} assignments</span></div>
      {visibleAssignments.length === 0 && <p className="curriculum-state">No assignments are available at this difficulty.</p>}
      {selectedAssignment && <div className="practice-curriculum-layout">
        <nav className="practice-assignment-picker" aria-label="Practice assignments">{visibleAssignments.map((assignment) => <button className={`practice-assignment-option ${selectedAssignment.id === assignment.id ? 'selected' : ''}`} key={assignment.id} onClick={() => selectAssignment(assignment)}><small>{assignment.topicName} · {assignment.difficulty}</small><strong>{assignment.title}</strong></button>)}</nav>
        <article className="panel practice-assignment-detail">
          <header className="curriculum-lesson-header"><div><p className="eyebrow">{selectedAssignment.topicName} · {selectedAssignment.language}</p><h3>{selectedAssignment.title}</h3><span className={`difficulty ${selectedAssignment.difficulty}`}>{selectedAssignment.difficulty}</span></div></header>
          <section className="curriculum-section"><h4>Problem</h4><p>{selectedAssignment.description}</p>{selectedAssignment.completed && <p className="submission-completion" role="status">Evaluator-confirmed completion</p>}</section>
          <section className="curriculum-section"><h4>Learning objectives</h4><ul>{selectedAssignment.learningObjectives.map((objective) => <li key={objective}>{objective}</li>)}</ul></section>
          <section className="curriculum-section"><h4>Constraints</h4><ul>{selectedAssignment.constraints.map((constraint) => <li key={constraint}>{constraint}</li>)}</ul></section>
          <section className="curriculum-section"><h4>Examples</h4>{selectedAssignment.examples.map((example, index) => <div className="generated-example" key={`${index}-${example.input}`}><p><strong>Input:</strong> {example.input}</p><p><strong>Output:</strong> {example.output}</p><p>{example.explanation}</p></div>)}</section>
          <section className="curriculum-section"><h4>Edge cases to consider</h4><ul>{selectedAssignment.edgeCases.map((edgeCase) => <li key={edgeCase}>{edgeCase}</li>)}</ul></section>
          <section className="curriculum-section"><div className="practice-hint-heading"><h4>Hints</h4><span>{shownHints + tutorHints.length} used · up to 3 levels</span></div>{selectedAssignment.hints.slice(0, shownHints).map((hint, index) => <p className="practice-hint" key={`${index}-${hint}`}>Hint {index + 1}: {hint}</p>)}{tutorHints.map((hint, index) => <p className="practice-hint tutor" key={`tutor-${index}`}>Tutor hint {index + 1}: {hint}</p>)}{hintError && <p className="problem-error" role="alert">{hintError}</p>}<div className="practice-hint-actions"><button className="quiet-button" onClick={() => setShownHints((count) => Math.min(count + 1, selectedAssignment.hints.length))} disabled={shownHints >= selectedAssignment.hints.length || shownHints + tutorHints.length >= 3}>Show next hint</button><button className="quiet-button" onClick={requestTutorHint} disabled={hintLoading || shownHints + tutorHints.length >= 3}>{hintLoading ? 'Thinking...' : 'Get AI hint'}</button><Link className="quiet-button" to="/tutor" state={{ topic: selectedAssignment.topicName, difficulty: selectedAssignment.difficulty, assignmentId: selectedAssignment.id }}><BrainCircuit size={15} /> Ask AI Tutor about this problem</Link></div></section>
          <section className="curriculum-section"><h4>Java submission</h4>{starterLoading && <p className="muted" role="status">Loading starter code...</p>}{starterError && <p className="problem-error" role="alert">{starterError}</p>}{submissionError && <p className="problem-error" role="alert">{submissionError}</p>}{!starterLoading && starter && !starter.evaluationAvailable && <p className="muted" role="status">{starter.evaluationMessage || (starter.hasTests ? 'The isolated Java worker is unavailable. You can review the starter, but this server will not run your code.' : 'Automated evaluation is not available for this assignment yet.')}</p>}{starter?.starterCode && <><label className="submission-editor-label" htmlFor="java-submission">Java source <span>{submissionSourceBytes} / 24,000 bytes</span></label><textarea id="java-submission" className="java-submission-editor" value={submissionSource} maxLength={24000} spellCheck="false" onChange={(event) => { setSubmissionSources((current) => ({ ...current, [selectedAssignment.id]: event.target.value })); setSubmissionResults((current) => { const next = { ...current }; delete next[selectedAssignment.id]; return next }); setSubmissionErrors((current) => { const next = { ...current }; delete next[selectedAssignment.id]; return next }) }} aria-label="Java source code" /><button className="primary-button" onClick={submitAssignment} disabled={!starter.evaluationAvailable || submissionLoading || starterLoading || !submissionSource.trim() || submissionSourceBytes > 24000}>{submissionLoading ? 'Evaluating...' : starter.evaluationAvailable ? 'Submit / Evaluate' : 'Evaluation unavailable'}</button>{submissionLoading && <p className="muted" role="status">Running your solution against the assignment tests...</p>}</>}{submissionResult && <div className={`submission-result ${submissionResult.passed ? 'passed' : 'failed'}`} role="status"><strong>{submissionResult.passed ? 'Passed' : 'Failed'}</strong><p>{submissionResult.feedback}</p>{submissionResult.sampleTests && <p>Sample cases: {submissionResult.sampleTests.passed} / {submissionResult.sampleTests.total} passed</p>}{submissionResult.additionalTestsPassed !== undefined && <p>Additional checks: {submissionResult.additionalTestsPassed ? 'passed' : 'some failed'}</p>}{submissionResult.diagnostics?.map((diagnostic, index) => <p key={`${index}-${diagnostic.message}`}>{diagnostic.line ? `Line ${diagnostic.line}: ` : ''}{diagnostic.message}</p>)}</div>}</section>
        </article>
      </div>}
    </>}
    {generationError && <p className="problem-error" role="alert">{generationError}</p>}
    {generatedProblem && <section className="panel generated-problem" aria-live="polite"><div className="generated-problem-heading"><div><p className="eyebrow">{generatedProblem.fallback ? 'Local fallback' : 'Generated'} {generatedProblem.difficulty} problem · {generatedProblem.topic}</p><h3>{generatedProblem.title}</h3></div><button className="icon-button" aria-label="Generate another problem" onClick={requestProblem} disabled={generating}><Zap size={17} /></button></div><p className="generated-problem-description">{generatedProblem.description}</p><h4>Constraints</h4><ul>{generatedProblem.constraints.map((constraint, index) => <li key={`${index}-${constraint}`}>{constraint}</li>)}</ul><h4>Examples</h4>{generatedProblem.examples.map((example, index) => <div className="generated-example" key={`${index}-${example.input}`}><p><strong>Input:</strong> {example.input}</p><p><strong>Output:</strong> {example.output}</p><p>{example.explanation}</p></div>)}{shownGeneratedHints > 0 && <><h4>Hints</h4><ol>{generatedProblem.hints.slice(0, shownGeneratedHints).map((hint, index) => <li key={`${index}-${hint}`}>{hint}</li>)}</ol></>}{shownGeneratedHints < generatedProblem.hints.length && <button className="quiet-button" onClick={() => setShownGeneratedHints((count) => count + 1)}>Show next generated hint</button>}</section>}
  </div>
}

function Progress() {
  const [topics, setTopics] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCurriculum(loadLearningProgress()).then(setTopics).catch((requestError) => setError(requestError.message))
  }, [])

  const counts = topics.reduce((result, topic) => {
    result[topic.progression.status] += 1
    return result
  }, { locked: 0, available: 0, 'in-progress': 0, completed: 0 })
  const startedTopics = topics.filter((topic) => topic.progression.status === 'in-progress' || topic.progression.status === 'completed')

  return <div className="workspace-page page-enter">
    <PageHeader eyebrow="Your trajectory" title="Progress" description="Progress is based on lesson views, evaluator-confirmed assignment completion, and passed quizzes stored in this browser." />
    {error && <p className="curriculum-state problem-error" role="alert">{error}</p>}
    {!error && topics.length === 0 && <p className="curriculum-state" role="status">Loading progress...</p>}
    {topics.length > 0 && <>
      <section className="roadmap-summary">
        {Object.entries(counts).map(([status, count]) => <article className="summary-stat" key={status}><span className={`status-dot state-${status}`} /><div><strong>{count}</strong><span>{status.replace('-', ' ')}</span></div></article>)}
      </section>
      {startedTopics.length === 0
        ? <section className="curriculum-state"><h3>No topic progress yet</h3><p>Start with Programming Fundamentals. Nothing is marked complete until you record learner activity.</p><Link className="primary-button" to="/topics">Open topics <ArrowRight size={14} /></Link></section>
        : <ol className="roadmap-learning-list">{startedTopics.map((topic) => <li className={`roadmap-learning-item status-${topic.progression.status}`} key={topic.id}><div className="roadmap-learning-copy"><div className="curriculum-lesson-header"><div><h3>{topic.name}</h3></div><span className={`curriculum-status state-${topic.progression.status}`}>{topic.progression.status.replace('-', ' ')}</span></div><p>Lesson {topic.progression.lessonViewed ? 'viewed' : 'not viewed'} · {topic.progression.completedAssignmentIds.length} / {topic.completionRequirements.assignmentIds.length} assignments · {topic.progression.passedQuizIds.length} / {topic.completionRequirements.quizIds.length} quizzes</p></div></li>)}</ol>}
    </>}
  </div>
}

function Profile() {
  return <div className="workspace-page page-enter">
    <PageHeader eyebrow="Your workspace" title="Profile" description="Account details and learning preferences will be connected in a future authentication update." />
    <div className="profile-grid">
      <section className="panel profile-card">
        <div className="profile-identity">
          <div className="profile-avatar"><UserRound size={24} /></div>
          <div><h3>Account setup coming later</h3><p>No account is currently connected.</p><span className="status">Not connected</span></div>
        </div>
        <div className="profile-fields">
          <label>Display name<input disabled placeholder="Available after account setup" /></label>
          <label>Learning goal<select disabled defaultValue=""><option value="">Available after account setup</option></select></label>
        </div>
        <p className="profile-placeholder-note" role="status">Real profile details and saved preferences will appear here after authentication is configured.</p>
      </section>
      <section className="panel preferences">
        <div className="panel-heading"><div><p className="eyebrow">Preferences</p><h3>Learning setup</h3></div><Settings size={18} className="muted-icon" /></div>
        {[['Daily reminder', 'A short nudge keeps your streak alive.'], ['Hints before solutions', 'Protect the thinking time that matters.'], ['Weekly progress email', 'A Sunday snapshot of your momentum.']].map(([title, detail], index) => <label className="preference" key={title}><span><strong>{title}</strong><small>{detail}</small></span><input type="checkbox" defaultChecked={index < 2} /></label>)}
        <p className="profile-placeholder-note">Preference controls are previews and are not saved yet.</p>
      </section>
    </div>
  </div>
}

export default function WorkspacePages({ page }) {
  if (page === 'roadmap') return <Roadmap />
  if (page === 'topics') return <Topics />
  if (page === 'practice') return <Practice />
  if (page === 'progress') return <Progress />
  return <Profile />
}
