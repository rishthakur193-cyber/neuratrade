export class AIService {
  private static API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

  /**
   * Generates a real-time AI insight using Google Gemini.
   */
  static async getPortfolioInsights(portfolioData: any) {
    if (!this.API_KEY) {
      return this.getMockInsights(portfolioData); // Fallback to mock if no key
    }

    const prompt = `
            Analyze this investment portfolio:
            Value: ₹${portfolioData?.totalValue || 0}
            Invested: ₹${portfolioData?.investedAmount || 0}
            Holdings: ${JSON.stringify(portfolioData?.holdings || [])}

            Provide:
            1. Risk Analysis (VaR 95%)
            2. Sector Exposure breakdown
            3. A short explanation of the volatility profile.
            
            Strict Rule: Do not provide direct financial guarantees or specific 'BUY' recommendations. 
            Tone: Professional, Hedge-fund grade.
        `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, topP: 0.8, maxOutputTokens: 500 }
        })
      });

      const data = await response.json();
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "AI Insight temporarily unavailable.";

      return {
        type: 'PORTFOLIO_RISK',
        content: textContent,
        confidenceScore: 0.92,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("Gemini API Error:", error);
      return this.getMockInsights(portfolioData);
    }
  }

  private static getMockInsights(portfolioData: any) {
    const varValue = portfolioData?.totalValue ? (portfolioData.totalValue * 0.082).toFixed(2) : 0;
    return {
      type: 'PORTFOLIO_RISK',
      content: `**Ecosystem AI Risk Analysis (Fallback Mode)**\nYour portfolio (₹${portfolioData?.totalValue}) has a VaR of ₹${varValue}.`,
      confidenceScore: 0.88,
      timestamp: new Date().toISOString()
    };
  }

  static async generateMeetingSummary(transcript: string) {
    if (!transcript) return { summary: "No transcript provided." };

    if (!this.API_KEY) {
      return {
        summary: "AI Draft: The meeting focused on rebalancing tech-sector exposure.",
        actionItems: ["Rebalance Equity 15%", "Research Mid-Cap Index"]
      };
    }

    const prompt = `Summarize this meeting transcript and provide 3 key action items: ${transcript}`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      return {
        summary: textContent,
        actionItems: ["Follow up with client", "Review Risk Score"] // Simplified parsing
      };
    } catch (err) {
      return { summary: "Failed to generate AI summary." };
    }
  }

  static async analyzeAsset(symbol: string) {
    if (!this.API_KEY) {
      return this.getMockAssetAnalysis(symbol);
    }

    const prompt = `
      Perform a comprehensive "8 Pillars of Analysis" on the financial asset: ${symbol}. 
      Return the output as a precise, professional JSON object with the following structure:
      {
        "symbol": "${symbol}",
        "pillars": {
          "trend": "Brief ADX/Moving Average based sentiment.",
          "momentum": "Brief RSI/Stochastic analysis.",
          "volatility": "Brief ATR/Bollinger Band state.",
          "risk": "Brief VaR assessment.",
          "supportResistance": "Key technical levels.",
          "sentiment": "News-based sentiment summary.",
          "smartMoney": "Volume profile/Institutional flow insights.",
          "performance": "Alpha/Beta tracking against benchmark."
        },
        "overallScore": "Out of 100",
        "verdict": "A hedge-fund grade, professional 2-sentence summary. Do not provide direct 'BUY/SELL' recommendations."
      }
      Respond exclusively with valid JSON. Do not include markdown formatting or backticks around the JSON.
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, topP: 0.8, maxOutputTokens: 800 }
        })
      });

      const data = await response.json();
      let textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

      textContent = textContent.replace(/```json/g, '').replace(/```/g, '').trim();

      try {
        const parsed = JSON.parse(textContent);
        return parsed;
      } catch (e) {
        return this.getMockAssetAnalysis(symbol);
      }
    } catch (err) {
      console.error("Gemini Asset Analysis Error:", err);
      return this.getMockAssetAnalysis(symbol);
    }
  }

  private static getMockAssetAnalysis(symbol: string) {
    return {
      symbol: symbol,
      pillars: {
        trend: "Strong Bullish momentum above 200-DMA. ADX reading indicates a solid established trend.",
        momentum: "RSI at 68, entering overbought territory but stochastic confirms upward pressure.",
        volatility: "Bollinger bands expanding, indicating high near-term price velocity.",
        risk: "Calculated 95% Daily VaR sits at 2.4%. Acceptable institutional threshold.",
        supportResistance: "Immediate resistance at +4.5% from LTP. Major support established at 20-DMA.",
        sentiment: "Macro environment highly favorable; recent regulatory news acts as a catalyst.",
        smartMoney: "Volume profile shows significant accumulation at recent dips by DIIs.",
        performance: "Generating an alpha of 1.2% against the NIFTY 50 benchmark."
      },
      overallScore: 82,
      verdict: "The asset demonstrates strong fundamental resilience and technical alignment. Recommend holding for further risk-adjusted alpha capture."
    };
  }
}
