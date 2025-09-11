/**
 * Predictive Analytics Engine - Advanced trending analysis and success probability forecasting
 * Enhances existing analytics without adding new features
 */

interface TrendPoint {
    date: string;
    value: number;
    confidence: number;
}

interface PredictiveInsight {
    type: 'trend' | 'forecast' | 'anomaly' | 'opportunity';
    title: string;
    description: string;
    confidence: number;
    impact: 'high' | 'medium' | 'low';
    timeframe: string;
    data: TrendPoint[];
    recommendation: string;
}

interface SuccessProbability {
    tenderId: string;
    probability: number;
    factors: {
        factor: string;
        weight: number;
        value: number;
        impact: 'positive' | 'negative' | 'neutral';
    }[];
    confidence: number;
    benchmarkData: {
        industryAverage: number;
        companyAverage: number;
        similarTenders: number;
    };
}

interface MarketTrend {
    category: string;
    direction: 'rising' | 'falling' | 'stable';
    strength: number;
    velocity: number;
    duration: number;
    prediction: {
        nextMonth: number;
        nextQuarter: number;
        nextYear: number;
    };
}

class PredictiveAnalyticsEngine {
    private readonly minDataPoints = 3;
    private readonly confidenceThreshold = 0.6;
    private readonly trendSmoothingFactor = 0.3;

    /**
     * Analyze trends and generate predictive insights
     */
    analyzeTrends(tenders: any[]): PredictiveInsight[] {
        if (tenders.length < this.minDataPoints) {
            return [];
        }

        const insights: PredictiveInsight[] = [];

        // Win rate trend analysis
        const winRateTrend = this.calculateWinRateTrend(tenders);
        if (winRateTrend) {
            insights.push(winRateTrend);
        }

        // Market opportunity analysis
        const opportunityTrend = this.calculateOpportunityTrend(tenders);
        if (opportunityTrend) {
            insights.push(opportunityTrend);
        }

        // Risk pattern analysis
        const riskTrend = this.calculateRiskTrend(tenders);
        if (riskTrend) {
            insights.push(riskTrend);
        }

        // Seasonal pattern detection
        const seasonalInsights = this.detectSeasonalPatterns(tenders);
        insights.push(...seasonalInsights);

        return insights.sort((a, b) => b.confidence - a.confidence);
    }

    /**
     * Calculate success probability for a specific tender
     */
    calculateSuccessProbability(tender: any, historicalTenders: any[], companyProfile: any): SuccessProbability {
        const factors = this.extractSuccessFactors(tender, historicalTenders, companyProfile);
        const probability = this.computeProbability(factors);
        const confidence = this.calculateConfidence(factors, historicalTenders.length);
        const benchmarkData = this.calculateBenchmarks(tender, historicalTenders);

        return {
            tenderId: tender.id,
            probability,
            factors,
            confidence,
            benchmarkData
        };
    }

    /**
     * Detect market trends across different categories
     */
    detectMarketTrends(tenders: any[]): MarketTrend[] {
        const trends: MarketTrend[] = [];
        
        // Group tenders by category/industry
        const categories = this.groupTendersByCategory(tenders);
        
        for (const [category, categoryTenders] of Object.entries(categories)) {
            const trend = this.analyzeCategoryTrend(category, categoryTenders as any[]);
            if (trend) {
                trends.push(trend);
            }
        }

        return trends;
    }

    /**
     * Calculate win rate trend
     */
    private calculateWinRateTrend(tenders: any[]): PredictiveInsight | null {
        const monthlyData = this.groupTendersByMonth(tenders);
        const winRates: TrendPoint[] = [];

        for (const [month, monthTenders] of Object.entries(monthlyData)) {
            const totalTenders = (monthTenders as any[]).length;
            const wonTenders = (monthTenders as any[]).filter(t => t.status === 'Won').length;
            const winRate = totalTenders > 0 ? (wonTenders / totalTenders) * 100 : 0;
            
            winRates.push({
                date: month,
                value: winRate,
                confidence: Math.min(totalTenders / 5, 1) // Higher confidence with more data
            });
        }

        if (winRates.length < 2) return null;

        const trend = this.calculateTrendDirection(winRates);
        const forecast = this.forecastNextPeriod(winRates);

        return {
            type: 'trend',
            title: 'G\'alaba foizi tendentsiyasi',
            description: `G\'alaba foizi ${trend.direction === 'rising' ? 'o\'sib' : trend.direction === 'falling' ? 'kamayib' : 'barqaror'} bormoqda. Keyingi oy uchun prognoz: ${forecast.toFixed(1)}%`,
            confidence: this.calculateTrendConfidence(winRates),
            impact: trend.strength > 0.3 ? 'high' : trend.strength > 0.1 ? 'medium' : 'low',
            timeframe: 'Keyingi oy',
            data: winRates,
            recommendation: this.generateWinRateRecommendation(trend, forecast)
        };
    }

    /**
     * Calculate opportunity trend
     */
    private calculateOpportunityTrend(tenders: any[]): PredictiveInsight | null {
        const monthlyData = this.groupTendersByMonth(tenders);
        const opportunityData: TrendPoint[] = [];

        for (const [month, monthTenders] of Object.entries(monthlyData)) {
            const avgOpportunity = (monthTenders as any[]).reduce((sum, t) => sum + (t.opportunityScore || 0), 0) / (monthTenders as any[]).length;
            
            opportunityData.push({
                date: month,
                value: avgOpportunity,
                confidence: Math.min((monthTenders as any[]).length / 3, 1)
            });
        }

        if (opportunityData.length < 2) return null;

        const trend = this.calculateTrendDirection(opportunityData);
        const forecast = this.forecastNextPeriod(opportunityData);

        return {
            type: 'forecast',
            title: 'Bozor imkoniyatlari prognozi',
            description: `Bozor imkoniyatlari ${trend.direction === 'rising' ? 'yaxshilanib' : trend.direction === 'falling' ? 'yomonlashib' : 'barqaror'} bormoqda. Keyingi oy: ${forecast.toFixed(1)} ball`,
            confidence: this.calculateTrendConfidence(opportunityData),
            impact: Math.abs(trend.strength) > 0.2 ? 'high' : 'medium',
            timeframe: 'Keyingi oy',
            data: opportunityData,
            recommendation: this.generateOpportunityRecommendation(trend, forecast)
        };
    }

    /**
     * Calculate risk trend
     */
    private calculateRiskTrend(tenders: any[]): PredictiveInsight | null {
        const monthlyData = this.groupTendersByMonth(tenders);
        const riskData: TrendPoint[] = [];

        for (const [month, monthTenders] of Object.entries(monthlyData)) {
            const avgRisk = (monthTenders as any[]).reduce((sum, t) => sum + (t.riskScore || 0), 0) / (monthTenders as any[]).length;
            
            riskData.push({
                date: month,
                value: avgRisk,
                confidence: Math.min((monthTenders as any[]).length / 3, 1)
            });
        }

        if (riskData.length < 2) return null;

        const trend = this.calculateTrendDirection(riskData);
        const forecast = this.forecastNextPeriod(riskData);

        return {
            type: 'trend',
            title: 'Risk darajasi tendentsiyasi',
            description: `Risk darajasi ${trend.direction === 'rising' ? 'oshib' : trend.direction === 'falling' ? 'kamayib' : 'barqaror'} bormoqda. Prognoz: ${forecast.toFixed(1)} ball`,
            confidence: this.calculateTrendConfidence(riskData),
            impact: trend.direction === 'rising' ? 'high' : 'medium',
            timeframe: 'Keyingi oy',
            data: riskData,
            recommendation: this.generateRiskRecommendation(trend, forecast)
        };
    }

    /**
     * Detect seasonal patterns
     */
    private detectSeasonalPatterns(tenders: any[]): PredictiveInsight[] {
        const insights: PredictiveInsight[] = [];
        const monthlyActivity = this.calculateMonthlyActivity(tenders);
        
        // Find peak and low seasons
        const sorted = Object.entries(monthlyActivity).sort(([,a], [,b]) => b - a);
        const peakMonth = sorted[0];
        const lowMonth = sorted[sorted.length - 1];

        if (peakMonth[1] > lowMonth[1] * 1.5) { // Significant seasonal variation
            insights.push({
                type: 'opportunity',
                title: 'Mavsumiy imkoniyat',
                description: `${this.getMonthName(peakMonth[0])} oyida tender faolligi yuqori bo'ladi. Hozir tayyorgarlik ko'ring.`,
                confidence: 0.8,
                impact: 'medium',
                timeframe: `${this.getMonthName(peakMonth[0])} oyi`,
                data: Object.entries(monthlyActivity).map(([month, value]) => ({
                    date: month,
                    value: value as number,
                    confidence: 0.8
                })),
                recommendation: `${this.getMonthName(peakMonth[0])} oyiga strategik tayyorgarlik ko'ring va resurslarni muvofiqlashtiring.`
            });
        }

        return insights;
    }

    /**
     * Extract success factors for probability calculation
     */
    private extractSuccessFactors(tender: any, historicalTenders: any[], companyProfile: any): SuccessProbability['factors'] {
        const factors: SuccessProbability['factors'] = [];

        // Historical win rate factor
        const wonTenders = historicalTenders.filter(t => t.status === 'Won').length;
        const totalTenders = historicalTenders.length;
        const winRate = totalTenders > 0 ? wonTenders / totalTenders : 0.5;
        
        factors.push({
            factor: 'Tarixiy g\'alaba foizi',
            weight: 0.25,
            value: winRate,
            impact: winRate > 0.5 ? 'positive' : 'negative'
        });

        // Opportunity score factor
        const opportunityScore = (tender.opportunityScore || 50) / 100;
        factors.push({
            factor: 'Imkoniyat darajasi',
            weight: 0.20,
            value: opportunityScore,
            impact: opportunityScore > 0.6 ? 'positive' : opportunityScore < 0.4 ? 'negative' : 'neutral'
        });

        // Risk score factor (inverted)
        const riskScore = (tender.riskScore || 50) / 100;
        factors.push({
            factor: 'Risk darajasi',
            weight: 0.15,
            value: 1 - riskScore, // Lower risk = higher success probability
            impact: riskScore < 0.4 ? 'positive' : riskScore > 0.6 ? 'negative' : 'neutral'
        });

        // Company experience factor
        const sameCustomerTenders = historicalTenders.filter(t => 
            t.lotPassport?.customerName === tender.lotPassport?.customerName
        );
        const customerExperience = sameCustomerTenders.length > 0 ? 
            sameCustomerTenders.filter(t => t.status === 'Won').length / sameCustomerTenders.length : 0.5;
        
        factors.push({
            factor: 'Mijoz bilan tajriba',
            weight: 0.15,
            value: customerExperience,
            impact: customerExperience > 0.5 ? 'positive' : 'negative'
        });

        // Optimal pricing strategy factor
        const optimalStrategy = tender.pricingStrategy?.find((p: any) => p.strategy === 'Optimal');
        const optimalProbability = optimalStrategy ? 
            parseInt(optimalStrategy.winProbability.replace('%', '')) / 100 : 0.5;
        
        factors.push({
            factor: 'Optimal narx strategiyasi',
            weight: 0.25,
            value: optimalProbability,
            impact: optimalProbability > 0.6 ? 'positive' : optimalProbability < 0.4 ? 'negative' : 'neutral'
        });

        return factors;
    }

    /**
     * Compute weighted probability from factors
     */
    private computeProbability(factors: SuccessProbability['factors']): number {
        const weightedSum = factors.reduce((sum, factor) => sum + (factor.value * factor.weight), 0);
        return Math.min(Math.max(weightedSum * 100, 5), 95); // Clamp between 5% and 95%
    }

    /**
     * Calculate confidence based on data quality
     */
    private calculateConfidence(factors: SuccessProbability['factors'], dataPoints: number): number {
        const dataConfidence = Math.min(dataPoints / 10, 1); // More data = higher confidence
        const factorConfidence = factors.reduce((sum, f) => sum + f.weight, 0); // Complete factors = higher confidence
        return Math.min(dataConfidence * factorConfidence, 0.95);
    }

    /**
     * Calculate benchmark data
     */
    private calculateBenchmarks(tender: any, historicalTenders: any[]): SuccessProbability['benchmarkData'] {
        const totalTenders = historicalTenders.length;
        const wonTenders = historicalTenders.filter(t => t.status === 'Won').length;
        const companyAverage = totalTenders > 0 ? (wonTenders / totalTenders) * 100 : 50;

        // Similar tenders based on opportunity and risk scores
        const similarTenders = historicalTenders.filter(t => {
            const opportunityDiff = Math.abs((t.opportunityScore || 50) - (tender.opportunityScore || 50));
            const riskDiff = Math.abs((t.riskScore || 50) - (tender.riskScore || 50));
            return opportunityDiff < 20 && riskDiff < 20;
        });

        const similarWonTenders = similarTenders.filter(t => t.status === 'Won').length;
        const similarAverage = similarTenders.length > 0 ? (similarWonTenders / similarTenders.length) * 100 : companyAverage;

        return {
            industryAverage: 35, // Industry benchmark (could be made dynamic)
            companyAverage,
            similarTenders: similarAverage
        };
    }

    // Helper methods
    private groupTendersByMonth(tenders: any[]): Record<string, any[]> {
        return tenders.reduce((groups, tender) => {
            const date = new Date(tender.analysisDate);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            if (!groups[monthKey]) groups[monthKey] = [];
            groups[monthKey].push(tender);
            return groups;
        }, {} as Record<string, any[]>);
    }

    private groupTendersByCategory(tenders: any[]): Record<string, any[]> {
        return tenders.reduce((groups, tender) => {
            const category = this.extractCategory(tender);
            if (!groups[category]) groups[category] = [];
            groups[category].push(tender);
            return groups;
        }, {} as Record<string, any[]>);
    }

    private extractCategory(tender: any): string {
        const itemName = tender.lotPassport?.itemName || '';
        
        // Simple categorization based on keywords
        if (itemName.toLowerCase().includes('it') || itemName.toLowerCase().includes('kompyuter')) return 'IT';
        if (itemName.toLowerCase().includes('qurilish') || itemName.toLowerCase().includes('bino')) return 'Qurilish';
        if (itemName.toLowerCase().includes('transport') || itemName.toLowerCase().includes('avtomobil')) return 'Transport';
        if (itemName.toLowerCase().includes('oziq-ovqat') || itemName.toLowerCase().includes('mahsulot')) return 'Oziq-ovqat';
        
        return 'Boshqa';
    }

    private calculateTrendDirection(data: TrendPoint[]): { direction: 'rising' | 'falling' | 'stable'; strength: number } {
        if (data.length < 2) return { direction: 'stable', strength: 0 };

        const firstValue = data[0].value;
        const lastValue = data[data.length - 1].value;
        const change = (lastValue - firstValue) / firstValue;

        if (Math.abs(change) < 0.05) {
            return { direction: 'stable', strength: Math.abs(change) };
        }

        return {
            direction: change > 0 ? 'rising' : 'falling',
            strength: Math.abs(change)
        };
    }

    private forecastNextPeriod(data: TrendPoint[]): number {
        if (data.length < 2) return data[0]?.value || 0;

        // Simple linear regression for forecast
        const n = data.length;
        const sumX = data.reduce((sum, _, i) => sum + i, 0);
        const sumY = data.reduce((sum, point) => sum + point.value, 0);
        const sumXY = data.reduce((sum, point, i) => sum + i * point.value, 0);
        const sumXX = data.reduce((sum, _, i) => sum + i * i, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return slope * n + intercept; // Forecast for next period
    }

    private calculateTrendConfidence(data: TrendPoint[]): number {
        const avgConfidence = data.reduce((sum, point) => sum + point.confidence, 0) / data.length;
        const dataQuality = Math.min(data.length / 6, 1); // More data points = higher confidence
        return Math.min(avgConfidence * dataQuality, 0.95);
    }

    private calculateMonthlyActivity(tenders: any[]): Record<string, number> {
        const monthlyCount: Record<string, number> = {};
        
        tenders.forEach(tender => {
            const date = new Date(tender.analysisDate);
            const month = date.getMonth().toString();
            monthlyCount[month] = (monthlyCount[month] || 0) + 1;
        });

        return monthlyCount;
    }

    private analyzeCategoryTrend(category: string, tenders: any[]): MarketTrend | null {
        if (tenders.length < 3) return null;

        const monthlyData = this.groupTendersByMonth(tenders);
        const trendData = Object.values(monthlyData).map(monthTenders => monthTenders.length);
        
        if (trendData.length < 2) return null;

        const direction = this.calculateTrendDirection(
            trendData.map((value, i) => ({ date: i.toString(), value, confidence: 1 }))
        );

        return {
            category,
            direction: direction.direction,
            strength: direction.strength,
            velocity: direction.strength * 10, // Convert to velocity scale
            duration: trendData.length,
            prediction: {
                nextMonth: this.forecastNextPeriod(trendData.map((value, i) => ({ date: i.toString(), value, confidence: 1 }))),
                nextQuarter: 0, // Simplified for now
                nextYear: 0
            }
        };
    }

    private getMonthName(monthNumber: string): string {
        const months = [
            'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
            'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
        ];
        return months[parseInt(monthNumber)] || 'Noma\'lum';
    }

    private generateWinRateRecommendation(trend: any, forecast: number): string {
        if (trend.direction === 'rising') {
            return 'G\'alaba foizi o\'sib bormoqda. Hozirgi strategiyani davom ettiring va yangi imkoniyatlardan foydalaning.';
        } else if (trend.direction === 'falling') {
            return 'G\'alaba foizi pasayib bormoqda. Strategiyani qayta ko\'rib chiqing va raqobat ustunliklarini kuchaytiring.';
        }
        return 'G\'alaba foizi barqaror. Hozirgi sifatni saqlang va yangi strategiyalarni sinab ko\'ring.';
    }

    private generateOpportunityRecommendation(trend: any, forecast: number): string {
        if (trend.direction === 'rising') {
            return 'Bozor imkoniyatlari oshib bormoqda. Resurslarni kengaytiring va faol ishtirok eting.';
        } else if (trend.direction === 'falling') {
            return 'Bozor imkoniyatlari kamayib bormoqda. Strategik rejalashtirish va sifat yaxshilash kerak.';
        }
        return 'Bozor imkoniyatlari barqaror. Hozirgi pozitsiyani mustahkamlang.';
    }

    private generateRiskRecommendation(trend: any, forecast: number): string {
        if (trend.direction === 'rising') {
            return 'Risk darajasi oshib bormoqda. Risk boshqaruv strategiyalarini kuchaytiring va ehtiyotkor bo\'ling.';
        } else if (trend.direction === 'falling') {
            return 'Risk darajasi kamayib bormoqda. Bu ijobiy trend - hozirgi yondashuvni davom ettiring.';
        }
        return 'Risk darajasi barqaror. Doimiy monitoring va tahlil qiling.';
    }
}

// Export singleton instance
export const predictiveAnalytics = new PredictiveAnalyticsEngine();

export { PredictiveAnalyticsEngine };
export type { PredictiveInsight, SuccessProbability, MarketTrend };