"use client"

import { PageContainer } from "../../components/page-container";
import { MarketIntelligenceHub } from "../../components/market-intelligence/market-intelligence-hub";
import ProtectedRoute from "../../components/auth/protected-route";

export default function MarketIntelligencePage() {
  return (
    <ProtectedRoute>
      <PageContainer>
        <MarketIntelligenceHub />
      </PageContainer>
    </ProtectedRoute>
  );
}
