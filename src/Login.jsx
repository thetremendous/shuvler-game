import React, { useState } from 'react';
import { login, setCurrentUser } from './auth';

const Login = ({ onLogin, onNavigateToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (login(trimmed, password)) {
      setCurrentUser(trimmed);
      setUsername('');
      setPassword('');
      setError('');
      if (onLogin) onLogin(trimmed);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Sign in to SHUVLER</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="p-3 rounded bg-gray-700 placeholder-gray-400 focus:outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="p-3 rounded bg-gray-700 placeholder-gray-400 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 rounded"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <button type="button" onClick={onNavigateToRegister} className="text-yellow-400 underline">
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
