import { useState, useEffect, useCallback } from 'react';

export const useApi = (fetchFunction, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFunction(...args);
      setData(result);
    } catch (err) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    fetchData();
  }, deps);

  return { data, loading, error, refetch: fetchData };
};
