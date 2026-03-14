/**
 * src/context/AuthContext.jsx
 * Global authentication state using React Context + useReducer.
 */

import { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, getUser, getToken, setToken, setUser, clearAuth } from '../utils/api';

// ── State shape ────────────────────────────────────────────────
const initialState = {
  user: getUser(),
  token: getToken(),
  isAuthenticated: !!getToken(),
  loading: false,
  error: null,
};

// ── Reducer ────────────────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':  return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return { ...state, loading: false, user: action.user, token: action.token, isAuthenticated: true, error: null };
    case 'AUTH_ERROR':  return { ...state, loading: false, error: action.error };
    case 'LOGOUT':      return { ...initialState, user: null, token: null, isAuthenticated: false };
    case 'CLEAR_ERROR': return { ...state, error: null };
    default:            return state;
  }
}

// ── Context ────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verify token on mount
  useEffect(() => {
    if (state.token && !state.user) {
      authAPI.me()
        .then(({ user }) => dispatch({ type: 'AUTH_SUCCESS', user, token: state.token }))
        .catch(() => logout());
    }
  }, []);

  async function login(email, password) {
    dispatch({ type: 'AUTH_START' });
    try {
      const { user, token } = await authAPI.login(email, password);
      setToken(token);
      setUser(user);
      dispatch({ type: 'AUTH_SUCCESS', user, token });
      return { success: true };
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR', error: err.message });
      return { success: false, error: err.message };
    }
  }

  async function register(name, email, password) {
    dispatch({ type: 'AUTH_START' });
    try {
      const { user, token } = await authAPI.register(name, email, password);
      setToken(token);
      setUser(user);
      dispatch({ type: 'AUTH_SUCCESS', user, token });
      return { success: true };
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR', error: err.message });
      return { success: false, error: err.message };
    }
  }

  function logout() {
    clearAuth();
    dispatch({ type: 'LOGOUT' });
  }

  function clearError() {
    dispatch({ type: 'CLEAR_ERROR' });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
