import OpenAI from 'openai';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/config';
import { auth } from '../firebase/auth';

class AIService {
  constructor() {
    // Initialize OpenAI client - API key should be in environment variables
    this.openai = new OpenAI({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
    });
    
    this.creditCosts = {
      companyEnrichment: 5,
      itineraryPlanning: 10,
      ocrProcessing: 3,
      tripObjectives: 7,
      expenseCategoriztion: 2
    };
  }

  // Check user's AI credits
  async getUserCredits(userId = null) {
    try {
      const user = userId || auth.currentUser?.uid;
      if (!user) throw new Error('User not authenticated');

      // In a real app, you'd store credits in a user profile document
      // For now, we'll return a default amount
      return {
        available: 100,
        used: 0,
        total: 100
      };
    } catch (error) {
      console.error('Error getting user credits:', error);
      throw error;
    }
  }

  // Deduct credits from user account
  async deductCredits(amount, operation) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // In production, you'd update user's credit balance in Firestore
      console.log(`Deducting ${amount} credits for ${operation}`);
      
      return true;
    } catch (error) {
      console.error('Error deducting credits:', error);
      throw error;
    }
  }

  // Enrich company data using AI
  async enrichCompanyData(companyName, existingData = {}) {
    try {
      await this.deductCredits(this.creditCosts.companyEnrichment, 'companyEnrichment');

      const prompt = `
        Please provide comprehensive business information for the company "${companyName}" in JSON format.
        Include the following details if available:
        - Full company name and any aliases
        - Industry and business sectors
        - Headquarters address (full address with postal code)
        - Key business areas and products/services
        - Company size (employee count estimate)
        - Revenue information if publicly available
        - Key executives and their roles
        - Recent news or developments
        - Contact information (general phone, website, email)
        - Social media presence
        - Stock ticker if publicly traded
        - Founded year
        - Key subsidiaries or parent company
        
        Current data we have: ${JSON.stringify(existingData)}
        
        Please return only valid JSON without markdown formatting.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a business research assistant. Provide accurate, up-to-date company information in valid JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      });

      const enrichedData = JSON.parse(response.choices[0].message.content);
      return enrichedData;

    } catch (error) {
      console.error('Error enriching company data:', error);
      throw error;
    }
  }

  // Generate company list based on trip objectives
  async generateCompanyList(objectives, location, industry = null) {
    try {
      await this.deductCredits(this.creditCosts.tripObjectives, 'tripObjectives');

      const prompt = `
        Based on the following trip objectives, suggest a list of companies to visit in ${location}.
        
        Trip Objectives: ${objectives}
        ${industry ? `Industry Focus: ${industry}` : ''}
        Location: ${location}
        
        Please provide a JSON array of company suggestions with the following structure:
        [
          {
            "name": "Company Name",
            "industry": "Industry Sector",
            "relevance": "Why this company aligns with trip objectives",
            "priority": "high/medium/low",
            "estimatedMeetingDuration": "minutes",
            "suggestedAgenda": ["agenda item 1", "agenda item 2"],
            "keyContacts": "Suggested department or role to contact",
            "address": "Company address if known"
          }
        ]
        
        Focus on companies that would be most relevant to achieving the stated objectives.
        Prioritize companies that are known to be open to business partnerships or have a history of international collaboration.
        
        Return only valid JSON without markdown formatting.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a business development assistant specializing in B2B relationship building and market research."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5
      });

      const companies = JSON.parse(response.choices[0].message.content);
      return companies;

    } catch (error) {
      console.error('Error generating company list:', error);
      throw error;
    }
  }

  // Create AI-powered trip itinerary
  async generateItinerary(tripData, companies, constraints = {}) {
    try {
      await this.deductCredits(this.creditCosts.itineraryPlanning, 'itineraryPlanning');

      const prompt = `
        Create a detailed business trip itinerary based on the following information:
        
        Trip Details:
        - Destination: ${tripData.destination}
        - Start Date: ${tripData.startDate}
        - End Date: ${tripData.endDate}
        - Objectives: ${tripData.objectives}
        
        Companies to Visit:
        ${companies.map(c => `- ${c.name}: ${c.relevance}`).join('\n')}
        
        Constraints:
        - Working hours: ${constraints.workingHours || '9:00 AM - 6:00 PM'}
        - Travel time between locations: ${constraints.travelBuffer || '30 minutes'}
        - Lunch breaks: ${constraints.lunchBreaks || 'Yes, 1 hour'}
        - Meeting duration preferences: ${constraints.meetingDuration || '1-2 hours per company'}
        
        Please create an optimized itinerary in JSON format:
        {
          "itinerary": [
            {
              "date": "YYYY-MM-DD",
              "day": "Day 1",
              "activities": [
                {
                  "time": "HH:MM",
                  "type": "meeting/travel/break/other",
                  "company": "Company Name (if applicable)",
                  "activity": "Description",
                  "duration": "minutes",
                  "location": "Address or location",
                  "notes": "Additional information"
                }
              ]
            }
          ],
          "summary": "Brief overview of the itinerary",
          "recommendations": ["Tip 1", "Tip 2"],
          "totalMeetings": "number",
          "estimatedTravelTime": "total travel time"
        }
        
        Optimize for:
        1. Minimal travel time between locations
        2. Appropriate meeting durations based on company importance
        3. Realistic schedule with breaks
        4. Buffer time for delays
        
        Return only valid JSON without markdown formatting.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a professional travel and business itinerary planner with expertise in optimizing business trip schedules."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4
      });

      const itinerary = JSON.parse(response.choices[0].message.content);
      return itinerary;

    } catch (error) {
      console.error('Error generating itinerary:', error);
      throw error;
    }
  }

  // Process receipt/expense image using OCR
  async processExpenseReceipt(imageFile) {
    try {
      await this.deductCredits(this.creditCosts.ocrProcessing, 'ocrProcessing');

      // Convert file to base64
      const base64Image = await this.fileToBase64(imageFile);

      const prompt = `
        Analyze this receipt/expense image and extract the following information in JSON format:
        {
          "vendor": "Business name",
          "date": "YYYY-MM-DD",
          "totalAmount": "number (just the number, no currency)",
          "currency": "currency code (e.g., USD, EUR, CNY)",
          "category": "category (e.g., meals, transportation, accommodation, supplies)",
          "items": [
            {
              "description": "item description",
              "amount": "number",
              "quantity": "number if applicable"
            }
          ],
          "taxAmount": "tax amount if shown",
          "tipAmount": "tip amount if applicable",
          "paymentMethod": "payment method if shown",
          "receiptNumber": "receipt/transaction number if visible",
          "confidence": "high/medium/low - your confidence in the extraction"
        }
        
        If any information is not clearly visible, use null for that field.
        For category, choose the most appropriate from: meals, transportation, accommodation, supplies, entertainment, communication, other.
        
        Return only valid JSON without markdown formatting.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      });

      const extractedData = JSON.parse(response.choices[0].message.content);
      return extractedData;

    } catch (error) {
      console.error('Error processing receipt:', error);
      throw error;
    }
  }

  // Categorize and analyze expenses
  async analyzeExpenses(expenses) {
    try {
      await this.deductCredits(this.creditCosts.expenseCategoriztion, 'expenseCategoriztion');

      const prompt = `
        Analyze the following business trip expenses and provide insights:
        
        Expenses:
        ${expenses.map(e => `- ${e.vendor}: ${e.amount} ${e.currency} (${e.category}) on ${e.date}`).join('\n')}
        
        Please provide analysis in JSON format:
        {
          "summary": {
            "totalAmount": "total spent",
            "currency": "primary currency",
            "categoriesBreakdown": {
              "meals": "amount",
              "transportation": "amount",
              "accommodation": "amount",
              "other": "amount"
            },
            "averageDailySpend": "amount",
            "expenseCount": "number of expenses"
          },
          "insights": [
            "Insight 1 about spending patterns",
            "Insight 2 about budget utilization"
          ],
          "recommendations": [
            "Recommendation 1 for future trips",
            "Recommendation 2 for cost optimization"
          ],
          "flaggedExpenses": [
            {
              "expense": "expense description",
              "reason": "why it's flagged (e.g., unusually high, duplicate, etc.)"
            }
          ]
        }
        
        Return only valid JSON without markdown formatting.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a financial analyst specializing in business travel expense analysis and optimization."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      return analysis;

    } catch (error) {
      console.error('Error analyzing expenses:', error);
      throw error;
    }
  }

  // Helper function to convert file to base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }

  // Generate meeting agenda suggestions
  async generateMeetingAgenda(companyData, tripObjectives, meetingDuration = 60) {
    try {
      const prompt = `
        Generate a detailed meeting agenda for a business meeting with ${companyData.name}.
        
        Company Information:
        - Name: ${companyData.name}
        - Industry: ${companyData.industry}
        - Business: ${companyData.description}
        
        Trip Objectives: ${tripObjectives}
        Meeting Duration: ${meetingDuration} minutes
        
        Create an agenda in JSON format:
        {
          "agenda": [
            {
              "time": "duration in minutes",
              "topic": "agenda item",
              "description": "detailed description",
              "keyPoints": ["point 1", "point 2"],
              "expectedOutcome": "what you hope to achieve"
            }
          ],
          "preparationItems": ["item 1", "item 2"],
          "questionsToAsk": ["question 1", "question 2"],
          "materialsNeeded": ["material 1", "material 2"]
        }
        
        Return only valid JSON without markdown formatting.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a business development consultant who specializes in creating effective meeting agendas for international business partnerships."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4
      });

      return JSON.parse(response.choices[0].message.content);

    } catch (error) {
      console.error('Error generating meeting agenda:', error);
      throw error;
    }
  }
}

export default new AIService(); 