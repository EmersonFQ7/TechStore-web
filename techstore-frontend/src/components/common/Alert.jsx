const TYPES = {
  success: 'bg-green-50 border-green-400 text-green-800',
  error  : 'bg-red-50 border-red-400 text-red-800',
  warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
  info   : 'bg-blue-50 border-blue-400 text-blue-800',
};

export default function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;
  return (
    <div className={`border-l-4 p-4 rounded mb-4 ${TYPES[type]} flex justify-between items-start`}>
      <span className="text-sm">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 text-lg font-bold leading-none opacity-60 hover:opacity-100">
          ×
        </button>
      )}
    </div>
  );
}