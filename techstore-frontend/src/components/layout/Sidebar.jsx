import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard',  label: 'Dashboard',  icon: '📊', roles: ['ADMIN','GERENTE','EMPLEADO','AUDITOR'] },
  { to: '/products',   label: 'Productos',   icon: '📦', roles: ['ADMIN','GERENTE','EMPLEADO','AUDITOR'] },
  { to: '/users',      label: 'Usuarios',    icon: '👥', roles: ['ADMIN'] },
  { to: '/roles',      label: 'Roles',       icon: '🔐', roles: ['ADMIN'] },
  { to: '/stores',     label: 'Tiendas',     icon: '🏪', roles: ['ADMIN','GERENTE','AUDITOR'] },
];

export default function Sidebar({ isOpen, onClose }) {
  const { hasRole } = useAuth();

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gray-900 text-white z-40
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map(item => {
            if (!hasRole(...item.roles)) return null;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}