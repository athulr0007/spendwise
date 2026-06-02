import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const MONTHLY_URL = '/api/expenses/summary/monthly';
const TRENDS_URL = '/api/expenses/summary/trends';

export const useSummary = (monthString, addToast) => {
  const [summary, setSummary] = useState({
    total: 0,
    count: 0,
    categories: {
      Food: 0,
      Transport: 0,
      Shopping: 0,
      Bills: 0,
      Entertainment: 0,
      Other: 0
    },
    previousMonth: {
      total: 0
    }
  });
  
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSummaries = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, trendsRes] = await Promise.all([
        axios.get(MONTHLY_URL, { params: { month: monthString || undefined } }),
        axios.get(TRENDS_URL)
      ]);
      
      setSummary(summaryRes.data);
      setTrends(trendsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard summaries:', err);
      // Fail silently or log, since useExpenses already alerts on core connectivity errors.
    } finally {
      setLoading(false);
    }
  }, [monthString]);

  // Fetch summaries whenever the active target month changes
  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  return {
    summary,
    trends,
    loading,
    refreshSummary: fetchSummaries
  };
};
