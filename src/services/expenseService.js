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
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { auth } from '../firebase/auth';
import aiService from './aiService';

class ExpenseService {
  constructor() {
    this.collection = 'expenses';
    this.categories = [
      'meals',
      'transportation', 
      'accommodation',
      'supplies',
      'entertainment',
      'communication',
      'other'
    ];
  }

  // Create new expense
  async createExpense(expenseData, receiptFile = null) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      let receiptUrl = null;
      let extractedData = null;

      // Upload receipt image if provided
      if (receiptFile) {
        receiptUrl = await this.uploadReceipt(receiptFile);
        
        // Use AI to extract data from receipt
        try {
          extractedData = await aiService.processExpenseReceipt(receiptFile);
        } catch (aiError) {
          console.warn('AI extraction failed, continuing with manual entry:', aiError);
        }
      }

      const expense = {
        ...expenseData,
        userId: user.uid,
        receiptUrl,
        extractedData,
        status: 'pending', // pending, approved, rejected
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        // If AI extracted data, use it as defaults
        ...(extractedData && {
          vendor: extractedData.vendor || expenseData.vendor,
          amount: extractedData.totalAmount || expenseData.amount,
          currency: extractedData.currency || expenseData.currency,
          category: extractedData.category || expenseData.category,
          date: extractedData.date || expenseData.date,
          description: expenseData.description || extractedData.vendor
        })
      };

      const docRef = await addDoc(collection(db, this.collection), expense);
      return { id: docRef.id, ...expense };
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  // Upload receipt image to Firebase Storage
  async uploadReceipt(file) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const fileName = `receipts/${user.uid}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading receipt:', error);
      throw error;
    }
  }

  // Get expenses for a trip
  async getTripExpenses(tripId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const q = query(
        collection(db, this.collection),
        where('tripId', '==', tripId),
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching trip expenses:', error);
      throw error;
    }
  }

  // Get all user expenses
  async getUserExpenses(startDate = null, endDate = null) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      let q = query(
        collection(db, this.collection),
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );

      // Add date filtering if provided
      if (startDate) {
        q = query(q, where('date', '>=', startDate));
      }
      if (endDate) {
        q = query(q, where('date', '<=', endDate));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching user expenses:', error);
      throw error;
    }
  }

  // Update expense
  async updateExpense(expenseId, updates) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const docRef = doc(db, this.collection, expenseId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });

      return await this.getExpense(expenseId);
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  // Get single expense
  async getExpense(expenseId) {
    try {
      const docRef = doc(db, this.collection, expenseId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Expense not found');
      }
    } catch (error) {
      console.error('Error fetching expense:', error);
      throw error;
    }
  }

  // Delete expense
  async deleteExpense(expenseId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const expense = await this.getExpense(expenseId);
      
      // Delete receipt image from storage if exists
      if (expense.receiptUrl) {
        try {
          const receiptRef = ref(storage, expense.receiptUrl);
          await deleteObject(receiptRef);
        } catch (storageError) {
          console.warn('Error deleting receipt from storage:', storageError);
        }
      }

      await deleteDoc(doc(db, this.collection, expenseId));
      return true;
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  // Generate expense report for a trip
  async generateTripReport(tripId) {
    try {
      const expenses = await this.getTripExpenses(tripId);
      const analysis = await aiService.analyzeExpenses(expenses);

      const report = {
        tripId,
        expenses,
        analysis,
        generatedAt: new Date().toISOString(),
        summary: {
          totalExpenses: expenses.length,
          totalAmount: expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
          categories: this.groupByCategory(expenses),
          dateRange: this.getDateRange(expenses)
        }
      };

      return report;
    } catch (error) {
      console.error('Error generating trip report:', error);
      throw error;
    }
  }

  // Group expenses by category
  groupByCategory(expenses) {
    const grouped = {};
    this.categories.forEach(cat => {
      grouped[cat] = {
        count: 0,
        total: 0,
        expenses: []
      };
    });

    expenses.forEach(expense => {
      const category = expense.category || 'other';
      if (grouped[category]) {
        grouped[category].count++;
        grouped[category].total += expense.amount || 0;
        grouped[category].expenses.push(expense);
      }
    });

    return grouped;
  }

  // Get date range from expenses
  getDateRange(expenses) {
    if (expenses.length === 0) return null;

    const dates = expenses.map(exp => new Date(exp.date)).filter(date => !isNaN(date));
    if (dates.length === 0) return null;

    return {
      start: new Date(Math.min(...dates)).toISOString().split('T')[0],
      end: new Date(Math.max(...dates)).toISOString().split('T')[0]
    };
  }

  // Export expenses to CSV
  exportToCSV(expenses) {
    const headers = [
      'Date',
      'Vendor',
      'Description', 
      'Amount',
      'Currency',
      'Category',
      'Trip ID',
      'Status'
    ];

    const rows = expenses.map(expense => [
      expense.date,
      expense.vendor || '',
      expense.description || '',
      expense.amount || 0,
      expense.currency || 'USD',
      expense.category || 'other',
      expense.tripId || '',
      expense.status || 'pending'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Validate expense data
  validateExpense(expenseData) {
    const errors = [];

    if (!expenseData.vendor?.trim()) {
      errors.push('Vendor is required');
    }

    if (!expenseData.amount || expenseData.amount <= 0) {
      errors.push('Valid amount is required');
    }

    if (!expenseData.date) {
      errors.push('Date is required');
    }

    if (!expenseData.category || !this.categories.includes(expenseData.category)) {
      errors.push('Valid category is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get expense statistics for dashboard
  async getExpenseStats(userId = null, timeframe = 'month') {
    try {
      const user = userId || auth.currentUser?.uid;
      if (!user) throw new Error('User not authenticated');

      const now = new Date();
      let startDate;

      switch (timeframe) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const expenses = await this.getUserExpenses(
        startDate.toISOString().split('T')[0],
        now.toISOString().split('T')[0]
      );

      return {
        totalExpenses: expenses.length,
        totalAmount: expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
        averageExpense: expenses.length > 0 ? 
          expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0) / expenses.length : 0,
        categoryBreakdown: this.groupByCategory(expenses),
        recentExpenses: expenses.slice(0, 5),
        timeframe,
        period: `${startDate.toLocaleDateString()} - ${now.toLocaleDateString()}`
      };
    } catch (error) {
      console.error('Error getting expense stats:', error);
      throw error;
    }
  }
}

export default new ExpenseService(); 