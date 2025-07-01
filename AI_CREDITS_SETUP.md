# AI Credits Purchase System Setup Guide

This guide explains how to set up and configure the AI credits purchase system for Triply.

## Overview

The AI credits system allows users to:
- Purchase credits using PayPal
- Track credit usage across different AI features
- View transaction history
- Receive low credit warnings
- Export credit history

## Features

### 1. Credit Purchase
- Multiple credit packages (Starter, Professional, Enterprise, Unlimited)
- PayPal integration for secure payments
- Real-time credit balance updates
- Purchase confirmation and receipts

### 2. Credit Usage Tracking
- Automatic deduction for AI operations
- Operation-specific credit costs:
  - Company Enrichment: 5 credits
  - Itinerary Planning: 10 credits
  - Receipt OCR: 3 credits
  - Company Suggestions: 8 credits
  - Expense Analysis: 2 credits

### 3. User Interface Components
- **Credit Display**: Shows current balance in navbar
- **Purchase Dialog**: Beautiful package selection and payment flow
- **Credit History**: Transaction log with filtering and export
- **Low Credit Warning**: Alerts users when running low

## Setup Instructions

### 1. PayPal Integration

1. **Create a PayPal Developer Account**
   - Go to [developer.paypal.com](https://developer.paypal.com)
   - Sign up or log in with your PayPal account

2. **Create an App**
   - Navigate to "My Apps & Credentials"
   - Click "Create App"
   - Choose "Merchant" as the app type
   - Name your app (e.g., "Triply AI Credits")

3. **Get Your Client ID**
   - Copy the Client ID from your app
   - For testing, use the Sandbox Client ID
   - For production, switch to Live and use the Live Client ID

4. **Configure Environment Variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Add your PayPal Client ID
   REACT_APP_PAYPAL_CLIENT_ID=your_paypal_client_id_here
   ```

### 2. Firebase Configuration

The credit system uses Firebase Firestore to store:
- User credit balances
- Transaction history
- Credit usage logs

Ensure your Firebase project has the following collections:
- `userCredits`: Stores user credit balances
- `transactions`: Stores purchase history
- `creditUsage`: Stores usage logs

### 3. Testing the System

1. **Test Mode Setup**
   - Use PayPal Sandbox credentials
   - Create test buyer accounts in PayPal Sandbox
   - Test purchases with sandbox accounts

2. **Test Credit Purchase**
   - Click on the credit display or "Buy More" button
   - Select a package
   - Complete payment with test credentials
   - Verify credits are added to your account

3. **Test Credit Usage**
   - Try AI features that consume credits
   - Verify credits are deducted correctly
   - Check transaction history

## Credit Package Configuration

To modify credit packages, edit `src/services/paymentService.js`:

```javascript
this.creditPackages = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 50,
    price: 9.99,
    description: 'Perfect for getting started',
    popular: false
  },
  // Add more packages...
];
```

## Security Considerations

1. **API Keys**
   - Never commit API keys to version control
   - Use environment variables for all sensitive data
   - Rotate keys regularly

2. **Payment Processing**
   - Always validate payments server-side (future enhancement)
   - Log all transactions for audit purposes
   - Implement rate limiting for API calls

3. **Credit Management**
   - Use atomic operations for credit updates
   - Implement transaction logs for accountability
   - Regular backups of credit data

## Troubleshooting

### PayPal Button Not Showing
- Check if `REACT_APP_PAYPAL_CLIENT_ID` is set
- Verify the Client ID is correct
- Check browser console for errors

### Credits Not Updating
- Check Firestore permissions
- Verify user is authenticated
- Check browser console for errors

### Payment Failing
- Verify PayPal account is properly configured
- Check if using correct environment (sandbox/live)
- Ensure buyer account has funds (for sandbox)

## Future Enhancements

1. **Stripe Integration**: Add alternative payment method
2. **Subscription Plans**: Monthly unlimited credits
3. **Team Credits**: Shared credit pools for organizations
4. **Credit Gifting**: Allow users to gift credits
5. **Promotional Codes**: Discount codes for credit packages
6. **Server-side Validation**: Move payment validation to backend

## Support

For issues or questions:
1. Check the browser console for errors
2. Review Firebase logs
3. Check PayPal transaction logs
4. Contact support with transaction IDs