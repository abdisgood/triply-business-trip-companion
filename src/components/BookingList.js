import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Paper,
  Avatar,
  Link,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Hotel as HotelIcon,
  Flight as FlightIcon,
  DirectionsCar as CarIcon,
  Train as TrainIcon,
  OpenInNew as OpenInNewIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { useTrip } from '../contexts/TripContext';

const BookingList = ({ tripId }) => {
  const { trips, addBooking } = useTrip();
  const [bookings, setBookings] = useState({
    hotels: [],
    flights: [],
    transport: [],
    other: []
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  
  const [bookingForm, setBookingForm] = useState({
    type: 'hotels',
    name: '',
    confirmationNumber: '',
    provider: '',
    startDate: new Date(),
    endDate: new Date(),
    amount: '',
    notes: ''
  });

  const bookingTypes = [
    { value: 'hotels', label: 'Hotel', icon: <HotelIcon /> },
    { value: 'flights', label: 'Flight', icon: <FlightIcon /> },
    { value: 'transport', label: 'Transport', icon: <CarIcon /> },
    { value: 'other', label: 'Other', icon: <EventIcon /> }
  ];

  const partnerLinks = {
    hotels: [
      { name: 'Booking.com', url: 'https://www.booking.com', color: '#003580' },
      { name: 'Hotels.com', url: 'https://www.hotels.com', color: '#d32f2f' },
      { name: 'Expedia', url: 'https://www.expedia.com', color: '#00355F' },
      { name: 'Airbnb', url: 'https://www.airbnb.com', color: '#FF5A5F' },
      { name: 'Agoda', url: 'https://www.agoda.com', color: '#5392F9' }
    ],
    flights: [
      { name: 'Expedia', url: 'https://www.expedia.com/Flights', color: '#00355F' },
      { name: 'Kayak', url: 'https://www.kayak.com/flights', color: '#FF690F' },
      { name: 'Google Flights', url: 'https://www.google.com/flights', color: '#4285F4' },
      { name: 'Skyscanner', url: 'https://www.skyscanner.com', color: '#00a698' },
      { name: 'Momondo', url: 'https://www.momondo.com', color: '#FF6B6C' }
    ],
    transport: [
      { name: 'Uber', url: 'https://www.uber.com', color: '#000000' },
      { name: 'Lyft', url: 'https://www.lyft.com', color: '#FF00BF' },
      { name: 'Rome2rio', url: 'https://www.rome2rio.com', color: '#FF6B6B' },
      { name: 'Trainline', url: 'https://www.thetrainline.com', color: '#48D5B5' },
      { name: 'Rentalcars.com', url: 'https://www.rentalcars.com', color: '#1879ca' }
    ]
  };

  useEffect(() => {
    const trip = trips.find(t => t.id === tripId);
    if (trip && trip.bookings) {
      setBookings(trip.bookings);
    }
  }, [trips, tripId]);

  const handleOpenDialog = (booking = null, type = 'hotels') => {
    if (booking) {
      setEditingBooking(booking);
      setBookingForm({
        type: type,
        name: booking.name,
        confirmationNumber: booking.confirmationNumber || '',
        provider: booking.provider || '',
        startDate: new Date(booking.startDate),
        endDate: new Date(booking.endDate),
        amount: booking.amount || '',
        notes: booking.notes || ''
      });
    } else {
      setEditingBooking(null);
      setBookingForm({
        type: type,
        name: '',
        confirmationNumber: '',
        provider: '',
        startDate: new Date(),
        endDate: new Date(),
        amount: '',
        notes: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBooking(null);
  };

  const handleSubmit = async () => {
    try {
      const bookingData = {
        ...bookingForm,
        startDate: bookingForm.startDate.toISOString(),
        endDate: bookingForm.endDate.toISOString()
      };
      
      await addBooking(tripId, bookingData);
      
      // Update local state
      const trip = trips.find(t => t.id === tripId);
      if (trip && trip.bookings) {
        setBookings(trip.bookings);
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving booking:', error);
    }
  };

  const getBookingIcon = (type) => {
    const bookingType = bookingTypes.find(t => t.value === type);
    return bookingType ? bookingType.icon : <EventIcon />;
  };

  const getAllBookings = () => {
    const all = [];
    Object.entries(bookings).forEach(([type, items]) => {
      items.forEach(item => {
        all.push({ ...item, type });
      });
    });
    return all.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  };

  const allBookings = getAllBookings();

  return (
    <Box>
      {/* Quick Booking Links */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {Object.entries(partnerLinks).map(([type, links]) => (
          <Grid item xs={12} md={4} key={type}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  {getBookingIcon(type)}
                  <Typography variant="h6">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {links.map((link) => (
                    <Chip
                      key={link.name}
                      label={link.name}
                      component="a"
                      href={link.url}
                      target="_blank"
                      clickable
                      sx={{
                        bgcolor: link.color,
                        color: 'white',
                        '&:hover': {
                          bgcolor: link.color,
                          filter: 'brightness(0.9)'
                        }
                      }}
                      onDelete={() => {}}
                      deleteIcon={<OpenInNewIcon sx={{ color: 'white !important' }} />}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Bookings List */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Bookings
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Booking
            </Button>
          </Box>

          {allBookings.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <HotelIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No bookings yet
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
                Add your hotel, flight, and transport bookings
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<HotelIcon />}
                  onClick={() => handleOpenDialog(null, 'hotels')}
                >
                  Add Hotel
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FlightIcon />}
                  onClick={() => handleOpenDialog(null, 'flights')}
                >
                  Add Flight
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CarIcon />}
                  onClick={() => handleOpenDialog(null, 'transport')}
                >
                  Add Transport
                </Button>
              </Box>
            </Paper>
          ) : (
            <List>
              {allBookings.map((booking, index) => (
                <React.Fragment key={booking.id}>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        {getBookingIcon(booking.type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={booking.name}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {format(new Date(booking.startDate), 'MMM dd')} - {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            {booking.confirmationNumber && (
                              <Chip
                                size="small"
                                label={`Conf: ${booking.confirmationNumber}`}
                              />
                            )}
                            {booking.provider && (
                              <Chip
                                size="small"
                                label={booking.provider}
                                variant="outlined"
                              />
                            )}
                            {booking.amount && (
                              <Chip
                                size="small"
                                label={`$${booking.amount}`}
                                color="primary"
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => handleOpenDialog(booking, booking.type)} size="small">
                        <EditIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < allBookings.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Booking Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBooking ? 'Edit Booking' : 'Add Booking'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={bookingForm.type}
                  onChange={(e) => setBookingForm({ ...bookingForm, type: e.target.value })}
                  label="Type"
                >
                  {bookingTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={bookingForm.name}
                onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                placeholder={
                  bookingForm.type === 'hotels' ? 'Hotel name' :
                  bookingForm.type === 'flights' ? 'Flight number/route' :
                  bookingForm.type === 'transport' ? 'Transport details' :
                  'Booking name'
                }
                required
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Confirmation Number"
                value={bookingForm.confirmationNumber}
                onChange={(e) => setBookingForm({ ...bookingForm, confirmationNumber: e.target.value })}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Provider"
                value={bookingForm.provider}
                onChange={(e) => setBookingForm({ ...bookingForm, provider: e.target.value })}
                placeholder="e.g., Booking.com"
              />
            </Grid>

            <Grid item xs={6}>
              <DatePicker
                label="Start Date"
                value={bookingForm.startDate}
                onChange={(date) => setBookingForm({ ...bookingForm, startDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>

            <Grid item xs={6}>
              <DatePicker
                label="End Date"
                value={bookingForm.endDate}
                onChange={(date) => setBookingForm({ ...bookingForm, endDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
                minDate={bookingForm.startDate}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount (optional)"
                type="number"
                value={bookingForm.amount}
                onChange={(e) => setBookingForm({ ...bookingForm, amount: e.target.value })}
                placeholder="Total cost"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (optional)"
                multiline
                rows={2}
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                placeholder="Additional details..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!bookingForm.name}
          >
            {editingBooking ? 'Update' : 'Add'} Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingList;