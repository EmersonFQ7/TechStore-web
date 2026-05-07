import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api          from '../../api/axios';
import { useAuth }  from '../../context/AuthContext';
import Input        from '../../components/common/Input';
import Button       from '../../components/common/Button';
import Alert        from '../../components/common/Alert';

export default function LoginPage() {
  const navigate       = useNavigate();
  const { login }      = useAuth();
  const [form, setForm]= useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);

      if (data.mfaRequired) {
        // Redirigir a verificación MFA con el token temporal
        navigate('/mfa', { state: { tempToken: data.tempToken } });
        return;
      }

      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900">TechStore</h1>
          <p className="text-gray-500 text-sm mt-1">Sistema de Gestión de Inventario</p>
        </div>

        <Alert type="error" message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          <Input
            label="Email" name="email" type="email"
            value={form.email} onChange={handleChange}
            placeholder="admin@techstore.com" required
          />
          <Input
            label="Contraseña" name="password" type="password"
            value={form.password} onChange={handleChange}
            placeholder="••••••••" required
          />
          <Button type="submit" loading={loading} fullWidth className="mt-2">
            Iniciar Sesión
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}