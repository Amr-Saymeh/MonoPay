import { useCallback, useState } from "react";

export function useContributionError() {
  const [errorTitle, setErrorTitle] = useState("");
  const [errorDescription, setErrorDescription] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);

  const showError = useCallback((title: string, description: string) => {
    setErrorTitle(title);
    setErrorDescription(description);
    setErrorVisible(true);
  }, []);

  const closeError = useCallback(() => setErrorVisible(false), []);

  return {
    errorTitle,
    errorDescription,
    errorVisible,
    showError,
    closeError,
  };
}

