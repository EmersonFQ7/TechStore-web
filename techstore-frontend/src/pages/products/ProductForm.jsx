import { useState, useEffect } from 'react';
import api         from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Input       from '../../components/common/Input';
import Button      from '../../components/common/Button';
import Alert       from '../../components/common/Alert';

export default function ProductForm({ product, onSuccess, onCancel }) {
  const { user, hasRole } = useAuth();
  const isAdmin   = hasRole('ADMIN');
  const isGerente = hasRole('GERENTE');
  const isEmpleado= hasRole('EMPLEADO');

  const [stores, setStores] = useState([]);
  const [form,   setForm]   = useState({
    nombre     : product?.nombre      || '',
    descripcion: product?.descripcion || '',
    precio     : product?.precio      || '',
    stock      : product?.stock       ?? '',
    categoria  : product?.categoria   || '',
    es_premium : product?.es_premium  ?? false,
    tienda_id  : product?.tienda_id   || user?.tienda_id || '',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      api.get('/stores').then(r => setStores(r.data.data)).catch(() => {});
    }
  }, [isAdmin]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { ...form, precio: parseFloat(form.precio), stock: parseInt(form.stock) };

      // Para EMPLEADO que solo puede actualizar stock
      if (product && isEmpleado) {
        await api.put(`/products/${product.id}`, { stock: parseInt(form.stock), _campo: 'stock' });
      } else if (product) {
        await api.put(`/products/${product.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  // EMPLEADO: solo puede editar el stock
  const readonlyForEmpleado = product && isEmpleado;

  return (
    <form onSubmit={handleSubmit}>
      <Alert type="error" message={error} onClose={() => setError('')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Input label="Nombre" name="nombre" value={form.nombre}
          onChange={handleChange} required disabled={readonlyForEmpleado} />

        <Input label="Categoría" name="categoria" value={form.categoria}
          onChange={handleChange}
          disabled={readonlyForEmpleado || (product && isGerente)} />

        <Input label="Precio (S/)" name="precio" type="number" value={form.precio}
          onChange={handleChange} required disabled={readonlyForEmpleado} />

        <Input label="Stock" name="stock" type="number" value={form.stock}
          onChange={handleChange} required />

        {isAdmin && !product && (
          <div className="mb-4 col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tienda <span className="text-red-500">*</span>
            </label>
            <select
              name="tienda_id"
              value={form.tienda_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar tienda...</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>
        )}

        <div className="mb-4 col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            disabled={readonlyForEmpleado}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {(isAdmin || isGerente) && (
          <div className="mb-4 col-span-2 flex items-center gap-3">
            <input
              type="checkbox"
              id="es_premium"
              name="es_premium"
              checked={form.es_premium}
              onChange={handleChange}
              disabled={readonlyForEmpleado}
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <label htmlFor="es_premium" className="text-sm font-medium text-gray-700">
              ⭐ Producto Premium
            </label>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="ghost" onClick={onCancel} type="button">Cancelar</Button>
        <Button type="submit" loading={loading}>
          {product ? 'Guardar Cambios' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  );
}