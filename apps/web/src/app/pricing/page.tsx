import { Pricing } from "@/components/pricing";
import { AppHeader } from "@/components/app-header";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="pt-16">
        <Pricing />
      </main>
    </div>
  );
}
