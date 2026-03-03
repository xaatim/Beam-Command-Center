import UserQueryClient from "@/components/UseQueryClient";
import { ReactNode } from "react";

export default function layout({ children }: { children: ReactNode }) {
  return (
    <UserQueryClient>
      <main className="h-full w-full flex flex-col justify-center items-center ">
        {children}
      </main>
    </UserQueryClient>
  );
}
