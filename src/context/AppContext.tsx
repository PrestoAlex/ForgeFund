import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useOPNetWallet } from '../hooks/useOPNetWallet';
import { Project, Task } from '../types';
import { DEMO_PROJECTS, DEMO_TASKS } from '../data/constants';

interface Toast {
  msg: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface AppContextType {
  wallet: ReturnType<typeof useOPNetWallet>['wallet'];
  walletLoading: boolean;
  connectWallet: ReturnType<typeof useOPNetWallet>['connect'];
  disconnectWallet: ReturnType<typeof useOPNetWallet>['disconnect'];
  syncWallet: ReturnType<typeof useOPNetWallet>['sync'];
  projects: Project[];
  tasks: Task[];
  toast: Toast | null;
  showToast: (msg: string, type?: Toast['type']) => void;
  addProject: (project: Project) => void;
  addTask: (task: Task) => void;
  updateProject: (projectId: string, updater: (project: Project) => Project) => void;
  updateTask: (taskId: string, updater: (task: Task) => Task) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { wallet, loading: walletLoading, connect, disconnect, sync } = useOPNetWallet();
  const [projects, setProjects] = useState<Project[]>(DEMO_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(DEMO_TASKS);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((msg: string, type: Toast['type'] = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const addProject = useCallback((project: Project) => {
    setProjects(prev => [project, ...prev]);
  }, []);

  const addTask = useCallback((task: Task) => {
    setTasks(prev => [task, ...prev]);
  }, []);

  const updateProject = useCallback((projectId: string, updater: (project: Project) => Project) => {
    setProjects(prev => prev.map((project) => (project.id === projectId ? updater(project) : project)));
  }, []);

  const updateTask = useCallback((taskId: string, updater: (task: Task) => Task) => {
    setTasks(prev => prev.map((task) => (task.id === taskId ? updater(task) : task)));
  }, []);

  return (
    <AppContext.Provider
      value={{
        wallet,
        walletLoading,
        connectWallet: connect,
        disconnectWallet: disconnect,
        syncWallet: sync,
        projects,
        tasks,
        toast,
        showToast,
        addProject,
        addTask,
        updateProject,
        updateTask,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
