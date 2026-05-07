import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api   from '../../api/axios';
import Input  from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert  from '../../components/common/Alert';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmPassword: '' });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.nombre.trim())                  return 'El nombre es requerido';
    if (!form.email.includes('@'))            return 'Email inválido';
    if (form.password.length < 8)            return 'La contraseña debe tener al menos 8 caracteres';
    if (!/[A-Z]/.test(form.password))        return 'La contraseña debe tener al menos una mayúscula';
    if (!/\d/.test(form.password))           return 'La contraseña debe tener al menos un número';
    if (form.password !== form.confirmPassword) return 'Las contraseñas no coinciden';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', {
        nombre  : form.nombre,
        email   : form.email,
        password: form.password,
      });
      setSuccess('¡Cuenta creada! Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
          <p className="text-gray-500 text-sm mt-1">TechStore — Sistema de Inventario</p>
        </div>

        <Alert type="error"   message={error}   onClose={() => setError('')} />
        <Alert type="success" message={success} />

        <form onSubmit={handleSubmit}>
          <Input label="Nombre completo" name="nombre"  type="text"
            value={form.nombre} onChange={handleChange} required />
          <Input label="Email" name="email" type="email"
            value={form.email} onChange={handleChange} required />
          <Input label="Contraseña" name="password" type="password"
            value={form.password} onChange={handleChange} required
            placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número" />
          <Input label="Confirmar contraseña" name="confirmPassword" type="password"
            value={form.confirmPassword} onChange={handleChange} required />
          <Button type="submit" loading={loading} fullWidth className="mt-2">
            Registrarse
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}