import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api        from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Spinner    from '../../components/common/Spinner';

function StatCard({ icon, label, value, to, color }) {
  return (
    <Link to={to} className={`block p-6 rounded-xl border-l-4 bg-white shadow-sm hover:shadow-md transition-shadow ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const [stats,   setStats]   = useState({ productos: 0, usuarios: 0, roles: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const results = await Promise.allSettled([
          api.get('/products?limit=1'),
          hasRole('ADMIN') ? api.get('/users?limit=1')    : Promise.resolve(null),
          hasRole('ADMIN') ? api.get('/roles')            : Promise.resolve(null),
        ]);

        setStats({
          productos: results[0].value?.data?.meta?.total ?? 0,
          usuarios : results[1].value?.data?.meta?.total ?? 0,
          roles    : results[2].value?.data?.data?.length ?? 0,
        });
      } catch (_) {}
      finally { setLoading(false); }
    })();
  }, [hasRole]);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          ¡Bienvenido, {user?.nombre}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Roles: <span className="font-medium text-blue-600">{user?.roles?.join(', ')}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon="📦" label="Productos" value={stats.productos}
          to="/products" color="border-blue-500"
        />
        {hasRole('ADMIN') && (
          <StatCard
            icon="👥" label="Usuarios" value={stats.usuarios}
            to="/users" color="border-green-500"
          />
        )}
        {hasRole('ADMIN') && (
          <StatCard
            icon="🔐" label="Roles" value={stats.roles}
            to="/roles" color="border-purple-500"
          />
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {hasRole('ADMIN','GERENTE','EMPLEADO') && (
            <Link to="/products/new"
              className="flex items-center gap-2 p-3 rounded-lg border border-blue-200 hover:bg-blue-50 text-blue-700 text-sm font-medium transition-colors">
              <span>➕</span> Nuevo Producto
            </Link>
          )}
          {hasRole('ADMIN') && (
            <Link to="/users/new"
              className="flex items-center gap-2 p-3 rounded-lg border border-green-200 hover:bg-green-50 text-green-700 text-sm font-medium transition-colors">
              <span>👤</span> Nuevo Usuario
            </Link>
          )}
          {hasRole('ADMIN','GERENTE','AUDITOR') && (
            <Link to="/stores"
              className="flex items-center gap-2 p-3 rounded-lg border border-orange-200 hover:bg-orange-50 text-orange-700 text-sm font-medium transition-colors">
              <span>🏪</span> Ver Tiendas
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}