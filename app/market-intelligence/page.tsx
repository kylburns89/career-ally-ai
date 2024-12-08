import { PageContainer } from "@/components/page-container";
import { MarketIntelligenceHub } from "@/components/market-intelligence/market-intelligence-hub";

export const metadata = {
  title: 'Market Intelligence Hub | Career Ally AI',
  description: 'Analyze real-time job market data, salary trends, and industry insights to make informed career decisions.',
};

export default function MarketIntelligencePage() {
  return (
    <PageContainer>
      <MarketIntelligenceHub />
    </PageContainer>
  );
}
