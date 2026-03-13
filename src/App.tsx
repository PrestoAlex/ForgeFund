import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import BackgroundAudio from './components/BackgroundAudio';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TasksPage from './pages/TasksPage';
import CreateProjectPage from './pages/CreateProjectPage';
import TestContractPage from './pages/TestContractPage';
import GuidePage from './pages/GuidePage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col relative app-bg">
      <Navbar />
      <BackgroundAudio />
      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/project/:id" element={<ProjectDetailPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/create-project" element={<CreateProjectPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/test-contract" element={<TestContractPage />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <Toast />
    </div>
  );
}
