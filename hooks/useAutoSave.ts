import { useEffect, useRef, useCallback, useState } from 'react';
import { debounce } from '@/lib/utils';

interface UseAutoSaveOptions {
  surveyId: string;
  data: any;
  enabled?: boolean;
  interval?: number; // milliseconds
  onSave?: (data: any) => Promise<void>;
  onError?: (error: Error) => void;
}

interface AutoSaveStatus {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
}

export function useAutoSave({
  surveyId,
  data,
  enabled = true,
  interval = 5000, // default 5 seconds
  onSave,
  onError
}: UseAutoSaveOptions) {
  const [status, setStatus] = useState<AutoSaveStatus>({
    isSaving: false,
    lastSaved: null,
    error: null
  });

  const dataRef = useRef(data);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  // Update ref when data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const saveSurvey = useCallback(async (dataToSave: any) => {
    if (!enabled) return;

    const dataString = JSON.stringify(dataToSave);

    // Skip if data hasn't changed
    if (dataString === lastSavedDataRef.current) {
      return;
    }

    try {
      setStatus(prev => ({ ...prev, isSaving: true, error: null }));

      if (onSave) {
        await onSave(dataToSave);
      } else {
        // Default save implementation using API
        const response = await fetch(`/api/surveys/${surveyId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
          },
          body: JSON.stringify({ data: dataToSave })
        });

        if (!response.ok) {
          throw new Error('Failed to save survey');
        }
      }

      lastSavedDataRef.current = dataString;
      setStatus({
        isSaving: false,
        lastSaved: new Date(),
        error: null
      });
    } catch (error) {
      const err = error as Error;
      setStatus(prev => ({ ...prev, isSaving: false, error: err }));
      onError?.(err);
    }
  }, [surveyId, enabled, onSave, onError]);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((dataToSave: any) => {
      saveSurvey(dataToSave);
    }, interval),
    [saveSurvey, interval]
  );

  // Auto-save when data changes
  useEffect(() => {
    if (!enabled) return;

    debouncedSave(data);

    return () => {
      debouncedSave.cancel();
    };
  }, [data, enabled, debouncedSave]);

  // Manual save function
  const saveNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await saveSurvey(dataRef.current);
  }, [saveSurvey]);

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const dataString = JSON.stringify(dataRef.current);
      if (dataString !== lastSavedDataRef.current) {
        e.preventDefault();
        e.returnValue = '';
        // Attempt synchronous save
        navigator.sendBeacon(
          `/api/surveys/${surveyId}`,
          JSON.stringify({ data: dataRef.current })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [surveyId]);

  return {
    ...status,
    saveNow
  };
}
