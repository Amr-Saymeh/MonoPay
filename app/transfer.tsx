import { Redirect } from "expo-router";

export default function TransferRoute() {
  return <Redirect href={"/send-money" as any} />;
}
