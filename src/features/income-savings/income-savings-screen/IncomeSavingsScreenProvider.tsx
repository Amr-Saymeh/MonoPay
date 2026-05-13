import { createContext, useContext } from "react";

import {
  type IncomeSavingsScreenModel,
  useIncomeSavingsScreenModel,
} from "./useIncomeSavingsScreenModel";

const IncomeSavingsScreenContext =
  createContext<IncomeSavingsScreenModel | null>(null);

export function IncomeSavingsScreenProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const screen = useIncomeSavingsScreenModel();

  return (
    <IncomeSavingsScreenContext.Provider value={screen}>
      {children}
    </IncomeSavingsScreenContext.Provider>
  );
}

export function useIncomeSavingsScreen() {
  const screen = useContext(IncomeSavingsScreenContext);
  if (!screen) {
    throw new Error(
      "useIncomeSavingsScreen must be used within IncomeSavingsScreenProvider",
    );
  }
  return screen;
}
