// src/useTimeMachine.ts

import { useState, useRef, useCallback, useEffect } from 'react';
import { TimeMachineConfig, UseTimeMachineReturn } from './types';

export function useTimeMachine<TData, TVariables>(
  config: TimeMachineConfig<TData, TVariables>
): UseTimeMachineReturn<TVariables> {
  const [isPending, setIsPending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Use environment-agnostic types for timers (works in Web, Native, and Node)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Keep track of the current action's variables so we can revert if needed
  const currentVariables = useRef<TVariables | null>(null);

  const cleanupTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const undo = useCallback(() => {
    if (!isPending || !currentVariables.current) return;
    
    // 1. Stop the clock before the API call fires
    cleanupTimers();
    
    // 2. Revert the UI immediately
    if (config.onRevert) config.onRevert(currentVariables.current);
    
    // 3. Reset state
    setIsPending(false);
    setTimeLeft(0);
    currentVariables.current = null;
  }, [isPending, config, cleanupTimers]);

  const execute = useCallback((variables: TVariables) => {
    // Prevent spam-clicking by blocking new executions while one is pending
    if (isPending) return; 

    currentVariables.current = variables;
    setIsPending(true);
    
    const delay = config.delayMs ?? 5000; // Default to 5 seconds
    setTimeLeft(delay);

    // 1. Fire optimistic update immediately (UI changes instantly)
    if (config.onOptimistic) config.onOptimistic(variables);

    // 2. Start a high-frequency interval for smooth UI progress bars (updates every 100ms)
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    // 3. Set the absolute point of no return (The actual API call)
    timeoutRef.current = setTimeout(async () => {
      cleanupTimers();
      
      try {
        const data = await config.mutationFn(variables);
        if (config.onSuccess) config.onSuccess(data, variables);
      } catch (error) {
        // PRO FEATURE: If the server call fails, we auto-revert the UI so it doesn't get out of sync
        console.error('[use-time-machine] Action failed. Reverting UI.', error);
        if (config.onRevert) config.onRevert(variables);
      } finally {
        // Reset the engine
        setIsPending(false);
        setTimeLeft(0);
        currentVariables.current = null;
      }
    }, delay);

  }, [isPending, config, cleanupTimers]);

  // Crucial safety measure: If the component using this hook unmounts, stop the timers
  // to prevent memory leaks and ghost API calls.
  useEffect(() => {
    return cleanupTimers;
  }, [cleanupTimers]);

  return { execute, undo, isPending, timeLeft };
}