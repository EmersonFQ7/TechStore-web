import { useState } from 'react';
import api    from '../../api/axios';
import Input  from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert  from '../../components/common/Alert';

export default function RoleForm({ role, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    nombre     : role?.nombre      || '',
    descripcion: role?.descripcion || '',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (role) {
        await api.put(`/roles/${role.id}`, form);
      } else {
        await api.post('/roles', form);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el rol');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Alert type="error" message={error} onClose={() => setError('')} />
      <Input label="Nombre del Rol" name="nombre" value={form.nombre}
        onChange={handleChange} required placeholder="Ej: SUPERVISOR" />
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          name="descripcion" value={form.descripcion} onChange={handleChange} rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Descripción del rol..."
        />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="ghost" onClick={onCancel} type="button">Cancelar</Button>
        <Button type="submit" loading={loading}>{role ? 'Guardar Cambios' : 'Crear Rol'}</Button>
      </div>
    </form>
  );
}