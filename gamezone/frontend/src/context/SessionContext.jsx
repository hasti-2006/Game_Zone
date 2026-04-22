import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [activeSessions, setActiveSessions] = useState({});
  const [masterBeverages, setMasterBeverages] = useState([]);

  const updateSession = (systemId, sessionData) => {
    setActiveSessions((prev) => ({ ...prev, [systemId]: sessionData }));
  };

  const clearSession = (systemId) => {
    setActiveSessions((prev) => {
      const updated = { ...prev };
      delete updated[systemId];
      return updated;
    });
  };

  const fetchMasterBeverages = useCallback(async () => {
    try {
      const res = await api.get('/beverages/get-all-beverages');
      setMasterBeverages(res.data.beverages);
    } catch {}
  }, []);

  return (
    <SessionContext.Provider value={{ activeSessions, updateSession, clearSession, masterBeverages, fetchMasterBeverages }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
