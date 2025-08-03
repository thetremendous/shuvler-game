import React, { useState } from 'react';
import Login from './Login';
import RegisterForm from './RegisterForm';
import App from './App';
import { getCurrentUser, clearCurrentUser } from './auth';

const AuthApp = () => {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (username) => {
    setCurrentUser(username);
  };

  const handleLogout = () => {
    clearCurrentUser();
    setCurrentUser(null);
  };

  const handleNavigateToRegister = () => {
    setShowRegister(true);
  };

  const handleRegistered = () => {
    setShowRegister(false);
  };

  if (currentUser) {
    return (
      <>
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
        <App />
      </>
    );
  }

  return showRegister ? (
    <RegisterForm onRegistered={handleRegistered} />
  ) : (
    <Login onLogin={handleLogin} onNavigateToRegister={handleNavigateToRegister} />
  );
};

export default AuthApp;
