import { checkUser } from "@/lib/checkUser";
import HeaderClient from "./header-client";

export default async function HeaderServer() {
  await checkUser(); // This runs server-side
  return <HeaderClient />;
}
