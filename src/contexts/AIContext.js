import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import aiService from '../services/aiService';
import paymentService from '../services/paymentService';

const AIContext = createContext();

// AI reducer
const aiReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    case 'SET_CREDITS':
      return {
        ...state,
        credits: action.payload
      };

    case 'DEDUCT_CREDITS':
      return {
        ...state,
        credits: {
          ...state.credits,
          available: state.credits.available - action.payload,
          used: state.credits.used + action.payload
        }
      };

    case 'SET_ENRICHMENT_RESULTS':
      return {
        ...state,
        enrichmentResults: {
          ...state.enrichmentResults,
          [action.payload.companyId]: action.payload.data
        }
      };

    case 'SET_COMPANY_SUGGESTIONS':
      return {
        ...state,
        companySuggestions: action.payload
      };

    case 'SET_ITINERARY_SUGGESTIONS':
      return {
        ...state,
        itinerarySuggestions: action.payload
      };

    case 'SET_EXPENSE_ANALYSIS':
      return {
        ...state,
        expenseAnalysis: action.payload
      };

    case 'ADD_OCR_RESULT':
      return {
        ...state,
        ocrResults: [...state.ocrResults, action.payload]
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    case 'SET_PROCESSING':
      return {
        ...state,
        processing: {
          ...state.processing,
          [action.payload.operation]: action.payload.status
        }
      };

    default:
      return state;
  }
};

const initialState = {
  credits: {
    available: 0,
    used: 0,
    total: 0
  },
  enrichmentResults: {},
  companySuggestions: [],
  itinerarySuggestions: null,
  expenseAnalysis: null,
  ocrResults: [],
  loading: false,
  error: null,
  processing: {
    enrichment: false,
    suggestions: false,
    itinerary: false,
    ocr: false,
    analysis: false
  }
};

export const AIProvider = ({ children }) => {
  const [state, dispatch] = useReducer(aiReducer, initialState);
  const { user } = useAuth();

  // Load user's AI credits when authenticated
  useEffect(() => {
    if (user) {
      loadCredits();
    } else {
      dispatch({ type: 'SET_CREDITS', payload: { available: 0, used: 0, total: 0 } });
    }
  }, [user]);

  // Load AI credits
  const loadCredits = async () => {
    try {
      const credits = await paymentService.getUserCredits();
      dispatch({ type: 'SET_CREDITS', payload: credits });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Check if user has enough credits
  const checkCredits = (requiredCredits) => {
    return state.credits.available >= requiredCredits;
  };

  // Helper function to deduct credits
  const deductCredits = async (amount, operation) => {
    try {
      await paymentService.deductCredits(null, amount, operation);
      dispatch({ type: 'DEDUCT_CREDITS', payload: amount });
    } catch (error) {
      console.error('Error deducting credits:', error);
      // Still update local state for better UX, but log the error
      dispatch({ type: 'DEDUCT_CREDITS', payload: amount });
    }
  };

  // Enrich company data with AI
  const enrichCompanyData = async (companyName, existingData = {}, companyId = null) => {
    try {
      if (!checkCredits(aiService.creditCosts.companyEnrichment)) {
        throw new Error('Insufficient AI credits for company enrichment');
      }

      dispatch({ type: 'SET_PROCESSING', payload: { operation: 'enrichment', status: true } });
      
      const enrichedData = await aiService.enrichCompanyData(companyName, existingData);
      
      await deductCredits(aiService.creditCosts.companyEnrichment, 'companyEnrichment');
      dispatch({ type: 'SET_PROCESSING', payload: { operation: 'enrichment', status: false } });
      
      if (companyId) {
        dispatch({ 
          type: 'SET_ENRICHMENT_RESULTS', 
          payload: { companyId, data: enrichedData } 
        });
      }
      
      return enrichedData;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_PROCESSING', payload: { operation: 'enrichment', status: false } });
      throw error;
    }
  };

  // Generate company suggestions based on trip objectives
  const generateCompanySuggestions = async (objectives, location, industry = null) => {
    try {
      if (!checkCredits(aiService.creditCosts.tripObjectives)) {
        throw new Error('Insufficient AI credits for company suggestions');
      }

      dispatch({ type: 'SET_PROCESSING', payload: { operation: 'suggestions', status: true } });
      
      const suggestions = await aiService.generateCompanyList(objectives, location, industry);
      
      await deductCredits(aiService.creditCosts.tripObjectives, 'tripObjectives');
      dispatch({ type: 'SET_COMPANY_SUGGESTIONS', payload: suggestions });
      dispatch({ type: 'SET_PROCESSING', payload: { operation: 'suggestions', status: false } });
      
      return suggestions;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_PROCESSING', payload: { operation: 'suggestions', status: false } });
      throw error;
    }
  };

  // Generate AI-powered itinerary
  const generateItinerary = async (tripData, companies, constraints = {}) => {
    try {
      if (!checkCredits(aiService.creditCosts.itineraryPlanning)) {
        throw new Error('Insufficient AI credits for itinerary planning');
      }

      dispatch({ type: 'SET_PROCESSING', payload: { operation: 'itinerary', status: true } });
      
      const itinerary = await aiService.generateItinerary(tripData, companies, constraints);
      
      await deductCredits(aiService.creditCosts.itineraryPlanning, 'itineraryPlanning');
      dispatch({ type: 'SET_ITINERARY_SUGGESTIONS', payload: itinerary });
      dispatch({ type: 'SET_PROCESSING', payload: { operation: 'itinerary', status: false } });
      
      return itinerary;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_PROCESSING', payload: { operation: 'itinerary', status: false } });
      throw error;
    }
  };

  // Process expense receipt with OCR
  const processExpenseReceipt = async (imageFile) => {
    try {
      if (!checkCredits(aiService.creditCosts.ocrProcessing)) {
        throw new Error('Insufficient AI credits for OCR processing');
      }

      dispatch({ type: 'SET_PROCESSING', payload: { operation: 'ocr', status: true } });
      
      const extractedData = await aiService.processExpenseReceipt(imageFile);
      
      await deductCredits(aiService.creditCosts.ocrProcessing, 'ocrProcessing');
      dispatch({ type: 'ADD_OCR_RESULT', payload: { 
        fileName: imageFile.name,
        extractedData,
        processedAt: new Date().toISOString()
      }});
      dispatch({ type: 'SET_PROCESSING', payload: { operation: 'ocr', status: false } });
      
      return extractedData;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_PROCESSING', payload: { operation: 'ocr', status: false } });
      throw error;
    }
  };

  // Analyze expenses with AI
  const analyzeExpenses = async (expenses) => {
    try {
      if (!checkCredits(aiService.creditCosts.expenseCategoriztion)) {
        throw new Error('Insufficient AI credits for expense analysis');
      }

      dispatch({ type: 'SET_PROCESSING', payload: { operation: 'analysis', status: true } });
      
      const analysis = await aiService.analyzeExpenses(expenses);
      
      await deductCredits(aiService.creditCosts.expenseCategoriztion, 'expenseAnalysis');
      dispatch({ type: 'SET_EXPENSE_ANALYSIS', payload: analysis });
      dispatch({ type: 'SET_PROCESSING', payload: { operation: 'analysis', status: false } });
      
      return analysis;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_PROCESSING', payload: { operation: 'analysis', status: false } });
      throw error;
    }
  };

  // Generate meeting agenda
  const generateMeetingAgenda = async (companyData, tripObjectives, meetingDuration = 60) => {
    try {
      const agenda = await aiService.generateMeetingAgenda(companyData, tripObjectives, meetingDuration);
      return agenda;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Reset suggestions
  const clearSuggestions = () => {
    dispatch({ type: 'SET_COMPANY_SUGGESTIONS', payload: [] });
    dispatch({ type: 'SET_ITINERARY_SUGGESTIONS', payload: null });
  };

  // Get credit cost for operation
  const getCreditCost = (operation) => {
    return aiService.creditCosts[operation] || 0;
  };

  // Get remaining credits needed for operation
  const getCreditsNeeded = (operation) => {
    const cost = getCreditCost(operation);
    return Math.max(0, cost - state.credits.available);
  };

  const value = {
    // State
    ...state,
    
    // Credit management
    loadCredits,
    checkCredits,
    getCreditCost,
    getCreditsNeeded,
    
    // AI operations
    enrichCompanyData,
    generateCompanySuggestions,
    generateItinerary,
    processExpenseReceipt,
    analyzeExpenses,
    generateMeetingAgenda,
    
    // Utility
    clearError,
    clearSuggestions
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export default AIContext; 