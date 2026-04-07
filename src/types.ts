// src/types.ts

export interface TimeMachineConfig<TData, TVariables> {
  /** The actual API call or server action to execute after the delay */
  mutationFn: (variables: TVariables) => Promise<TData>;
  
  /** Fires immediately. Use this to update your UI optimistically. */
  onOptimistic?: (variables: TVariables) => void;
  
  /** Fires if the user clicks Undo OR if the mutationFn fails. Use this to revert the UI. */
  onRevert?: (variables: TVariables) => void;
  
  /** Fires when the mutationFn successfully completes. */
  onSuccess?: (data: TData, variables: TVariables) => void;
  
  /** Time in milliseconds before the mutationFn fires. Default: 5000ms */
  delayMs?: number;
}

export interface UseTimeMachineReturn<TVariables> {
  /** Call this function to trigger the action and start the countdown */
  execute: (variables: TVariables) => void;
  
  /** Call this to cancel the countdown and revert the UI */
  undo: () => void;
  
  /** True while the countdown is active */
  isPending: boolean;
  
  /** Remaining time in milliseconds (useful for UI progress bars) */
  timeLeft: number;
}