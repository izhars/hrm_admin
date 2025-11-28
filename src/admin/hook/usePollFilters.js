import { useState, useCallback } from 'react';

export const usePollFilters = () => {
  const [filters, setFilters] = useState({
    status: 'all', // all, active, closed
    sortBy: 'created', // created, votes, expiry
    sortOrder: 'desc' // asc, desc
  });

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      status: 'all',
      sortBy: 'created',
      sortOrder: 'desc'
    });
  }, []);

  return { filters, updateFilter, resetFilters };
};
