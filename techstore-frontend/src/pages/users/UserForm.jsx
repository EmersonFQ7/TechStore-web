import { useState, useEffect } from 'react';
import api    from '../../api/axios';
import Input  from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert  from '../../components/common/Alert';

export default function UserForm({ user, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    nombre   : user?.nombre    || '',
    email    : user?.email     || '',
    password : '',
    tienda_id: user?.tienda_id || '',
    roles    : user?.roles?.map(r => r.nombre) || ['EMPLEADO'],
  });
  const [stores, setStores] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [error,   setError]    = useState('');
  const [loading, setLoading]  = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/stores'),
      api.get('/roles'),
    ]).then(([s, r]) => {
      setStores(s.data.data);
      setAllRoles(r.data.data);
    }).catch(() => {});
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const toggleRole = (roleName) => {
    setForm(f => ({
      ...f,
      roles: f.roles.includes(roleName)
        ? f.roles.filter(r => r !== roleName)
        : [...f.roles, roleName],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (user) {
        const updateData = { nombre: form.nombre, email: form.email, tienda_id: form.tienda_id || null };
        if (form.password) updateData.password = form.password;
        await api.put(`/users/${user.id}`, updateData);
        await api.post(`/users/${user.id}/roles`, { roles: form.roles });
      } else {
        if (!form.password) throw new Error('La contraseña es requerida');
        await api.post('/users', {
          nombre   : form.nombre,
          email    : form.email,
          password : form.password,
          tienda_id: form.tienda_id || null,
          roles    : form.roles,
        });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Alert type="error" message={error} onClose={() => setError('')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Input label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
        <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
        <Input label={user ? 'Nueva contraseña (opcional)' : 'Contraseña'} name="password"
          type="password" value={form.password} onChange={handleChange} required={!user} />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tienda</label>
          <select name="tienda_id" value={form.tienda_id} onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Sin tienda asignada</option>
            {stores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
        <div className="flex flex-wrap gap-2">
          {allRoles.map(r => (
            <button
              key={r.nombre} type="button"
              onClick={() => toggleRole(r.nombre)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                ${form.roles.includes(r.nombre)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
            >
              {r.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="ghost" onClick={onCancel} type="button">Cancelar</Button>
        <Button type="submit" loading={loading}>{user ? 'Guardar Cambios' : 'Crear Usuario'}</Button>
      </div>
    </form>
  );
}