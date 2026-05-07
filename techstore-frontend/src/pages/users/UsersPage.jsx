import { useEffect, useState, useCallback } from 'react';
import api      from '../../api/axios';
import Button   from '../../components/common/Button';
import Alert    from '../../components/common/Alert';
import Spinner  from '../../components/common/Spinner';
import Modal    from '../../components/common/Modal';
import UserForm from './UserForm';

export default function UsersPage() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);

  const fetchUsers = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users?page=${p}&limit=15`);
      setUsers(data.data);
      setTotal(data.meta.total);
      setPage(p);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleActive = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { activo: !user.activo });
      fetchUsers(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          👤 Nuevo Usuario
        </Button>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['ID','Nombre','Email','Roles','Tienda','MFA','Estado','Acciones'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-8 text-gray-400">No hay usuarios</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">#{u.id}</td>
                    <td className="px-4 py-3 font-medium">{u.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles?.map(r => (
                          <span key={r.nombre} className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                            {r.nombre}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.tienda?.nombre || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${u.mfa_habilitado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.mfa_habilitado ? '✅ Activo' : '⚪ Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditing(u); setShowForm(true); }}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >Editar</button>
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`text-xs font-medium ${u.activo ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                        >{u.activo ? 'Desactivar' : 'Activar'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <span>Total: {total} usuarios</span>
        <div className="flex gap-2">
          <Button variant="ghost" disabled={page <= 1} onClick={() => fetchUsers(page - 1)}>← Anterior</Button>
          <span className="px-3 py-2">Pág. {page}</span>
          <Button variant="ghost" disabled={page * 15 >= total} onClick={() => fetchUsers(page + 1)}>Siguiente →</Button>
        </div>
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? 'Editar Usuario' : 'Nuevo Usuario'} size="lg">
        <UserForm
          user={editing}
          onSuccess={() => { setShowForm(false); setEditing(null); fetchUsers(page); }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}