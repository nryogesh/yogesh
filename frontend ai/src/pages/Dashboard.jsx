import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, BookOpen, BrainCircuit, CheckCircle2, Flame, Target, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { fetchCurriculum } from '../services/api'
import { loadLearningProgress } from '../services/learning-progress'
import { summarizeLearning } from '../services/learning-summary'
import { loadLearnerProfile, subscribeToLearnerProfile } from '../services/learner-profile'
import './LearningExperience.css'

function activityDescription(activity, topics) {
  const topic = topics.find((item) => item.id === activity.id ||
    item.assignments?.some((assignment) => assignment.id === activity.id) ||
    item.quizzes?.some((quiz) => quiz.id === activity.id))
  const assignment = topic?.assignments?.find((item) => item.id === activity.id)
  const subject = assignment?.title || topic?.name || activity.id

  if (activity.type === 'lesson-viewed') return `Started the ${subject} lesson`
  if (activity.type === 'quiz-passed') return `Passed the ${subject} knowledge check`
  if (activity.type === 'assignment-passed') return `Passed ${subject}`
  return `Submitted ${subject}; the evaluator reported it did not pass`
}

function formatActivityDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export default function Dashboard() {
  const [topics, setTopics] = useState([])
  const [progress] = useState(loadLearningProgress)
  const [profile, setProfile] = useState(loadLearnerProfile)
  const [error, setError] = useState('')
  const summary = useMemo(() => summarizeLearning(topics, progress), [topics, progress])

  useEffect(() => subscribeToLearnerProfile(() => setProfile(loadLearnerProfile())), [])

  useEffect(() => {
    let active = true
    fetchCurriculum(progress)
      .then((curriculum) => {
        if (active) {
          setTopics(curriculum)
          setError('')
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load your learning dashboard.')
      })

    return () => {
      active = false
    }
  }, [progress])

  const nextTopic = summary.nextTopic
  const totalTopics = summary.publishedTopics

  return <div className="dashboard page-enter">
    <section className="welcome-row">
      <div><p className="eyebrow accent-eyebrow">DSA curriculum</p><h2>Welcome, {profile?.displayName || 'learner'}.</h2><p className="muted">{profile?.learningGoal || 'Build your Java DSA skills one topic at a time.'}</p></div>
      <Link className="primary-button" to={nextTopic ? `/topics/${nextTopic.id}` : '/topics'}><BookOpen size={16} /> {nextTopic ? `Continue ${nextTopic.name}` : 'Browse topics'} <ArrowRight size={15} /></Link>
    </section>

    {error && <p className="curriculum-state problem-error" role="alert">{error}</p>}
    <section className="stats-grid" aria-label="Learning statistics">
      <article className="stat-card"><div className="stat-icon orange"><Target size={17} /></div><div><p>Topics completed</p><strong>{summary.completedTopics}<small> / {totalTopics || '—'}</small></strong><span>{summary.completionPercent}% of published topics</span></div></article>
      <article className="stat-card"><div className="stat-icon blue"><BookOpen size={17} /></div><div><p>In progress</p><strong>{summary.inProgressTopics}</strong><span>Started topics</span></div></article>
      <article className="stat-card"><div className="stat-icon green"><Trophy size={17} /></div><div><p>Problems solved</p><strong>{summary.problemsSolved}</strong><span>{summary.assignmentAttempts} evaluated attempts</span></div></article>
      <article className="stat-card"><div className="stat-icon violet"><Flame size={17} /></div><div><p>Accuracy · learning streak</p><strong>{summary.accuracy === null ? '—' : `${summary.accuracy}%`}<small> · {summary.streak} day{summary.streak === 1 ? '' : 's'}</small></strong><span>{summary.accuracy === null ? 'Available after an evaluated submission' : 'Based on evaluated assignments'}</span></div></article>
    </section>

    <section className="focus-grid dashboard-focus-grid">
      <article className="focus-card"><div className="focus-content"><div className="section-kicker"><BookOpen size={15} /> Learning roadmap</div><h3>{nextTopic ? `Up next: ${nextTopic.name}` : 'Your roadmap'}</h3><p className="focus-lesson">{nextTopic?.description || 'Explore the published Java DSA curriculum and continue where you left off.'}</p><div className="dashboard-progress-track" aria-label={`${summary.completionPercent}% topic completion`}><span style={{ width: `${summary.completionPercent}%` }} /></div><p className="muted">{summary.completedTopics} of {totalTopics} published topics completed</p><Link className="primary-button" to={nextTopic ? `/topics/${nextTopic.id}` : '/roadmap'}>{nextTopic ? 'Open recommended topic' : 'View roadmap'} <ArrowRight size={15} /></Link></div></article>
      <article className="recommendation"><div className="recommendation-icon"><BrainCircuit size={20} /></div><div><p className="eyebrow">Keep learning</p><h3>Learn, practice, review</h3><p>Your progress is calculated from lessons you mark viewed, passed knowledge checks, and assignments verified by the evaluator. No activity is pre-filled.</p><Link className="text-button" to="/practice">Open assignments <ArrowRight size={14} /></Link></div></article>
    </section>

    <section className="panel dashboard-activity">
      <div className="panel-heading"><div><p className="eyebrow">Your activity</p><h3>Recent learning</h3></div><Link className="text-button" to="/progress">Progress details <ArrowRight size={14} /></Link></div>
      {summary.recentActivity.length === 0
        ? <div className="dashboard-empty"><CheckCircle2 size={18} /><p>No learning activity recorded yet. Start a topic to see your progress here.</p><Link className="text-button" to="/topics">Browse topics <ArrowRight size={14} /></Link></div>
        : <ol className="dashboard-activity-list">{summary.recentActivity.map((activity, index) => <li key={`${activity.type}-${activity.id}-${activity.at}-${index}`}><span className={`activity-marker activity-${activity.type}`} /><div><strong>{activityDescription(activity, topics)}</strong><time dateTime={activity.at}>{formatActivityDate(activity.at)}</time></div></li>)}</ol>}
    </section>
  </div>
}
