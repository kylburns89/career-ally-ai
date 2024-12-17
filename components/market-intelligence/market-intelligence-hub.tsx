"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Loader2, Search, ChevronDown, ChevronUp, ExternalLink, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { MarketAnalysis, Source } from '../../types/perplexity';
import { useAuth } from '../../hooks/use-auth';
import Image from 'next/image';

const SourceCard = ({ source, isActive }: { source: Source; isActive: boolean }) => {
  return (
    <Card className={`mb-2 transition-all bg-background ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative w-5 h-5">
            <Image 
              src={source.icon} 
              alt={source.title}
              className="rounded-full"
              width={20}
              height={20}
              onError={(e) => {
                const url = new URL(source.url);
                // @ts-ignore - TypeScript doesn't know about HTMLImageElement's src property
                e.currentTarget.src = `${url.protocol}//${url.hostname}/favicon.ico`;
              }}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{source.title}</h3>
            <p className="text-sm text-muted-foreground">{source.description}</p>
          </div>
          <a 
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export function MarketIntelligenceHub(): JSX.Element {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<MarketAnalysis | null>(null);
  const [showAllSources, setShowAllSources] = useState(false);
  const [activeCitation, setActiveCitation] = useState<number | null>(null);
  const [streamedText, setStreamedText] = useState('');

  // Debug log auth state changes
  useEffect(() => {
    console.log('Market Intelligence Hub auth state:', { userId: user?.id, authLoading });
  }, [user, authLoading]);

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleCitationClick = (num: number) => {
    setActiveCitation(num === activeCitation ? null : num);
    if (!showAllSources) {
      setShowAllSources(true);
    }
    // Scroll the source into view
    const source = marketData?.sources?.find(s => s.id === num);
    if (source) {
      document.getElementById(`source-${num}`)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderCitation = (num: number) => (
    <button
      onClick={() => handleCitationClick(num)}
      className={`inline-flex items-center justify-center w-4 h-4 text-xs font-medium rounded-full 
        ${activeCitation === num ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-500 hover:bg-blue-200'}`}
    >
      {num}
    </button>
  );

  const visibleSources = marketData?.sources 
    ? (showAllSources ? marketData.sources : marketData.sources.slice(0, 3))
    : [];

  const fetchMarketData = async () => {
    if (!role.trim()) {
      toast.error('Please enter a job role');
      return;
    }

    setLoading(true);
    setError(null);
    setStreamedText('');
    setMarketData(null);

    try {
      console.log('Starting market data fetch:', { userId: user?.id, role });
      const response = await fetch(`/api/market-analysis?role=${encodeURIComponent(role)}`);
      console.log('Market analysis response:', { status: response.status });

      if (response.status === 401) {
        console.log('Received 401 from API');
        throw new Error('Session expired. Please sign in again.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.log('API error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch market data');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let accumulatedText = '';

      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        // Process each line
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.slice(6); // Remove 'data: ' prefix
            
            if (content === '[DONE]') {
              // Try to parse the complete accumulated text as JSON
              try {
                if (accumulatedText) {
                  const data = JSON.parse(accumulatedText) as MarketAnalysis;
                  setMarketData(data);
                  setShowAllSources(false);
                  setActiveCitation(null);
                }
              } catch (e) {
                console.error('Failed to parse final JSON:', e);
              }
              continue;
            }

            // Update the streamed text display and accumulate for JSON parsing
            setStreamedText((prev: string) => prev + content);
            accumulatedText += content;
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch market data';
      console.error('Market data fetch error:', { error: err, message: errorMessage });
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while auth is being checked
  if (authLoading) {
    console.log('Rendering loading state');
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="space-y-6">
        {/* Search Section */}
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">Market Intelligence Hub</h1>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter job role (e.g., Software Engineer)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="pl-9"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading && !authLoading) {
                    fetchMarketData();
                  }
                }}
              />
            </div>
            <Button 
              onClick={fetchMarketData}
              disabled={loading || !role || authLoading}
              className="min-w-[100px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                'Analyze'
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Card className="p-4 border-destructive">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {loading && !marketData && (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        )}

        {loading && streamedText && (
          <div className="prose prose-slate max-w-none">
            <pre className="whitespace-pre-wrap font-mono text-xs opacity-50">
              {streamedText}
            </pre>
          </div>
        )}

        {marketData && (
          <div className="space-y-6">
            {/* Sources */}
            <div className="relative z-10">
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-background">
                  <span className="text-sm font-medium">Sources</span>
                  {marketData.sources && marketData.sources.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllSources(!showAllSources)}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      {showAllSources ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Hide sources
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          View all {marketData.sources.length} sources
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <div className="space-y-2 relative bg-background">
                  {visibleSources.map((source) => (
                    <div id={`source-${source.id}`} key={source.id} className="relative">
                      <SourceCard source={source} isActive={activeCitation === source.id} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Market Analysis Content */}
            <div className="prose prose-slate max-w-none relative z-0">
              {marketData.overview && (
                <p className="text-lg leading-relaxed">{marketData.overview}</p>
              )}

              {marketData.demandAndOpportunities && (
                <>
                  <h3 className="text-xl font-semibold mt-6 mb-3">Demand and Opportunities</h3>
                  <p className="leading-relaxed">
                    {marketData.demandAndOpportunities.content}
                    {marketData.demandAndOpportunities.citations?.map((citation, index) => (
                      <span key={index} className="ml-1">{renderCitation(citation)}</span>
                    ))}
                  </p>
                </>
              )}

              {marketData.salaryRange && (
                <>
                  <h3 className="text-xl font-semibold mt-6 mb-3">Salary Range</h3>
                  {marketData.salaryRange.content && (
                    <p className="leading-relaxed mb-4">
                      {marketData.salaryRange.content}
                    </p>
                  )}
                  <ul className="space-y-3 list-none pl-0">
                    {marketData.salaryRange.rates?.hourlyRate && (
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>
                          Average hourly rate: {formatSalary(marketData.salaryRange.rates.hourlyRate.average)} 
                          (ranging from {formatSalary(marketData.salaryRange.rates.hourlyRate.min)} to {formatSalary(marketData.salaryRange.rates.hourlyRate.max)})
                          <span className="ml-1">{renderCitation(marketData.salaryRange.rates.hourlyRate.citation)}</span>
                        </span>
                      </li>
                    )}
                    {marketData.salaryRange.rates?.annualRange && (
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>
                          Annual salary range: {formatSalary(marketData.salaryRange.rates.annualRange.min)} to {formatSalary(marketData.salaryRange.rates.annualRange.max)}, 
                          with the majority falling between {formatSalary(marketData.salaryRange.rates.annualRange.commonMin)} and {formatSalary(marketData.salaryRange.rates.annualRange.commonMax)}
                          <span className="ml-1">{renderCitation(marketData.salaryRange.rates.annualRange.citation)}</span>
                        </span>
                      </li>
                    )}
                    {marketData.salaryRange.rates?.seniorRange && (
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>
                          Senior developers ({marketData.salaryRange.rates.seniorRange.yearsExperience}+ years experience): 
                          {formatSalary(marketData.salaryRange.rates.seniorRange.min)} to {formatSalary(marketData.salaryRange.rates.seniorRange.max)}
                          <span className="ml-1">{renderCitation(marketData.salaryRange.rates.seniorRange.citation)}</span>
                        </span>
                      </li>
                    )}
                  </ul>

                  {marketData.salaryRange.locationFactors && (
                    <p className="leading-relaxed mt-4">
                      {marketData.salaryRange.locationFactors.content}
                      <span className="ml-1">{renderCitation(marketData.salaryRange.locationFactors.citation)}</span>
                    </p>
                  )}
                  {marketData.salaryRange.industryFactors && (
                    <p className="leading-relaxed">
                      {marketData.salaryRange.industryFactors.content}
                      <span className="ml-1">{renderCitation(marketData.salaryRange.industryFactors.citation)}</span>
                    </p>
                  )}
                </>
              )}

              {marketData.skillsInDemand && (
                <>
                  <h3 className="text-xl font-semibold mt-6 mb-3">Skills in Demand</h3>
                  {marketData.skillsInDemand.content && (
                    <p className="leading-relaxed mb-4">{marketData.skillsInDemand.content}</p>
                  )}
                  <ul className="space-y-3 list-none pl-0">
                    {marketData.skillsInDemand.skills?.core?.map((skill, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        {skill}
                      </li>
                    ))}
                    {marketData.skillsInDemand.skills?.technical?.map((skill, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>
                          {skill.skill} ({skill.demandPercentage}% of job postings)
                          <span className="ml-1">{renderCitation(skill.citation)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {marketData.careerGrowth && (
                <>
                  <h3 className="text-xl font-semibold mt-6 mb-3">Career Growth</h3>
                  {marketData.careerGrowth.content && (
                    <p className="leading-relaxed mb-4">{marketData.careerGrowth.content}</p>
                  )}
                  <ul className="space-y-3 list-none pl-0">
                    {marketData.careerGrowth.paths?.map((path, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>
                          {path.role}: {formatSalary(path.salary)}, {path.description}
                          <span className="ml-1">{renderCitation(path.citation)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {marketData.marketOutlook && (
                <>
                  <h3 className="text-xl font-semibold mt-6 mb-3">Market Outlook</h3>
                  <p className="leading-relaxed mb-4">
                    {marketData.marketOutlook.content}
                    <span className="ml-1">{renderCitation(marketData.marketOutlook.citation)}</span>
                  </p>
                  <ul className="space-y-3 list-none pl-0">
                    {marketData.marketOutlook.keyPoints?.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {marketData.certifications && (
                <div className="mt-6">
                  <p className="leading-relaxed">
                    {marketData.certifications.content}
                    <span className="ml-1">{renderCitation(marketData.certifications.citation)}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
