import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import SetupWizard from './pages/SetupWizard'
import TrainingConfig from './pages/TrainingConfig'
import LabelTool from './pages/LabelTool'
import Dashboard from './pages/Dashboard'
import Sessions from './pages/Sessions'
import SessionDetail from './pages/SessionDetail'
import Intervention from './pages/Intervention'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/setup" element={<SetupWizard />} />
                <Route path="/training-config" element={<TrainingConfig />} />
                <Route path="/label-tool" element={<LabelTool />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/sessions" element={<Sessions />} />
                <Route path="/dashboard/sessions/:id" element={<SessionDetail />} />
                <Route path="/dashboard/intervention" element={<Intervention />} />
                {/* Redirect old routes to unified wizard */}
                <Route path="/train-or-label" element={<Navigate to="/setup" replace />} />
                <Route path="/add-image-folder" element={<Navigate to="/setup" replace />} />
                <Route path="/add-new-model" element={<Navigate to="/setup" replace />} />
                <Route path="/model-type" element={<Navigate to="/setup" replace />} />
                <Route path="/model-name" element={<Navigate to="/setup" replace />} />
                <Route path="/class-selection" element={<Navigate to="/setup" replace />} />
            </Routes>
        </Router>
    )
}

export default App
