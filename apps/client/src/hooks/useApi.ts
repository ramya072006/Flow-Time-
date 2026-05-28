import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { toast } from '@/hooks/useToast';

interface UseApiOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
  successMessage?: string;
}

export function useApi<T>(
  apiCall: (...args: unknown[]) => Promise<{ data: { data: T; message?: string } }>,
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: unknown[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiCall(...args);
      setData(response.data.data);
      if (options.successMessage) {
        toast({ title: options.successMessage });
      }
      options.onSuccess?.(response.data.data);
      return response.data.data;
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const message = axiosError.response?.data?.message || 'Something went wrong';
      setError(message);
      toast({ title: message, variant: 'destructive' });
      options.onError?.(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiCall, options.successMessage]);

  return { data, isLoading, error, execute };
}
