import { createContext, useContext } from "react";

import {
  type GoalsScreenModel,
  useGoalsScreenModel,
} from "./useGoalsScreenModel";

const GoalsScreenContext = createContext<GoalsScreenModel | null>(null);

export function GoalsScreenProvider({ children }: { children: React.ReactNode }) {
  const screen = useGoalsScreenModel();

  return (
    <GoalsScreenContext.Provider value={screen}>
      {children}
    </GoalsScreenContext.Provider>
  );
}

export function useGoalsScreen() {
  const screen = useContext(GoalsScreenContext);
  if (!screen) {
    throw new Error("useGoalsScreen must be used within GoalsScreenProvider");
  }
  return screen;
}
