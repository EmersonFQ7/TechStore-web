import { useEffect, useState, useCallback } from 'react';
import api      from '../../api/axios';
import Button   from '../../components/common/Button';
import Alert    from '../../components/common/Alert';
import Spinner  from '../../components/common/Spinner';
import Modal    from '../../components/common/Modal';
import RoleForm from './RoleForm';

export default function RolesPage() {
  const [roles,    setRoles]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/roles');
      setRoles(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const BASE_ROLES = ['ADMIN','GERENTE','EMPLEADO','AUDITOR'];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Roles del Sistema</h1>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>🔐 Nuevo Rol</Button>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map(r => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{r.nombre}</h3>
                  <p className="text-sm text-gray-500 mt-1">{r.descripcion || 'Sin descripción'}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-medium
                  ${r.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {r.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              {!BASE_ROLES.includes(r.nombre) && (
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="ghost" className="text-xs !py-1"
                    onClick={() => { setEditing(r); setShowForm(true); }}
                  >Editar</Button>
                </div>
              )}
              {BASE_ROLES.includes(r.nombre) && (
                <p className="text-xs text-gray-400 mt-4 pt-4 border-t">Rol del sistema (no editable)</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? 'Editar Rol' : 'Nuevo Rol'}>
        <RoleForm
          role={editing}
          onSuccess={() => { setShowForm(false); setEditing(null); fetchRoles(); }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}