"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';
import { 
  Loader2,
  MessageSquarePlus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from '../ui/use-toast';
import Chat from '../chat/chat';
import type { MarketAnalysis, Source } from '../../types/perplexity';

export function MarketIntelligenceHub(): JSX.Element {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [showAllSources, setShowAllSources] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const fetchMarketData = async () => {
    if (!role.trim()) {
      toast({ title: 'Please enter a role to analyze', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/market-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch market data');
      }

      const data = await response.json();
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }

      setAnalysis(data);
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast({ 
        title: error instanceof Error ? error.message : 'Failed to fetch market data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const analysisRef = useRef<HTMLDivElement>(null);
  const [loadingQuestion, setLoadingQuestion] = useState<string | null>(null);

  const handleRelatedQuestion = async (question: string) => {
    setLoadingQuestion(question);
    setRole(question);
    await fetchMarketData();
    setLoadingQuestion(null);
    
    // Scroll to top of analysis with smooth animation
    analysisRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8 max-w-4xl">
        <div className="space-y-6">
          <div ref={analysisRef} className="flex items-center justify-between">
            <h1 className="text-2xl font-medium">{role ? `${role} Market Analysis` : 'Market Intelligence'}</h1>
          </div>

          {!analysis && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium">
                    Enter a role to analyze
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g., Software Engineer, Product Manager"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !loading) {
                          fetchMarketData();
                        }
                      }}
                    />
                    <Button
                      onClick={fetchMarketData}
                      disabled={loading || !role}
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
              </div>
            </Card>
          )}

          {analysis && (
            <>
              {/* Sources Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-muted-foreground">Sources</h2>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setShowAllSources(!showAllSources)}
                  >
                    {showAllSources ? (
                      <>
                        Show less
                        <ChevronUp className="ml-1 h-3 w-3" />
                      </>
                    ) : (
                      <>
                        Show all {analysis.sources.length} sources
                        <ChevronDown className="ml-1 h-3 w-3" />
                      </>
                    )}
                  </Button>
                </div>
                <div className={`grid gap-4 ${showAllSources ? 'grid-cols-1' : 'grid-cols-3'}`}>
                  {(showAllSources ? analysis.sources : analysis.sources.slice(0, 3)).map((source, index) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="w-4 h-4 mt-1 relative">
                        <Image
                          src={`https://www.google.com/s2/favicons?domain=${new URL(source.url).hostname}&sz=32`}
                          alt=""
                          width={16}
                          height={16}
                          className="object-contain"
                          priority
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm line-clamp-2">{source.title}</p>
                        <p className="text-xs text-muted-foreground">{new URL(source.url).hostname}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Answer Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs">A</span>
                  </div>
                  <h2 className="text-sm font-medium">Answer</h2>
                </div>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <p className="text-base leading-relaxed">{analysis.overview}</p>

                  <h3>Market Growth and Projections</h3>
                  <p className="text-base leading-relaxed">{analysis.demandAndOpportunities.content}</p>

                  <h3>Regional Market Insights</h3>
                  <ul>
                    {analysis.salaryRange.locationFactors.content.split('.').filter(Boolean).map((point, index) => (
                      <li key={index}>{point.trim()}.</li>
                    ))}
                  </ul>

                  <h3>Talent Demand and Compensation</h3>
                  <p className="text-base leading-relaxed">{analysis.salaryRange.content}</p>
                  <ul>
                    <li>
                      Average hourly rate: ${analysis.salaryRange.rates.hourlyRate.average}/hr (range: ${analysis.salaryRange.rates.hourlyRate.min}-${analysis.salaryRange.rates.hourlyRate.max})
                    </li>
                    <li>
                      Annual salary range: ${analysis.salaryRange.rates.annualRange.min.toLocaleString()}-${analysis.salaryRange.rates.annualRange.max.toLocaleString()}
                    </li>
                    <li>
                      Senior level (${analysis.salaryRange.rates.seniorRange.yearsExperience}+ years): ${analysis.salaryRange.rates.seniorRange.min.toLocaleString()}-${analysis.salaryRange.rates.seniorRange.max.toLocaleString()}
                    </li>
                  </ul>

                  <h3>Skills in Demand</h3>
                  <p className="text-base leading-relaxed">{analysis.skillsInDemand.content}</p>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4>Core Skills</h4>
                      <ul>
                        {analysis.skillsInDemand.skills.core.map((skill, index) => (
                          <li key={index}>{skill}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4>Technical Skills</h4>
                      <ul>
                        {analysis.skillsInDemand.skills.technical.map((skill, index) => (
                          <li key={index}>
                            {skill.skill} ({skill.demandPercentage}% demand)
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Related Questions */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Related</h3>
                <div className="space-y-2">
                  {analysis.relatedQuestions.map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto py-4 px-4 relative"
                      onClick={() => handleRelatedQuestion(item.question)}
                      disabled={loading || loadingQuestion === item.question}
                    >
                      <div className="flex items-start gap-2">
                        {loadingQuestion === item.question ? (
                          <Loader2 className="w-4 h-4 mt-1 flex-shrink-0 animate-spin" />
                        ) : (
                          <MessageSquarePlus className="w-4 h-4 mt-1 flex-shrink-0" />
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm">{item.question}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </div>
                      </div>
                      {loadingQuestion === item.question && (
                        <div className="absolute inset-0 bg-primary/5 rounded-lg" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Chat Section */}
              <div className="mt-8">
                <Chat 
                  apiEndpoint="/api/chat"
                  systemPrompt={`You are a market research expert. The user has just viewed an analysis about ${role}. Help them understand the market data and answer any follow-up questions they might have.`}
                  initialMessage="Ask me any follow-up questions about the market analysis."
                  className="min-h-[400px]"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
