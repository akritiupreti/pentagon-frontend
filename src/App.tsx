import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import TrainOrLabel from './pages/TrainOrLabel'
import ModelType from './pages/ModelType'
import ModelName from './pages/ModelName'
import ClassSelection from './pages/ClassSelection'
import TrainingConfig from './pages/TrainingConfig'
import AddNewModel from './pages/AddNewModel'
import AddImageFolder from './pages/AddImageFolder'
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
                <Route path="/train-or-label" element={<TrainOrLabel />} />
                <Route path="/model-type" element={<ModelType />} />
                <Route path="/model-name" element={<ModelName />} />
                <Route path="/class-selection" element={<ClassSelection />} />
                <Route path="/training-config" element={<TrainingConfig />} />
                <Route path="/add-new-model" element={<AddNewModel />} />
                <Route path="/add-image-folder" element={<AddImageFolder />} />
                <Route path="/label-tool" element={<LabelTool />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/sessions" element={<Sessions />} />
                <Route path="/dashboard/sessions/:id" element={<SessionDetail />} />
                <Route path="/dashboard/intervention" element={<Intervention />} />
            </Routes>
        </Router>
    )
}

export default App