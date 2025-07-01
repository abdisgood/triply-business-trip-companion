import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import tripService from '../services/tripService';
import expenseService from '../services/expenseService';

const TripContext = createContext();

// Trip reducer
const tripReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    case 'SET_TRIPS':
      return {
        ...state,
        trips: action.payload,
        loading: false
      };

    case 'ADD_TRIP':
      return {
        ...state,
        trips: [action.payload, ...state.trips]
      };

    case 'UPDATE_TRIP':
      return {
        ...state,
        trips: state.trips.map(trip => 
          trip.id === action.payload.id ? action.payload : trip
        ),
        currentTrip: state.currentTrip?.id === action.payload.id ? action.payload : state.currentTrip
      };

    case 'DELETE_TRIP':
      return {
        ...state,
        trips: state.trips.filter(trip => trip.id !== action.payload),
        currentTrip: state.currentTrip?.id === action.payload ? null : state.currentTrip
      };

    case 'SET_CURRENT_TRIP':
      return {
        ...state,
        currentTrip: action.payload
      };

    case 'SET_INVITATIONS':
      return {
        ...state,
        pendingInvitations: action.payload
      };

    case 'ADD_INVITATION':
      return {
        ...state,
        pendingInvitations: [action.payload, ...state.pendingInvitations]
      };

    case 'REMOVE_INVITATION':
      return {
        ...state,
        pendingInvitations: state.pendingInvitations.filter(inv => inv.id !== action.payload)
      };

    case 'SET_EXPENSES':
      return {
        ...state,
        expenses: action.payload
      };

    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [action.payload, ...state.expenses]
      };

    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense => 
          expense.id === action.payload.id ? action.payload : expense
        )
      };

    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload)
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

    default:
      return state;
  }
};

const initialState = {
  trips: [],
  currentTrip: null,
  pendingInvitations: [],
  expenses: [],
  loading: false,
  error: null
};

export const TripProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tripReducer, initialState);
  const { user } = useAuth();

  // Load user's trips when authenticated
  useEffect(() => {
    if (user) {
      loadTrips();
      loadInvitations();
    } else {
      dispatch({ type: 'SET_TRIPS', payload: [] });
      dispatch({ type: 'SET_INVITATIONS', payload: [] });
    }
  }, [user]);

  // Load trips
  const loadTrips = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const trips = await tripService.getUserTrips();
      dispatch({ type: 'SET_TRIPS', payload: trips });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Load pending invitations
  const loadInvitations = async () => {
    try {
      const invitations = await tripService.getPendingInvitations();
      dispatch({ type: 'SET_INVITATIONS', payload: invitations });
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  // Create new trip
  const createTrip = async (tripData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newTrip = await tripService.createTrip(tripData);
      dispatch({ type: 'ADD_TRIP', payload: newTrip });
      return newTrip;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Update trip
  const updateTrip = async (tripId, updates) => {
    try {
      const updatedTrip = await tripService.updateTrip(tripId, updates);
      dispatch({ type: 'UPDATE_TRIP', payload: updatedTrip });
      return updatedTrip;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Delete trip
  const deleteTrip = async (tripId) => {
    try {
      await tripService.deleteTrip(tripId);
      dispatch({ type: 'DELETE_TRIP', payload: tripId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Get single trip
  const getTrip = async (tripId) => {
    try {
      const trip = await tripService.getTrip(tripId);
      return trip;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Set current trip
  const setCurrentTrip = async (tripId) => {
    try {
      if (!tripId) {
        dispatch({ type: 'SET_CURRENT_TRIP', payload: null });
        return;
      }

      const trip = await tripService.getTrip(tripId);
      dispatch({ type: 'SET_CURRENT_TRIP', payload: trip });
      
      // Load expenses for this trip
      const expenses = await expenseService.getTripExpenses(tripId);
      dispatch({ type: 'SET_EXPENSES', payload: expenses });
      
      return trip;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Invite collaborators
  const inviteCollaborators = async (tripId, emails) => {
    try {
      const invitations = await tripService.inviteCollaborators(tripId, emails);
      // Refresh trip data to get updated collaborators
      const updatedTrip = await tripService.getTrip(tripId);
      dispatch({ type: 'UPDATE_TRIP', payload: updatedTrip });
      return invitations;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Accept invitation
  const acceptInvitation = async (invitationId) => {
    try {
      const trip = await tripService.acceptInvitation(invitationId);
      dispatch({ type: 'ADD_TRIP', payload: trip });
      dispatch({ type: 'REMOVE_INVITATION', payload: invitationId });
      return trip;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Add company to itinerary
  const addCompanyToItinerary = async (tripId, companyData, agendaItems = []) => {
    try {
      const itineraryItem = await tripService.addCompanyToItinerary(tripId, companyData, agendaItems);
      const updatedTrip = await tripService.getTrip(tripId);
      dispatch({ type: 'UPDATE_TRIP', payload: updatedTrip });
      if (state.currentTrip?.id === tripId) {
        dispatch({ type: 'SET_CURRENT_TRIP', payload: updatedTrip });
      }
      return itineraryItem;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Update itinerary item
  const updateItineraryItem = async (tripId, itemId, updates) => {
    try {
      await tripService.updateItineraryItem(tripId, itemId, updates);
      const updatedTrip = await tripService.getTrip(tripId);
      dispatch({ type: 'UPDATE_TRIP', payload: updatedTrip });
      if (state.currentTrip?.id === tripId) {
        dispatch({ type: 'SET_CURRENT_TRIP', payload: updatedTrip });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Remove company from itinerary
  const removeCompanyFromItinerary = async (tripId, itemId) => {
    try {
      await tripService.removeCompanyFromItinerary(tripId, itemId);
      const updatedTrip = await tripService.getTrip(tripId);
      dispatch({ type: 'UPDATE_TRIP', payload: updatedTrip });
      if (state.currentTrip?.id === tripId) {
        dispatch({ type: 'SET_CURRENT_TRIP', payload: updatedTrip });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Add booking
  const addBooking = async (tripId, bookingData) => {
    try {
      const booking = await tripService.addBooking(tripId, bookingData);
      const updatedTrip = await tripService.getTrip(tripId);
      dispatch({ type: 'UPDATE_TRIP', payload: updatedTrip });
      if (state.currentTrip?.id === tripId) {
        dispatch({ type: 'SET_CURRENT_TRIP', payload: updatedTrip });
      }
      return booking;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Expense management
  const addExpense = async (expenseData, receiptFile = null) => {
    try {
      const expense = await expenseService.createExpense(expenseData, receiptFile);
      dispatch({ type: 'ADD_EXPENSE', payload: expense });
      
      // Update trip spent amount if it's for current trip
      if (expense.tripId && state.currentTrip?.id === expense.tripId) {
        const updatedTrip = await tripService.updateTrip(expense.tripId, {
          spentAmount: (state.currentTrip.spentAmount || 0) + expense.amount
        });
        dispatch({ type: 'UPDATE_TRIP', payload: updatedTrip });
        dispatch({ type: 'SET_CURRENT_TRIP', payload: updatedTrip });
      }
      
      return expense;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateExpense = async (expenseId, updates) => {
    try {
      const updatedExpense = await expenseService.updateExpense(expenseId, updates);
      dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense });
      return updatedExpense;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const deleteExpense = async (expenseId) => {
    try {
      await expenseService.deleteExpense(expenseId);
      dispatch({ type: 'DELETE_EXPENSE', payload: expenseId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    // State
    ...state,
    
    // Trip actions
    createTrip,
    updateTrip,
    deleteTrip,
    getTrip,
    setCurrentTrip,
    loadTrips,
    
    // Collaboration
    inviteCollaborators,
    acceptInvitation,
    
    // Itinerary management
    addCompanyToItinerary,
    updateItineraryItem,
    removeCompanyFromItinerary,
    
    // Booking management
    addBooking,
    
    // Expense management
    addExpense,
    updateExpense,
    deleteExpense,
    
    // Utility
    clearError
  };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};

export default TripContext; 