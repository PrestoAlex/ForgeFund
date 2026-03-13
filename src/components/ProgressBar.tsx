interface Props {
  value: number;
  size?: 'sm' | 'md';
}

export default function ProgressBar({ value, size = 'sm' }: Props) {
  const clamped = Math.min(100, Math.max(0, value));
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className={`w-full ${h} rounded-full bg-surface-600 overflow-hidden`}>
      <div
        className="progress-bar-fill h-full"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
