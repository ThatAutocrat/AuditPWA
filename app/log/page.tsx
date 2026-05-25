import { Suspense } from "react";
import LogForm from "./LogForm";

export default function LogPage() {
  return (
    <Suspense fallback={<div style={{ padding: "48px 16px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>loading...</div>}>
      <LogForm />
    </Suspense>
  );
}
