import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-8xl font-bold text-gray-200">404</p>
        <h1 className="text-2xl font-bold text-gray-800 mt-4">Página no encontrada</h1>
        <p className="text-gray-500 mt-2">La ruta que buscas no existe.</p>
        <Link to="/dashboard"
          className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}