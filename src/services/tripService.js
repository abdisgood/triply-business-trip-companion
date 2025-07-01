import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  arrayUnion,
  arrayRemove,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { auth } from '../firebase/auth';

class TripService {
  constructor() {
    this.collection = 'trips';
    this.invitesCollection = 'tripInvites';
  }

  // Create a new trip
  async createTrip(tripData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const trip = {
        ...tripData,
        ownerId: user.uid,
        ownerEmail: user.email,
        collaborators: [user.uid],
        collaboratorEmails: [user.email],
        status: 'planning', // planning, active, completed, cancelled
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        aiCreditsUsed: 0,
        totalBudget: tripData.totalBudget || 0,
        spentAmount: 0,
        itinerary: [],
        expenses: [],
        bookings: {
          hotels: [],
          flights: [],
          transport: [],
          other: []
        }
      };

      const docRef = await addDoc(collection(db, this.collection), trip);
      return { id: docRef.id, ...trip };
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error;
    }
  }

  // Get user's trips (owned and collaborated)
  async getUserTrips() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const q = query(
        collection(db, this.collection),
        where('collaborators', 'array-contains', user.uid),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching trips:', error);
      throw error;
    }
  }

  // Get trip by ID
  async getTrip(tripId) {
    try {
      const docRef = doc(db, this.collection, tripId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Trip not found');
      }
    } catch (error) {
      console.error('Error fetching trip:', error);
      throw error;
    }
  }

  // Update trip
  async updateTrip(tripId, updates) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const docRef = doc(db, this.collection, tripId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });

      return await this.getTrip(tripId);
    } catch (error) {
      console.error('Error updating trip:', error);
      throw error;
    }
  }

  // Invite users to trip
  async inviteCollaborators(tripId, emails) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const trip = await this.getTrip(tripId);
      if (trip.ownerId !== user.uid) {
        throw new Error('Only trip owner can invite collaborators');
      }

      const invitations = emails.map(email => ({
        tripId,
        tripTitle: trip.title,
        inviterEmail: user.email,
        inviterName: user.displayName || user.email,
        inviteeEmail: email,
        status: 'pending', // pending, accepted, declined
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 days
      }));

      // Save invitations to Firestore
      const promises = invitations.map(invitation => 
        addDoc(collection(db, this.invitesCollection), invitation)
      );
      
      await Promise.all(promises);

      // Here you would also send email invitations
      // This would integrate with your email service
      
      return invitations;
    } catch (error) {
      console.error('Error inviting collaborators:', error);
      throw error;
    }
  }

  // Accept trip invitation
  async acceptInvitation(invitationId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const inviteRef = doc(db, this.invitesCollection, invitationId);
      const inviteSnap = await getDoc(inviteRef);
      
      if (!inviteSnap.exists()) {
        throw new Error('Invitation not found');
      }

      const invitation = inviteSnap.data();
      
      if (invitation.inviteeEmail !== user.email) {
        throw new Error('This invitation is not for you');
      }

      if (invitation.status !== 'pending') {
        throw new Error('Invitation already processed');
      }

      // Update invitation status
      await updateDoc(inviteRef, {
        status: 'accepted',
        acceptedAt: Timestamp.now()
      });

      // Add user to trip collaborators
      const tripRef = doc(db, this.collection, invitation.tripId);
      await updateDoc(tripRef, {
        collaborators: arrayUnion(user.uid),
        collaboratorEmails: arrayUnion(user.email),
        updatedAt: Timestamp.now()
      });

      return await this.getTrip(invitation.tripId);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  // Add company to trip itinerary
  async addCompanyToItinerary(tripId, companyData, agendaItems = []) {
    try {
      const itineraryItem = {
        id: Date.now().toString(),
        companyId: companyData.id,
        company: companyData,
        agendaItems,
        proposedDuration: 120, // default 2 hours in minutes
        actualDuration: null,
        scheduledDate: null,
        scheduledTime: null,
        status: 'planned', // planned, confirmed, completed, cancelled
        notes: '',
        addedAt: Timestamp.now()
      };

      const tripRef = doc(db, this.collection, tripId);
      await updateDoc(tripRef, {
        itinerary: arrayUnion(itineraryItem),
        updatedAt: Timestamp.now()
      });

      return itineraryItem;
    } catch (error) {
      console.error('Error adding company to itinerary:', error);
      throw error;
    }
  }

  // Update itinerary item
  async updateItineraryItem(tripId, itemId, updates) {
    try {
      const trip = await this.getTrip(tripId);
      const itinerary = trip.itinerary.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      );

      await this.updateTrip(tripId, { itinerary });
      return itinerary.find(item => item.id === itemId);
    } catch (error) {
      console.error('Error updating itinerary item:', error);
      throw error;
    }
  }

  // Remove company from itinerary
  async removeCompanyFromItinerary(tripId, itemId) {
    try {
      const trip = await this.getTrip(tripId);
      const itinerary = trip.itinerary.filter(item => item.id !== itemId);

      await this.updateTrip(tripId, { itinerary });
      return true;
    } catch (error) {
      console.error('Error removing company from itinerary:', error);
      throw error;
    }
  }

  // Add booking to trip
  async addBooking(tripId, bookingData) {
    try {
      const booking = {
        id: Date.now().toString(),
        ...bookingData,
        addedAt: Timestamp.now()
      };

      const trip = await this.getTrip(tripId);
      const bookings = { ...trip.bookings };
      
      if (!bookings[booking.type]) {
        bookings[booking.type] = [];
      }
      
      bookings[booking.type].push(booking);

      await this.updateTrip(tripId, { bookings });
      return booking;
    } catch (error) {
      console.error('Error adding booking:', error);
      throw error;
    }
  }

  // Get user's pending invitations
  async getPendingInvitations() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const q = query(
        collection(db, this.invitesCollection),
        where('inviteeEmail', '==', user.email),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching invitations:', error);
      throw error;
    }
  }

  // Delete trip
  async deleteTrip(tripId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const trip = await this.getTrip(tripId);
      if (trip.ownerId !== user.uid) {
        throw new Error('Only trip owner can delete the trip');
      }

      await deleteDoc(doc(db, this.collection, tripId));
      return true;
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw error;
    }
  }
}

export default new TripService(); 