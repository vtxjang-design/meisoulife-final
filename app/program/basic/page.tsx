"use client";

import { BasicHome } from "@/components/basic-home";
import { ProgramAccessGuard } from "@/components/program-access-guard";

export default function BasicProgramPage() {
  return (
    <ProgramAccessGuard>
      <BasicHome />
    </ProgramAccessGuard>
  );
}
