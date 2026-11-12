import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowUpRight, BookOpen, BrainCircuit, CircleHelp, Code2, Lightbulb, Send, Sparkles, UserRound } from 'lucide-react'
import './Tutor.css'
import { initialMessages } from '../data/chat'
import { checkHealth, generateProblem, postChat, postHint } from '../services/api'
import { parseTutorMessage } from '../services/tutor-message-format'
import { appendTutorMessage, createTutorSubmissionGate } from '../services/tutor-submission'

const actions = [{ label: 'Get a hint', icon: Lightbulb }, { label: 'Explain simpler', icon: Sparkles }, { label: 'Give an example', icon: BookOpen }, { label: 'Practice problem', icon: Code2 }]
let nextMessageId = 10

function getActionPrompt(label, topic) {
  switch (label) {
    case 'Get a hint':
      return `Give me a single, progressive hint for ${topic} without revealing the final solution.`
    case 'Explain simpler':
      return `Explain ${topic} in simpler terms for a beginner. Focus on the core idea, not the code.`
    case 'Give an example':
      return `Give me a small concrete example of ${topic} and walk through it step by step.`
    case 'Practice problem':
      return `Create a quick ${topic} practice question for me to try, and give me one hint that helps without solving it.`
    default:
      return label
  }
}

function formatProblemMessage(problem) {
  const firstExample = problem.examples?.[0]
  const lines = [
    problem.fallback ? 'Local fallback problem (AI generation unavailable)' : '',
    `Practice problem: ${problem.title}`,
    '',
    problem.description,
    '',
    'Constraints:',
    ...(problem.constraints || []).map((constraint) => `- ${constraint}`),
    '',
    'Example:',
    `Input: ${firstExample?.input || 'N/A'}`,
    `Output: ${firstExample?.output || 'N/A'}`,
    firstExample?.explanation ? `Why: ${firstExample.explanation}` : '',
    '',
    'Hints:',
    ...(problem.hints || []).map((hint, index) => `${index + 1}. ${hint}`),
  ]

  return lines.filter((line) => line !== '').join('\n')
}

function Message({ message }) {
  const formattedBlocks = message.role === 'assistant' ? parseTutorMessage(message.content) : null
  const renderParts = (parts, keyPrefix) => parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`
    if (part.type === 'inline-code') return <code key={key}>{part.text}</code>
    if (part.type === 'bold') return <strong key={key}>{part.text}</strong>
    if (part.type === 'italic') return <em key={key}>{part.text}</em>
    return <span key={key}>{part.text}</span>
  })
  const renderFormattedMessage = () => formattedBlocks.map((block, index) => {
    const key = `block-${index}`
    if (block.type === 'code') return <pre key={key}><code>{block.text}</code></pre>
    if (block.type === 'heading') {
      const Heading = `h${block.level + 2}`
      return <Heading key={key}>{renderParts(block.parts, key)}</Heading>
    }
    if (block.type === 'unordered-list' || block.type === 'ordered-list') {
      const List = block.type === 'unordered-list' ? 'ul' : 'ol'
      return <List key={key}>{block.items.map((parts, itemIndex) => <li key={`${key}-${itemIndex}`}>{renderParts(parts, `${key}-${itemIndex}`)}</li>)}</List>
    }
    return <p key={key}>{block.lines.map((parts, lineIndex) => <span key={`${key}-${lineIndex}`}>{lineIndex > 0 && <br />}{renderParts(parts, `${key}-${lineIndex}`)}</span>)}</p>
  })

  return <div className={`message-row ${message.role}`}><div className={`message-avatar ${message.role}`}>{message.role === 'assistant' ? <BrainCircuit size={16} /> : <UserRound size={15} />}</div><div className="message-content"><div className="message-meta"><strong className={message.fallback ? 'fallback-label' : ''}>{message.fallback ? 'General guidance (AI unavailable)' : message.role === 'assistant' ? 'Mentor AI' : 'You'}</strong><span>{message.role === 'assistant' ? 'Just now' : '2 min ago'}</span></div>{message.role === 'assistant' ? <div className="tutor-formatted">{renderFormattedMessage()}</div> : <p className="user-message-text">{message.content}</p>}{message.detail && <p className="message-detail">{message.detail}</p>}{message.code && <pre><code>{message.code}</code></pre>}{message.question && <div className="question-callout"><CircleHelp size={16} /><span>{message.question}</span></div>}</div></div>
}

export default function Tutor() {
  const location = useLocation()
  const selectedTopic = location.state?.topic || 'Binary Search'
  const selectedDifficulty = location.state?.difficulty || 'beginner'
  const assignmentId = location.state?.assignmentId
  const hasTopicContext = Boolean(location.state?.topic)
  const [messagesByTopic, setMessagesByTopic] = useState(() => ({
    [selectedTopic]: hasTopicContext ? [] : initialMessages,
  }))

  const messages = messagesByTopic[selectedTopic] || []
  const setMessages = (update) => setMessagesByTopic((current) => ({
    ...current,
    [selectedTopic]: typeof update === 'function'
      ? update(current[selectedTopic] || [])
      : update,
  }))
  const [input, setInput] = useState('')
  const inputRef = useRef('')
  const problemRequestRef = useRef(false)
  const [submissionGate] = useState(createTutorSubmissionGate)
  const [typing, setTyping] = useState(false)
  const [providerState, setProviderState] = useState('checking')
  const [providerLabel, setProviderLabel] = useState('Checking AI provider...')

  useEffect(() => {
    let active = true
    checkHealth()
      .then(({ available, configured, mode, label, provider }) => {
        if (!active) return

        if (mode === 'fallback') {
          setProviderState('fallback')
          setProviderLabel(label || 'Fallback mode active')
          return
        }

        if (configured ?? available) {
          setProviderState('configured')
          setProviderLabel(label || `${provider || 'Mentor'} configured; live generation not verified`)
          return
        }

        setProviderState('unavailable')
        setProviderLabel(label || 'AI provider unavailable')
      })
      .catch(() => {
        if (active) {
          setProviderState('unavailable')
          setProviderLabel('AI provider unavailable')
        }
      })

    return () => {
      active = false
    }
  }, [])

  const sendMessage = async (content) => {
    const submittedMessage = submissionGate.capture(content)
    if (submittedMessage === null) return

    const userMessage = { id: nextMessageId++, role: 'user', content: submittedMessage }
    const history = [...messages, userMessage].map(({ role, content: messageContent }) => ({ role, content: messageContent }))
    setMessages((current) => appendTutorMessage(current, userMessage))
    inputRef.current = ''
    setInput('')
    setTyping(true)

    try {
      const response = await postChat(submittedMessage, {
        topic: selectedTopic,
        difficulty: selectedDifficulty,
        language: 'Java',
        userLevel: selectedDifficulty,
        assignmentId,
        conversationHistory: history,
      })

      setMessages((current) => appendTutorMessage(current, { id: nextMessageId++, role: 'assistant', content: response.response, fallback: response.fallback === true }))
    } catch (error) {
      setMessages((current) => appendTutorMessage(current, { id: nextMessageId++, role: 'assistant', content: error.message || 'The mentor is unavailable right now. Please try again.' }))
    } finally {
      submissionGate.release()
      setTyping(false)
    }
  }

  const requestHint = async () => {
    if (typing) return

    const history = messages.map(({ role, content }) => ({ role, content }))
    setTyping(true)
    try {
      const result = await postHint({
        topic: selectedTopic,
        difficulty: selectedDifficulty,
        assignmentId,
        hintStage: Math.min(3, messages.filter((message) => message.role === 'assistant').length + 1),
        conversationHistory: history,
      })
      setMessages((current) => appendTutorMessage(current, {
        id: nextMessageId++,
        role: 'assistant',
        content: result.hint,
        fallback: result.fallback === true,
      }))
    } catch (error) {
      setMessages((current) => appendTutorMessage(current, { id: nextMessageId++, role: 'assistant', content: error.message || 'The mentor could not provide a hint.' }))
    } finally {
      setTyping(false)
    }
  }

  const requestPracticeProblem = async () => {
    if (typing || problemRequestRef.current) return

    problemRequestRef.current = true
    setTyping(true)
    try {
      const problem = await generateProblem({
        topic: selectedTopic,
        difficulty: 'medium',
        userLevel: selectedDifficulty,
      })

      setMessages((current) => appendTutorMessage(current, {
        id: nextMessageId++,
        role: 'assistant',
        content: formatProblemMessage(problem),
      }))
    } catch (error) {
      setMessages((current) => appendTutorMessage(current, {
        id: nextMessageId++,
        role: 'assistant',
        content: error.message || 'The mentor could not generate a practice problem right now.',
      }))
    } finally {
      problemRequestRef.current = false
      setTyping(false)
    }
  }

  const handleQuickAction = (label) => {
    if (label === 'Get a hint') {
      requestHint()
      return
    }

    if (label === 'Practice problem') {
      requestPracticeProblem()
      return
    }

    sendMessage(getActionPrompt(label, selectedTopic))
  }

  return <div className="tutor-page page-enter"><section className="tutor-intro"><div><p className="eyebrow accent-eyebrow"><span className="live-dot" /> Your personal mentor</p><h2>Think it through together.</h2><p className="muted">Ask questions, test your understanding, and get unstuck without skipping the learning.</p></div><div className="tutor-status" role="status" aria-live="polite"><span className="status-online" style={{ backgroundColor: providerState === 'ready' ? 'var(--accent)' : providerState === 'fallback' ? '#f7b267' : providerState === 'checking' || providerState === 'configured' ? 'var(--muted)' : '#e27668' }} />{providerState === 'checking' ? 'Checking AI provider...' : providerLabel}</div></section><div className="tutor-layout"><section className="chat-panel panel"><div className="chat-heading"><div className="mentor-identity"><div className="mentor-avatar"><BrainCircuit size={21} /></div><div><strong>DSA Mentor</strong><span>Guiding your {selectedTopic} session</span></div></div><button className="icon-button" aria-label="More tutor options"><ArrowUpRight size={18} /></button></div><div className="messages" aria-live="polite">{messages.map((message) => <Message key={message.id} message={message} />)}{typing && <div className="typing"><span /><span /><span /> Mentor is thinking</div>}</div>    <div className="chat-composer"><div className="quick-actions">{actions.map(({ label, icon: Icon }) => <button key={label} onClick={() => handleQuickAction(label)} disabled={typing}><Icon size={14} />{label}</button>)}</div><div className="input-wrap"><textarea value={input} onChange={(event) => { inputRef.current = event.target.value; setInput(event.target.value) }} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); sendMessage(inputRef.current) } }} placeholder={`Ask your DSA mentor about ${selectedTopic}...`} aria-label="Ask your DSA mentor anything" rows="1" /><button className="send-button" onClick={() => sendMessage(inputRef.current)} disabled={!input.trim() || typing} aria-label="Send message"><Send size={17} /></button></div><div className="composer-note">Press Enter to send <span>·</span> Shift + Enter for a new line</div></div></section><aside className="context-panel"><div className="context-header"><div><p className="eyebrow">Learning context</p><h3>Current lesson</h3></div></div><div className="context-focus"><div className="context-focus-top"><span>Topic</span><Code2 size={17} /></div><strong>{selectedTopic}</strong><span>{selectedDifficulty} level</span></div><div className="context-block"><p>Use the chat to ask a question, request a simpler explanation, or work through an example for this topic.</p></div></aside></div></div>
}
