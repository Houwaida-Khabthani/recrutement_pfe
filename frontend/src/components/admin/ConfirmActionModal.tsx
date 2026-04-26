import { CheckCircle, PauseCircle, XCircle } from 'lucide-react';

type ConfirmActionModalProps = {
  title: string;
  message: string;
  actionLabel: string;
  actionType: 'approve' | 'reject' | 'suspend';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const iconMap = {
  approve: <CheckCircle className="w-5 h-5" />,
  reject: <XCircle className="w-5 h-5" />,
  suspend: <PauseCircle className="w-5 h-5" />,
};

const actionClasses = {
  approve: 'bg-emerald-600 hover:bg-emerald-700',
  reject: 'bg-rose-600 hover:bg-rose-700',
  suspend: 'bg-slate-600 hover:bg-slate-700',
};

const ConfirmActionModal = ({
  title,
  message,
  actionLabel,
  actionType,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-lg rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-center gap-4 rounded-t-[2rem] bg-slate-900 px-8 py-6 text-white">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-slate-200">
            {iconMap[actionType]}
          </span>
          <div>
            <p className="text-xs uppercase tracking-[3px] text-slate-400">Confirm action</p>
            <h2 className="mt-2 text-xl font-black">{title}</h2>
          </div>
        </div>

        <div className="space-y-6 border-b border-slate-200 px-8 py-8">
          <p className="text-slate-700 text-sm leading-7">{message}</p>
          <p className="text-sm text-slate-500">This action cannot be undone from the moderation panel.</p>
        </div>

        <div className="flex flex-col gap-3 p-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold text-white transition ${actionClasses[actionType]} ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
          >
            {loading ? 'Processing...' : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;
