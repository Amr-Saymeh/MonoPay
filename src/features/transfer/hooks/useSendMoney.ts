import { useCallback, useState } from "react";

import { sendMoney } from "../services/transferService";
import { SendMoneyParams, TransferError } from "../types/index";

interface SendMoneyState {
  loading: boolean;
  error: TransferError | null;
  success: boolean;
}

interface UseSendMoneyResult extends SendMoneyState {
  execute: (params: SendMoneyParams) => Promise<TransferError | null>;
  reset: () => void;
}

// Manages async state for a single send-money operation and exposes it to the calling screen.
export function useSendMoney(): UseSendMoneyResult {
  const [state, setState] = useState<SendMoneyState>({
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (params: SendMoneyParams): Promise<TransferError | null> => {
    setState({ loading: true, error: null, success: false });

    const result = await sendMoney(params);

    if (result.success) {
      setState({ loading: false, error: null, success: true });
      // Returning null signals "no error" so callers can use a simple `if (!error)` check
      // instead of inspecting the success flag and the error object separately.
      return null;
    } else {
      setState({ loading: false, error: result.error, success: false });
      return result.error;
    }
  }, []);

  // Clears state between consecutive sends on the same screen instance,
  // preventing a previous error or success from leaking into the next attempt.
  const reset = useCallback(() => {
    setState({ loading: false, error: null, success: false });
  }, []);

  return { ...state, execute, reset };
}
