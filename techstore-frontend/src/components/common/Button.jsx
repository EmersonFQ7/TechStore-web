const VARIANTS = {
  primary  : 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  danger   : 'bg-red-600 hover:bg-red-700 text-white',
  success  : 'bg-green-600 hover:bg-green-700 text-white',
  ghost    : 'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300',
};

export default function Button({
  children, onClick, type = 'button', variant = 'primary',
  disabled = false, loading = false, className = '', fullWidth = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${VARIANTS[variant]}
        ${fullWidth ? 'w-full' : ''}
        px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}