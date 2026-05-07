import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api   from '../../api/axios';
import { useAuth }  from '../../context/AuthContext';
import Input  from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert  from '../../components/common/Alert';

export default function MfaPage() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { login } = useAuth();
  const tempToken  = location.state?.tempToken;

  const [code,    setCode]    = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  if (!tempToken) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/mfa/verify', { tempToken, code });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="text-2xl font-bold text-gray-900">Verificación MFA</h1>
          <p className="text-gray-500 text-sm mt-1">Ingresa el código de Google Authenticator</p>
        </div>

        <Alert type="error" message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          <Input
            label="Código de 6 dígitos"
            name="code"
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            required
          />
          <Button type="submit" loading={loading} fullWidth className="mt-2">
            Verificar
          </Button>
        </form>

        <button
          onClick={() => navigate('/login')}
          className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 text-center"
        >
          ← Volver al login
        </button>
      </div>
    </div>
  );
}