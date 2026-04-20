import { useCallback, useState } from "react";

import { requestMoney } from "../services/transferService";
import { RequestMoneyParams, TransferError } from "../types/index";

interface RequestMoneyState {
  loading: boolean;
  error: TransferError | null;
  success: boolean;
}

interface UseRequestMoneyResult extends RequestMoneyState {
  execute: (params: RequestMoneyParams) => Promise<TransferError | null>;
  reset: () => void;
}

export function useRequestMoney(): UseRequestMoneyResult {
  const [state, setState] = useState<RequestMoneyState>({
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(
    async (params: RequestMoneyParams): Promise<TransferError | null> => {
      setState({ loading: true, error: null, success: false });

      const result = await requestMoney(params);

      if (result.success) {
        setState({ loading: false, error: null, success: true });
        return null;
      } else {
        setState({ loading: false, error: result.error, success: false });
        return result.error;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ loading: false, error: null, success: false });
  }, []);

  return { ...state, execute, reset };
}
