import { ArrowRight, BookOpen, BrainCircuit } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  return <div className="dashboard page-enter">
    <section className="welcome-row"><div><p className="eyebrow accent-eyebrow">DSA curriculum</p><h2>Choose your next lesson.</h2><p className="muted">Browse authored lessons and see which topics are still being prepared.</p></div><Link className="primary-button" to="/topics"><BookOpen size={16} /> Browse topics <ArrowRight size={15} /></Link></section>
    <section className="focus-grid">
      <article className="focus-card"><div className="focus-glow" /><div className="focus-content"><div className="section-kicker"><BookOpen size={15} /> Published curriculum</div><h3>Learn one concept at a time.</h3><p className="focus-lesson">Lessons include explanations, worked examples, reference notes, assignments, and knowledge checks.</p><Link className="primary-button" to="/topics">Open topics <ArrowRight size={15} /></Link></div></article>
      <article className="recommendation"><div className="recommendation-icon"><BrainCircuit size={20} /></div><div><p className="eyebrow">Learning activity</p><h3>Progress saved in this browser</h3><p>Topics unlock through prerequisites. Completion requires viewing the lesson, marking each assignment complete, and passing its knowledge check.</p></div></article>
    </section>
  </div>
}
