import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, Search } from 'lucide-react'
import { javaDocumentation, javaDocumentationCategories } from '../data/java-documentation'
import './JavaDocumentation.css'

export default function JavaDocumentation() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const requestedId = searchParams.get('topic')
  const currentIndex = javaDocumentation.findIndex((topic) => topic.id === requestedId)
  const activeIndex = currentIndex >= 0 ? currentIndex : 0
  const current = javaDocumentation[activeIndex]
  const normalizedQuery = query.trim().toLowerCase()
  const filteredTopics = useMemo(() => {
    if (!normalizedQuery) return javaDocumentation
    return javaDocumentation.filter((topic) => (
      `${topic.title} ${topic.keywords} ${topic.summary} ${topic.category}`.toLowerCase().includes(normalizedQuery)
    ))
  }, [normalizedQuery])

  const selectTopic = (id) => {
    const next = new URLSearchParams(searchParams)
    next.set('topic', id)
    next.delete('q')
    setSearchParams(next)
  }

  const searchTopics = (value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('q', value)
    else next.delete('q')
    setSearchParams(next, { replace: true })
  }

  const moveTopic = (index) => {
    if (index >= 0 && index < javaDocumentation.length) selectTopic(javaDocumentation[index].id)
  }

  return (
    <div className="java-docs-page page-enter">
      <header className="java-docs-intro">
        <div>
          <p className="eyebrow accent-eyebrow">Reference library</p>
          <h2>Java Documentation</h2>
          <p className="muted">A practical, beginner-friendly guide to Java, from first programs to common data structures and algorithms.</p>
        </div>
        <div className="java-docs-attribution">
          <BookOpen size={16} />
          <span>Application-authored explanations</span>
        </div>
      </header>

      <div className="java-docs-layout">
        <aside className="java-docs-sidebar" aria-label="Java documentation topics">
          <label className="java-docs-search">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => searchTopics(event.target.value)}
              placeholder="Search Java topics"
              aria-label="Search Java documentation topics"
            />
          </label>
          <nav className="java-docs-topic-nav" aria-label="Documentation sections">
            {javaDocumentationCategories.map((category) => {
              const topics = filteredTopics.filter((topic) => topic.category === category)
              if (normalizedQuery && topics.length === 0) return null
              return (
                <details
                  className="java-docs-category"
                  key={category}
                  open={Boolean(normalizedQuery) || current.category === category}
                >
                  <summary>{category}<span>{topics.length}</span></summary>
                  <ul>
                    {topics.map((topic) => (
                      <li key={topic.id}>
                        <button
                          type="button"
                          className={`java-docs-topic-link ${current.id === topic.id ? 'active' : ''}`}
                          aria-current={current.id === topic.id ? 'page' : undefined}
                          onClick={() => selectTopic(topic.id)}
                        >
                          {topic.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </details>
              )
            })}
            {filteredTopics.length === 0 && <p className="java-docs-no-results">No topics match that search.</p>}
          </nav>
        </aside>

        <article className="java-docs-reading" aria-labelledby="java-docs-title">
          <nav className="java-docs-breadcrumbs" aria-label="Breadcrumb">
            <span>Java Documentation</span>
            <span aria-hidden="true">/</span>
            <span>{current.category}</span>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{current.title}</span>
          </nav>

          <div className="java-docs-copy">
            <p className="eyebrow accent-eyebrow">{current.category}</p>
            <h2 id="java-docs-title">{current.title}</h2>
            <p className="java-docs-summary">{current.summary}</p>

            <section className="java-docs-section">
              <h3>Syntax and example</h3>
              <p>Here is a small Java example to illustrate the idea:</p>
              <pre className="java-docs-code"><code>{current.example}</code></pre>
              <div className="java-docs-output"><strong>Expected result</strong><code>{current.output}</code></div>
            </section>

            <section className="java-docs-section">
              <h3>Common mistake</h3>
              <p>{current.mistake}</p>
            </section>

            <section className="java-docs-section">
              <h3>When it is useful</h3>
              <p>{current.useCase}</p>
            </section>

            {current.complexity && (
              <section className="java-docs-section java-docs-complexity">
                <h3>Complexity</h3>
                <p>{current.complexity}</p>
              </section>
            )}

            <aside className="java-docs-source">
              <div>
                <strong>About this guide</strong>
                <p>These explanations are written for this application. They are not exhaustive and are not maintained by Oracle.</p>
              </div>
              <a href="https://docs.oracle.com/en/java/" target="_blank" rel="noreferrer">
                Official Java documentation <ExternalLink size={14} />
              </a>
            </aside>
          </div>

          <nav className="java-docs-pagination" aria-label="Documentation page navigation">
            <button
              type="button"
              className="quiet-button"
              disabled={activeIndex === 0}
              onClick={() => moveTopic(activeIndex - 1)}
            >
              <ArrowLeft size={15} />
              <span><small>Previous</small>{activeIndex > 0 ? javaDocumentation[activeIndex - 1].title : 'First topic'}</span>
            </button>
            <button
              type="button"
              className="quiet-button next"
              disabled={activeIndex === javaDocumentation.length - 1}
              onClick={() => moveTopic(activeIndex + 1)}
            >
              <span><small>Next</small>{activeIndex < javaDocumentation.length - 1 ? javaDocumentation[activeIndex + 1].title : 'Last topic'}</span>
              <ArrowRight size={15} />
            </button>
          </nav>
        </article>
      </div>
    </div>
  )
}
