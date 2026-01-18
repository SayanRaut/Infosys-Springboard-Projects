import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function useFetch(url, initialData = null) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(url);
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}