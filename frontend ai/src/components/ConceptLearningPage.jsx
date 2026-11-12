import { useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  Code2,
  Cpu,
  Eye,
  FileText,
  Layers,
  Lightbulb,
  Sparkles,
  Zap,
} from 'lucide-react'
import ConceptVisualizer from './ConceptVisualizer'

export default function ConceptLearningPage({ concept, onBack, onSelectConcept }) {
  const [activeTab, setActiveTab] = useState('all') // 'all', 'explanation', 'visualizer', 'code', 'review'

  if (!concept) return null

  return (
    <div className="concept-learning-page page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Navigation & Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #27272a', paddingBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onBack && (
            <button
              type="button"
              className="quiet-button"
              onClick={onBack}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '6px 10px' }}
            >
              <ArrowLeft size={15} /> Back to Concepts
            </button>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 600 }}>{concept.topicName}</span>
              <span style={{ color: '#3f3f46' }}>•</span>
              <span style={{ fontSize: '11px', background: '#1f1f23', padding: '2px 8px', borderRadius: '4px', color: '#a1a1aa' }}>
                {concept.level}
              </span>
            </div>
            <h2 style={{ margin: '4px 0 0', fontSize: '22px', color: '#fff' }}>{concept.name}</h2>
          </div>
        </div>

        {/* Tab Filters */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className={activeTab === 'all' ? 'primary-button' : 'quiet-button'}
            onClick={() => setActiveTab('all')}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            Full Guide
          </button>
          <button
            type="button"
            className={activeTab === 'visualizer' ? 'primary-button' : 'quiet-button'}
            onClick={() => setActiveTab('visualizer')}
            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Eye size={13} /> Visualizer
          </button>
          <button
            type="button"
            className={activeTab === 'code' ? 'primary-button' : 'quiet-button'}
            onClick={() => setActiveTab('code')}
            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Code2 size={13} /> Java Code
          </button>
        </div>
      </div>

      {/* 16. DEDICATED INTERACTIVE VISUALIZER (HIGH PRIORITY) */}
      {(activeTab === 'all' || activeTab === 'visualizer') && (
        <section>
          <ConceptVisualizer concept={concept} />
        </section>
      )}

      {/* CONTENT SECTIONS: 1 to 15 */}
      {(activeTab === 'all' || activeTab === 'explanation') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. Introduction & 2. Definition */}
          <div className="panel" style={{ background: '#121214', border: '1px solid #27272a', borderRadius: '10px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                1. Overview & Definition
              </span>
            </div>
            <h3 style={{ margin: '0 0 10px', fontSize: '17px', color: '#fff' }}>Introduction</h3>
            <p style={{ margin: '0 0 16px', fontSize: '15px', color: '#e4e4e7', lineHeight: '1.6' }}>
              {concept.intro}
            </p>
            <div style={{ background: '#18181b', borderLeft: '4px solid #fbbf24', borderRadius: '0 6px 6px 0', padding: '12px 16px' }}>
              <strong style={{ fontSize: '13px', color: '#fbbf24' }}>Formal Definition: </strong>
              <span style={{ fontSize: '14px', color: '#f4f4f5' }}>{concept.definition}</span>
            </div>
          </div>

          {/* 3. Why Important & 4. Real-world Applications */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div className="panel" style={{ background: '#121214', border: '1px solid #27272a', borderRadius: '10px', padding: '18px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '15px', color: '#86efac', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} /> Why This Concept Is Important
              </h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#d4d4d8', lineHeight: '1.6' }}>
                {concept.importance}
              </p>
            </div>

            <div className="panel" style={{ background: '#121214', border: '1px solid #27272a', borderRadius: '10px', padding: '18px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '15px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} /> Real-World Applications
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#d4d4d8', lineHeight: '1.6' }}>
                {concept.realWorldApplications?.map((app, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{app}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 5. Prerequisites & 6. Detailed Explanation */}
          <div className="panel" style={{ background: '#121214', border: '1px solid #27272a', borderRadius: '10px', padding: '20px' }}>
            {concept.prerequisites && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Prerequisites: </span>
                {concept.prerequisites.map((p, idx) => (
                  <span key={idx} style={{ fontSize: '11px', background: '#27272a', color: '#e4e4e7', padding: '2px 8px', borderRadius: '4px' }}>
                    {p}
                  </span>
                ))}
              </div>
            )}

            <h3 style={{ margin: '0 0 12px', fontSize: '17px', color: '#fff' }}>Detailed Deep Dive</h3>
            <div style={{ fontSize: '14px', color: '#e4e4e7', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
              {concept.detailedExplanation}
            </div>
          </div>
        </div>
      )}

      {/* 7. Java Implementation & 8. Line-by-Line Explanation */}
      {(activeTab === 'all' || activeTab === 'code') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="panel" style={{ background: '#121214', border: '1px solid #27272a', borderRadius: '10px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Code2 size={16} /> 7. Java Implementation
              </h3>
              <span style={{ fontSize: '11px', background: '#27272a', padding: '2px 8px', borderRadius: '4px', color: '#86efac' }}>
                Java 17 OpenJDK
              </span>
            </div>

            <pre
              style={{
                background: '#09090b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                padding: '16px',
                color: '#f4f4f5',
                fontFamily: '"DM Mono", monospace',
                fontSize: '13px',
                lineHeight: '1.6',
                overflowX: 'auto',
                margin: 0,
              }}
            >
              <code>{concept.javaImplementation}</code>
            </pre>
          </div>

          {/* 8. Line-by-line explanation */}
          {concept.lineByLineExplanation && concept.lineByLineExplanation.length > 0 && (
            <div className="panel" style={{ background: '#121214', border: '1px solid #27272a', borderRadius: '10px', padding: '20px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '15px', color: '#38bdf8' }}>
                8. Line-by-Line Code Breakdown
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {concept.lineByLineExplanation.map((explanation, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#d4d4d8', lineHeight: '1.5' }}>
                    <span style={{ color: '#fbbf24', fontWeight: 700 }}>•</span>
                    <span>{explanation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. Step-by-step Dry Run */}
          {concept.dryRun && (
            <div className="panel" style={{ background: '#121214', border: '1px solid #27272a', borderRadius: '10px', padding: '18px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '15px', color: '#86efac', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={16} /> 9. Step-by-Step Dry Run
              </h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#e4e4e7', fontFamily: 'monospace', lineHeight: '1.6' }}>
                {concept.dryRun}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 10. Complexity, 11. Mistakes, 12. Examples, 13. Revision Notes */}
      {(activeTab === 'all' || activeTab === 'explanation') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Complexity Box */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div className="panel" style={{ background: '#121214', border: '1px solid #27272a', borderRadius: '8px', padding: '16px' }}>
              <span style={{ fontSize: '12px', color: '#a1a1aa' }}>10. Time Complexity</span>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#fbbf24', fontWeight: 600 }}>
                {concept.timeComplexity}
              </p>
            </div>
            <div className="panel" style={{ background: '#121214', border: '1px solid #27272a', borderRadius: '8px', padding: '16px' }}>
              <span style={{ fontSize: '12px', color: '#a1a1aa' }}>11. Space Complexity</span>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#38bdf8', fontWeight: 600 }}>
                {concept.spaceComplexity}
              </p>
            </div>
          </div>

          {/* 12. Common Mistakes */}
          {concept.commonMistakes && concept.commonMistakes.length > 0 && (
            <div className="panel" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '18px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '15px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} /> 12. Common Traps & Mistakes to Avoid
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#fca5a5', lineHeight: '1.6' }}>
                {concept.commonMistakes.map((mistake, idx) => (
                  <li key={idx}>{mistake}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 13. Multiple Examples */}
          {concept.examples && (
            <div className="panel" style={{ background: '#121214', border: '1px solid #27272a', borderRadius: '10px', padding: '18px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '15px', color: '#fff' }}>
                13. Worked Examples
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {concept.examples.map((ex, idx) => (
                  <div key={idx} style={{ background: '#18181b', borderRadius: '6px', padding: '10px 14px' }}>
                    <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>
                      <span style={{ color: '#a1a1aa' }}>Input: </span><span style={{ color: '#fff' }}>{ex.input}</span>
                      <span style={{ color: '#a1a1aa', margin: '0 8px' }}>→</span>
                      <span style={{ color: '#a1a1aa' }}>Output: </span><span style={{ color: '#86efac' }}>{ex.output}</span>
                    </div>
                    {ex.explanation && (
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#a1a1aa' }}>{ex.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 14. Practice Questions & 15. Quick Revision Notes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div className="panel" style={{ background: '#121214', border: '1px solid #27272a', borderRadius: '10px', padding: '18px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#fbbf24' }}>14. Practice Challenge</h4>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#d4d4d8', lineHeight: '1.6' }}>
                {concept.practiceQuestions?.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>

            <div className="panel" style={{ background: '#121214', border: '1px solid #27272a', borderRadius: '10px', padding: '18px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#86efac' }}>15. Quick Revision Notes</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#e4e4e7', lineHeight: '1.6' }}>
                {concept.revisionNotes}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
