'use client';

import { useState, useCallback } from 'react';
import { logger } from '@/lib/logger';

export interface AsyncError {
  message: string;
  code?: string;
  details?: any;
}

export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: AsyncError | null;
}

export interface UseAsyncReturn<T> extends UseAsyncState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: AsyncError | null) => void;
}

/**
 * Custom hook for handling async operations with proper error handling
 * Provides loading states, error handling, and data management
 */
export function useAsync<T = any>(
  asyncFunction?: (...args: any[]) => Promise<T>,
  immediate: boolean = false
): UseAsyncReturn<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      if (!asyncFunction) {
        logger.warn('useAsync: No async function provided');
        return null;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await asyncFunction(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (error) {
        const errorObj: AsyncError = {
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          code: (error as any)?.code,
          details: error instanceof Error ? error : error,
        };

        logger.error('useAsync execution failed', error);
        setState({ data: null, loading: false, error: errorObj });
        return null;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const setError = useCallback((error: AsyncError | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
  };
}

/**
 * Hook for handling API calls with automatic error handling
 */
export function useApiCall<T = any>(
  url?: string,
  options?: RequestInit
): UseAsyncReturn<T> {
  const asyncFunction = useCallback(
    async (customUrl?: string, customOptions?: RequestInit): Promise<T> => {
      const finalUrl = customUrl || url;
      const finalOptions = { ...options, ...customOptions };

      if (!finalUrl) {
        throw new Error('URL is required for API call');
      }

      logger.debug('Making API call', { url: finalUrl, method: finalOptions.method || 'GET' });

      const response = await fetch(finalUrl, finalOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      logger.debug('API call successful', { url: finalUrl, status: response.status });

      return data;
    },
    [url, options]
  );

  return useAsync<T>(asyncFunction);
}

/**
 * Hook for form submission with loading and error states
 */
export function useFormSubmission<T = any>() {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const submit = useCallback(
    async (submitFunction: () => Promise<T>): Promise<T | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await submitFunction();
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (error) {
        const errorObj: AsyncError = {
          message: error instanceof Error ? error.message : 'Form submission failed',
          code: (error as any)?.code,
          details: error,
        };

        logger.error('Form submission failed', error);
        setState({ data: null, loading: false, error: errorObj });
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    submit,
    reset,
  };
}