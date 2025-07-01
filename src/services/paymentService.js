import { doc, setDoc, updateDoc, increment, collection, addDoc, query, where, orderBy, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { auth } from '../firebase/auth';

class PaymentService {
  constructor() {
    // Credit packages available for purchase
    this.creditPackages = [
      {
        id: 'starter',
        name: 'Starter Pack',
        credits: 50,
        price: 9.99,
        description: 'Perfect for getting started with AI features',
        popular: false
      },
      {
        id: 'professional',
        name: 'Professional Pack',
        credits: 150,
        price: 24.99,
        description: 'Great for regular business trip planning',
        popular: true
      },
      {
        id: 'enterprise',
        name: 'Enterprise Pack',
        credits: 400,
        price: 59.99,
        description: 'Best value for frequent travelers',
        popular: false
      },
      {
        id: 'unlimited',
        name: 'Unlimited Monthly',
        credits: 1000,
        price: 99.99,
        description: 'Unlimited AI features for a month',
        popular: false
      }
    ];
  }

  // Get available credit packages
  getCreditPackages() {
    return this.creditPackages;
  }

  // Create PayPal order
  async createPayPalOrder(packageId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User must be authenticated');

      const package_ = this.creditPackages.find(pkg => pkg.id === packageId);
      if (!package_) throw new Error('Invalid package selected');

      // In a real implementation, you'd call your backend API
      // For now, we'll simulate the PayPal order creation
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store pending transaction
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        packageId: packageId,
        orderId: orderId,
        status: 'pending',
        amount: package_.price,
        credits: package_.credits,
        createdAt: new Date(),
        paymentMethod: 'paypal'
      });

      return {
        orderId,
        amount: package_.price,
        currency: 'USD'
      };
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw error;
    }
  }

  // Process completed PayPal payment
  async processPayPalPayment(orderId, paymentDetails) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User must be authenticated');

      // Find the pending transaction
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where('userId', '==', user.uid),
        where('orderId', '==', orderId),
        where('status', '==', 'pending')
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        throw new Error('Transaction not found or already processed');
      }

      const transactionDoc = snapshot.docs[0];
      const transaction = transactionDoc.data();

      // Update transaction status
      await updateDoc(transactionDoc.ref, {
        status: 'completed',
        completedAt: new Date(),
        paypalPaymentId: paymentDetails.paymentID,
        paypalPayerEmail: paymentDetails.payerEmail,
        paypalPayerName: paymentDetails.payerName
      });

      // Add credits to user account
      await this.addCreditsToUser(user.uid, transaction.credits);

      // Return success details
      return {
        success: true,
        creditsAdded: transaction.credits,
        transactionId: transactionDoc.id,
        packageName: this.creditPackages.find(pkg => pkg.id === transaction.packageId)?.name
      };

    } catch (error) {
      console.error('Error processing PayPal payment:', error);
      throw error;
    }
  }

  // Add credits to user account
  async addCreditsToUser(userId, credits) {
    try {
      const userCreditsRef = doc(db, 'userCredits', userId);
      
      // Use increment to add credits atomically
      await updateDoc(userCreditsRef, {
        available: increment(credits),
        total: increment(credits),
        lastPurchase: new Date()
      }).catch(async () => {
        // If document doesn't exist, create it
        await setDoc(userCreditsRef, {
          available: credits,
          used: 0,
          total: credits,
          lastPurchase: new Date(),
          createdAt: new Date()
        });
      });

      return true;
    } catch (error) {
      console.error('Error adding credits to user:', error);
      throw error;
    }
  }

  // Get user's transaction history
  async getUserTransactions(userId = null) {
    try {
      const user = userId || auth.currentUser?.uid;
      if (!user) throw new Error('User not authenticated');

      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where('userId', '==', user),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const transactions = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        const package_ = this.creditPackages.find(pkg => pkg.id === data.packageId);
        
        transactions.push({
          id: doc.id,
          ...data,
          packageName: package_?.name || 'Unknown Package',
          createdAt: data.createdAt?.toDate(),
          completedAt: data.completedAt?.toDate()
        });
      });

      return transactions;
    } catch (error) {
      console.error('Error getting user transactions:', error);
      throw error;
    }
  }

  // Get user's current credit balance
  async getUserCredits(userId = null) {
    try {
      const user = userId || auth.currentUser?.uid;
      if (!user) throw new Error('User not authenticated');

      const userCreditsRef = doc(db, 'userCredits', user);
      const creditsDoc = await getDoc(userCreditsRef);

      if (creditsDoc.exists()) {
        return creditsDoc.data();
      } else {
        // Return default credits for new users
        return {
          available: 10, // Free starter credits
          used: 0,
          total: 10
        };
      }
    } catch (error) {
      console.error('Error getting user credits:', error);
      throw error;
    }
  }

  // Deduct credits when AI features are used
  async deductCredits(userId, amount, operation) {
    try {
      const user = userId || auth.currentUser?.uid;
      if (!user) throw new Error('User not authenticated');

      const userCreditsRef = doc(db, 'userCredits', user);
      
      await updateDoc(userCreditsRef, {
        available: increment(-amount),
        used: increment(amount),
        lastUsed: new Date()
      });

      // Log credit usage
      await addDoc(collection(db, 'creditUsage'), {
        userId: user,
        operation: operation,
        creditsUsed: amount,
        timestamp: new Date()
      });

      return true;
    } catch (error) {
      console.error('Error deducting credits:', error);
      throw error;
    }
  }
}

const paymentService = new PaymentService();
export default paymentService; 