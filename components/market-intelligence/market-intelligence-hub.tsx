"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Search, History, TrendingUp, Building, Users, MapPin, LineChart, ArrowUpRight } from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { MarketAnalysis } from '@/types/perplexity';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function MarketIntelligenceHub() {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<MarketAnalysis | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    const history = localStorage.getItem('marketSearchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  const updateSearchHistory = (query: string) => {
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('marketSearchHistory', JSON.stringify(newHistory));
  };

  const fetchMarketData = async () => {
    if (!role) {
      setError('Please enter a job role');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/market-analysis?role=${encodeURIComponent(role)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }
      const data = await response.json();
      setMarketData(data);
      updateSearchHistory(role);
    } catch (err) {
      setError('Failed to fetch market data. Please try again.');
      console.error('Market data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatSalaryData = () => {
    if (!marketData) return [];
    return [
      { label: 'Minimum', salary: marketData.salary.min },
      { label: 'Average', salary: marketData.salary.average },
      { label: 'Maximum', salary: marketData.salary.max }
    ];
  };

  const formatWorkModelData = () => {
    if (!marketData) return [];
    return [
      { name: 'Remote', value: marketData.workModel.remote },
      { name: 'Hybrid', value: marketData.workModel.hybrid },
      { name: 'On-site', value: marketData.workModel.onsite }
    ];
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Market Intelligence Hub</h1>
        <p className="text-muted-foreground">
          Analyze market trends, salary data, and work models for any job role
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-[1fr_200px]">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter job role (e.g., Software Engineer)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="pl-9"
                onKeyDown={(e) => e.key === 'Enter' && fetchMarketData()}
              />
            </div>
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

          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-[400px] w-full" />
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-[200px]" />
                <Skeleton className="h-[200px]" />
              </div>
            </div>
          ) : marketData && (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="salary">Salary</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="industry">Industry</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="outlook">Outlook</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Market Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Growth Rate</span>
                            <span className="font-medium">{marketData.trends.growthRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">YoY Change</span>
                            <span className={`font-medium ${marketData.trends.yearOverYearChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {marketData.trends.yearOverYearChange}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Job Openings</span>
                            <span className="font-medium">{marketData.jobOpenings.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4" />
                        Top Specializations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {marketData.trends.topSpecializations.map((spec, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-muted-foreground">{spec.name}</span>
                            <span className="font-medium text-green-600">+{spec.growth}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="salary">
                <Card>
                  <CardHeader>
                    <CardTitle>Salary Distribution for {role}</CardTitle>
                    <CardDescription>
                      Minimum, average, and maximum salary ranges in USD
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={formatSalaryData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" />
                          <YAxis />
                          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                          <Bar dataKey="salary" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends">
                <Card>
                  <CardHeader>
                    <CardTitle>Market Trends</CardTitle>
                    <CardDescription>
                      Growth rates and specialization trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={marketData.trends.topSpecializations}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Bar dataKey="growth" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="industry">
                <Card>
                  <CardHeader>
                    <CardTitle>Industry Demand</CardTitle>
                    <CardDescription>
                      Distribution of job demand across industries
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={marketData.industryDemand}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name} ${value}%`}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="demand"
                          >
                            {marketData.industryDemand.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="location">
                <Card>
                  <CardHeader>
                    <CardTitle>Geographical Distribution</CardTitle>
                    <CardDescription>
                      Job concentration across major cities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={marketData.geographicalHotspots}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="city" />
                          <YAxis />
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Bar dataKey="jobShare" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="outlook">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LineChart className="h-4 w-4" />
                        Market Outlook
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Projected Growth</span>
                          <span className="font-medium text-green-600">
                            +{marketData.marketOutlook.projectedGrowth}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Key Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {marketData.marketOutlook.keyTrends.map((trend, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                            <span>{trend}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Search History Sidebar */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-4 w-4" />
              Recent Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              {searchHistory.length > 0 ? (
                <div className="space-y-2">
                  {searchHistory.map((query, i) => (
                    <Button
                      key={i}
                      variant="ghost"
                      className="w-full justify-start text-left"
                      onClick={() => {
                        setRole(query);
                        fetchMarketData();
                      }}
                    >
                      {query}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent searches</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
