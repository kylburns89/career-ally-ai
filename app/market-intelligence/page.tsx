import { PageContainer } from "../../components/page-container";
import { MarketIntelligenceHub } from "../../components/market-intelligence/market-intelligence-hub";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/auth-options";

export default async function MarketIntelligencePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <PageContainer>
      <MarketIntelligenceHub />
    </PageContainer>
  );
}
