import { Suspense } from "react";
import EmailGateClient from "./EmailGateClient";

// Forces Next to treat this route as dynamic (no static prerender)
export const dynamic = "force-dynamic";

export default function EmailGatePage() {
  return (
    <Suspense fallback={null}>
      <EmailGateClient />
    </Suspense>
  );
}
