import { CheckCircle, Clock, PauseCircle, XCircle } from 'lucide-react';

type StatusBadgeProps = {
  status?: string;
};

const statusConfig = {
  PENDING: {
    label: 'Pending',
    classes: 'bg-amber-100 text-amber-800',
    icon: <Clock className="w-4 h-4" />,
  },
  APPROVED: {
    label: 'Approved',
    classes: 'bg-emerald-100 text-emerald-800',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  REJECTED: {
    label: 'Rejected',
    classes: 'bg-rose-100 text-rose-800',
    icon: <XCircle className="w-4 h-4" />,
  },
  SUSPENDED: {
    label: 'Suspended',
    classes: 'bg-slate-100 text-slate-600',
    icon: <PauseCircle className="w-4 h-4" />,
  },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const key = (status || 'PENDING').toString().toUpperCase();
  const config = statusConfig[key as keyof typeof statusConfig] || statusConfig.PENDING;

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${config.classes}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export default StatusBadge;
