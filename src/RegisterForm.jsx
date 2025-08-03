import React, { useState } from 'react';
import { register } from './auth';

const RegisterForm = ({ onRegistered }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setSuccess('');
      return;
    }
    try {
      register(username.trim(), password);
      setSuccess('Registration successful! You can now log in.');
      setError('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      if (onRegistered) onRegistered();
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6">Create Account</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="p-3 rounded bg-gray-700 w-full outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="p-3 rounded bg-gray-700 w-full outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="p-3 rounded bg-gray-700 w-full outline-none"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded"
          >
            Register
          </button>
        </form>
        <button
          onClick={() => onRegistered && onRegistered()}
          className="mt-4 text-blue-400 hover:underline"
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
