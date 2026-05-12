import { GoalsScreenProvider } from "./goals-screen/GoalsScreenProvider";
import { GoalsScreenView } from "./goals-screen/GoalsScreenView";

export default function GoalsScreen() {
  return (
    <GoalsScreenProvider>
      <GoalsScreenView />
    </GoalsScreenProvider>
  );
}
