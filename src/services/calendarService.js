import { gapi } from 'gapi-script';

class CalendarService {
  constructor() {
    this.isInitialized = false;
    this.isSignedIn = false;
    this.calendarId = 'primary';
    this.apiKey = process.env.REACT_APP_GOOGLE_CALENDAR_API_KEY;
    this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    this.discoveryDoc = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
    this.scopes = 'https://www.googleapis.com/auth/calendar';
  }

  // Initialize Google Calendar API
  async initialize() {
    if (this.isInitialized) return;

    try {
      await gapi.load('client:auth2', async () => {
        await gapi.client.init({
          apiKey: this.apiKey,
          clientId: this.clientId,
          discoveryDocs: [this.discoveryDoc],
          scope: this.scopes
        });

        this.authInstance = gapi.auth2.getAuthInstance();
        this.isSignedIn = this.authInstance.isSignedIn.get();
        this.isInitialized = true;
      });
    } catch (error) {
      console.error('Error initializing Google Calendar API:', error);
      throw error;
    }
  }

  // Sign in to Google Calendar
  async signIn() {
    try {
      await this.initialize();
      
      if (!this.isSignedIn) {
        await this.authInstance.signIn();
        this.isSignedIn = true;
      }
      
      return true;
    } catch (error) {
      console.error('Error signing in to Google Calendar:', error);
      throw error;
    }
  }

  // Sign out from Google Calendar
  async signOut() {
    try {
      if (this.authInstance && this.isSignedIn) {
        await this.authInstance.signOut();
        this.isSignedIn = false;
      }
    } catch (error) {
      console.error('Error signing out from Google Calendar:', error);
      throw error;
    }
  }

  // Create a calendar event for a company meeting
  async createMeetingEvent(companyData, tripData, meetingDetails) {
    try {
      await this.signIn();

      const event = {
        summary: `Business Meeting - ${companyData.name}`,
        description: this.createEventDescription(companyData, tripData, meetingDetails),
        start: {
          dateTime: meetingDetails.startDateTime,
          timeZone: meetingDetails.timeZone || 'UTC'
        },
        end: {
          dateTime: meetingDetails.endDateTime,
          timeZone: meetingDetails.timeZone || 'UTC'
        },
        location: companyData.address || companyData.location,
        attendees: meetingDetails.attendees || [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 60 }       // 1 hour before
          ]
        },
        source: {
          title: 'Triply Business Trip',
          url: window.location.origin
        }
      };

      const response = await gapi.client.calendar.events.insert({
        calendarId: this.calendarId,
        resource: event
      });

      return {
        id: response.result.id,
        htmlLink: response.result.htmlLink,
        ...response.result
      };
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  // Create event description
  createEventDescription(companyData, tripData, meetingDetails) {
    return `
Business Trip Meeting

Company: ${companyData.name}
Industry: ${companyData.industry || 'N/A'}
${companyData.description ? `Description: ${companyData.description}` : ''}

Trip: ${tripData.title}
${tripData.objectives ? `Objectives: ${tripData.objectives}` : ''}

Meeting Details:
${meetingDetails.agenda ? `Agenda: ${meetingDetails.agenda.join(', ')}` : ''}
${meetingDetails.notes ? `Notes: ${meetingDetails.notes}` : ''}

Contact Information:
${companyData.phone ? `Phone: ${companyData.phone}` : ''}
${companyData.email ? `Email: ${companyData.email}` : ''}
${companyData.website ? `Website: ${companyData.website}` : ''}

Created with Triply - Business Trip Companion
    `.trim();
  }

  // Create a trip calendar with all meetings
  async createTripCalendar(tripData, itinerary) {
    try {
      await this.signIn();

      const events = [];

      // Create events for each company meeting
      for (const item of itinerary) {
        if (item.scheduledDate && item.scheduledTime) {
          const startDateTime = new Date(`${item.scheduledDate}T${item.scheduledTime}`);
          const endDateTime = new Date(startDateTime.getTime() + (item.proposedDuration * 60 * 1000));

          const event = await this.createMeetingEvent(
            item.company,
            tripData,
            {
              startDateTime: startDateTime.toISOString(),
              endDateTime: endDateTime.toISOString(),
              timeZone: tripData.timeZone,
              agenda: item.agendaItems?.map(a => a.topic) || [],
              notes: item.notes
            }
          );

          events.push(event);
        }
      }

      // Create a trip overview event
      if (tripData.startDate && tripData.endDate) {
        const tripEvent = await this.createTripOverviewEvent(tripData, events);
        events.unshift(tripEvent);
      }

      return events;
    } catch (error) {
      console.error('Error creating trip calendar:', error);
      throw error;
    }
  }

  // Create trip overview event
  async createTripOverviewEvent(tripData, meetingEvents) {
    try {
      const event = {
        summary: `Business Trip - ${tripData.title}`,
        description: `
Business Trip Overview

Destination: ${tripData.destination}
Dates: ${tripData.startDate} to ${tripData.endDate}
${tripData.objectives ? `Objectives: ${tripData.objectives}` : ''}

Scheduled Meetings: ${meetingEvents.length}
${meetingEvents.map(e => `- ${e.summary}`).join('\n')}

Budget: ${tripData.totalBudget ? `$${tripData.totalBudget}` : 'Not set'}

Created with Triply - Business Trip Companion
        `.trim(),
        start: {
          date: tripData.startDate
        },
        end: {
          date: tripData.endDate
        },
        source: {
          title: 'Triply Business Trip',
          url: window.location.origin
        }
      };

      const response = await gapi.client.calendar.events.insert({
        calendarId: this.calendarId,
        resource: event
      });

      return response.result;
    } catch (error) {
      console.error('Error creating trip overview event:', error);
      throw error;
    }
  }

  // Get user's calendar events for a date range
  async getCalendarEvents(startDate, endDate) {
    try {
      await this.signIn();

      const response = await gapi.client.calendar.events.list({
        calendarId: this.calendarId,
        timeMin: new Date(startDate).toISOString(),
        timeMax: new Date(endDate).toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.result.items.map(event => ({
        id: event.id,
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        location: event.location,
        attendees: event.attendees,
        htmlLink: event.htmlLink
      }));
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  // Check for scheduling conflicts
  async checkSchedulingConflicts(proposedDateTime, duration) {
    try {
      const startTime = new Date(proposedDateTime);
      const endTime = new Date(startTime.getTime() + (duration * 60 * 1000));

      const events = await this.getCalendarEvents(
        startTime.toISOString().split('T')[0],
        endTime.toISOString().split('T')[0]
      );

      const conflicts = events.filter(event => {
        const eventStart = new Date(event.start.dateTime || event.start.date);
        const eventEnd = new Date(event.end.dateTime || event.end.date);

        return (startTime < eventEnd && endTime > eventStart);
      });

      return {
        hasConflicts: conflicts.length > 0,
        conflicts,
        suggestedTimes: conflicts.length > 0 ? await this.suggestAlternativeTimes(startTime, duration, events) : []
      };
    } catch (error) {
      console.error('Error checking scheduling conflicts:', error);
      throw error;
    }
  }

  // Suggest alternative meeting times
  async suggestAlternativeTimes(preferredTime, duration, existingEvents) {
    const suggestions = [];
    const durationMs = duration * 60 * 1000;
    
    // Try same day first
    let currentTime = new Date(preferredTime);
    currentTime.setHours(9, 0, 0, 0); // Start at 9 AM
    
    for (let i = 0; i < 48; i++) { // Check 48 half-hour slots (24 hours)
      const slotStart = new Date(currentTime);
      const slotEnd = new Date(currentTime.getTime() + durationMs);
      
      // Check if this slot conflicts with existing events
      const hasConflict = existingEvents.some(event => {
        const eventStart = new Date(event.start.dateTime || event.start.date);
        const eventEnd = new Date(event.end.dateTime || event.end.date);
        return (slotStart < eventEnd && slotEnd > eventStart);
      });
      
      if (!hasConflict && slotStart.getHours() >= 9 && slotEnd.getHours() <= 18) {
        suggestions.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          confidence: this.calculateTimeSlotConfidence(slotStart, preferredTime)
        });
        
        if (suggestions.length >= 5) break;
      }
      
      currentTime.setTime(currentTime.getTime() + 30 * 60 * 1000); // Move 30 minutes
    }
    
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  // Calculate confidence score for time slot suggestions
  calculateTimeSlotConfidence(suggestedTime, preferredTime) {
    const timeDiff = Math.abs(suggestedTime.getTime() - preferredTime.getTime());
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // Prefer times closer to the original preferred time
    const timeProximityScore = Math.max(0, 100 - (hoursDiff * 10));
    
    // Prefer business hours (10 AM - 4 PM)
    const hour = suggestedTime.getHours();
    const businessHoursScore = (hour >= 10 && hour <= 16) ? 100 : 50;
    
    return (timeProximityScore + businessHoursScore) / 2;
  }

  // Update an existing calendar event
  async updateEvent(eventId, updates) {
    try {
      await this.signIn();

      const response = await gapi.client.calendar.events.patch({
        calendarId: this.calendarId,
        eventId: eventId,
        resource: updates
      });

      return response.result;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  // Delete a calendar event
  async deleteEvent(eventId) {
    try {
      await this.signIn();

      await gapi.client.calendar.events.delete({
        calendarId: this.calendarId,
        eventId: eventId
      });

      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  // Get free/busy information
  async getFreeBusyInfo(startDate, endDate, calendars = ['primary']) {
    try {
      await this.signIn();

      const response = await gapi.client.calendar.freebusy.query({
        resource: {
          timeMin: new Date(startDate).toISOString(),
          timeMax: new Date(endDate).toISOString(),
          items: calendars.map(id => ({ id }))
        }
      });

      return response.result;
    } catch (error) {
      console.error('Error getting free/busy info:', error);
      throw error;
    }
  }
}

export default new CalendarService(); 