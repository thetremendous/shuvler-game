export const getUsers = () => {
  const data = localStorage.getItem('users');
  return data ? JSON.parse(data) : {};
};

export const register = (username, password) => {
  const users = getUsers();
  if (!username) {
    throw new Error('Username is required');
  }
  if (!password) {
    throw new Error('Password is required');
  }
  if (users[username]) {
    throw new Error('User already exists');
  }
  users[username] = password;
  localStorage.setItem('users', JSON.stringify(users));
};

export const login = (username, password) => {
  const users = getUsers();
  return !!users[username] && users[username] === password;
};

export const setCurrentUser = (username) => {
  localStorage.setItem('currentUser', username);
};

export const getCurrentUser = () => {
  return localStorage.getItem('currentUser');
};

export const clearCurrentUser = () => {
  localStorage.removeItem('currentUser');
};
