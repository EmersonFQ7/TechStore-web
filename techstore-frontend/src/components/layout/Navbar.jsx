import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onMenuToggle }) {
  const { user, logout, hasRole } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center px-4 gap-4">
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-blue-700">
        <span className="text-2xl">🛒</span>
        <span className="hidden sm:inline">TechStore</span>
      </Link>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-800">{user?.nombre}</p>
          <p className="text-xs text-gray-500">{user?.roles?.join(', ')}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
          {user?.nombre?.charAt(0).toUpperCase()}
        </div>
        <button
          onClick={logout}
          className="text-sm text-gray-600 hover:text-red-600 transition-colors font-medium"
        >
          Salir
        </button>
      </div>
    </header>
  );
}