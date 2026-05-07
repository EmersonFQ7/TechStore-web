import { useEffect, useState, useCallback } from 'react';
import { Link }    from 'react-router-dom';
import api         from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Button      from '../../components/common/Button';
import Alert       from '../../components/common/Alert';
import Spinner     from '../../components/common/Spinner';
import Modal       from '../../components/common/Modal';
import ProductForm from './ProductForm';

export default function ProductsPage() {
  const { hasRole } = useAuth();
  const [products, setProducts] = useState([]);
  const [meta,     setMeta]     = useState({ total: 0, page: 1 });
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.data);
      setMeta(data.meta);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts(meta.page);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar');
    }
  };

  const canCreate = hasRole('ADMIN','GERENTE','EMPLEADO');
  const canEdit   = hasRole('ADMIN','GERENTE','EMPLEADO');
  const canDelete = hasRole('ADMIN','GERENTE');

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        {canCreate && (
          <Button onClick={() => { setEditing(null); setShowForm(true); }}>
            ➕ Nuevo Producto
          </Button>
        )}
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Búsqueda */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={() => fetchProducts()} variant="secondary">🔍</Button>
      </div>

      {loading ? <Spinner /> : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['ID','Nombre','Categoría','Precio','Stock','Tienda','Premium','Acciones'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No hay productos</td></tr>
                  ) : products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500">#{p.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{p.nombre}</td>
                      <td className="px-4 py-3 text-gray-600">{p.categoria || '-'}</td>
                      <td className="px-4 py-3 text-gray-800 font-medium">S/ {Number(p.precio).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${p.stock < 5 ? 'text-red-600' : 'text-green-600'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.tienda?.nombre || '-'}</td>
                      <td className="px-4 py-3">
                        {p.es_premium
                          ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">⭐ Premium</span>
                          : <span className="text-gray-400 text-xs">—</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {canEdit && (
                            <button
                              onClick={() => { setEditing(p); setShowForm(true); }}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >Editar</button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >Eliminar</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <span>Total: {meta.total} productos</span>
            <div className="flex gap-2">
              <Button
                variant="ghost" disabled={meta.page <= 1}
                onClick={() => fetchProducts(meta.page - 1)}
              >← Anterior</Button>
              <span className="px-3 py-2">Pág. {meta.page}</span>
              <Button
                variant="ghost" disabled={meta.page * 15 >= meta.total}
                onClick={() => fetchProducts(meta.page + 1)}
              >Siguiente →</Button>
            </div>
          </div>
        </>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
      >
        <ProductForm
          product={editing}
          onSuccess={() => { setShowForm(false); setEditing(null); fetchProducts(meta.page); }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}