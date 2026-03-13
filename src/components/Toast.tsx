import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'border-green-500/30 bg-green-500/10 text-green-400',
  error: 'border-red-500/30 bg-red-500/10 text-red-400',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
};

export default function Toast() {
  const { toast } = useApp();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          className={`fixed bottom-6 left-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-md ${colors[toast.type]}`}
        >
          {(() => {
            const Icon = icons[toast.type];
            return <Icon size={18} />;
          })()}
          <span className="text-sm font-medium">{toast.msg}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
