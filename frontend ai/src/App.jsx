import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import AuthPage from './pages/AuthPage'
import Tutor from './pages/Tutor'
import WorkspacePages from './pages/WorkspacePages'
import JavaDocumentation from './pages/JavaDocumentation'
import AlgorithmVisualizer from './pages/AlgorithmVisualizer'

function App() {
  return <BrowserRouter><Layout><Routes><Route path="/" element={<Dashboard />} /><Route path="/tutor" element={<Tutor />} /><Route path="/roadmap" element={<WorkspacePages page="roadmap" />} /><Route path="/topics" element={<WorkspacePages page="topics" />} /><Route path="/topics/:topicId" element={<WorkspacePages page="topics" />} /><Route path="/notes" element={<WorkspacePages page="notes" />} /><Route path="/visualizer" element={<AlgorithmVisualizer />} /><Route path="/practice" element={<WorkspacePages page="practice" />} /><Route path="/progress" element={<WorkspacePages page="progress" />} /><Route path="/profile" element={<WorkspacePages page="profile" />} /><Route path="/java-docs" element={<JavaDocumentation />} /><Route path="/login" element={<AuthPage key="login" mode="login" />} /><Route path="/signup" element={<AuthPage key="signup" mode="signup" />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></Layout></BrowserRouter>
}

export default App
