import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COMPANIES_COLLECTION = 'companies';
const CONTACTS_COLLECTION = 'contacts';
const SCHEDULED_ACTIONS_COLLECTION = 'scheduledActions';
const COMMENTS_COLLECTION = 'comments';

// Helper function to get user ID
const getUserId = (user) => {
  if (!user) throw new Error('User not authenticated');
  return user.uid;
};

// Company operations
export const createCompany = async (user, companyData) => {
  try {
    const userId = getUserId(user);
    
    // Separate embedded data from main company data
    const { contacts, scheduledActions, ...mainCompanyData } = companyData;
    
    const docRef = await addDoc(collection(db, COMPANIES_COLLECTION), {
      ...mainCompanyData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const companyId = docRef.id;
    
    // Add contacts if any
    if (contacts && contacts.length > 0) {
      const contactPromises = contacts.map(contact => 
        addDoc(collection(db, CONTACTS_COLLECTION), {
          ...contact,
          companyId,
          userId,
          createdAt: serverTimestamp()
        })
      );
      await Promise.all(contactPromises);
    }
    
    // Add scheduled actions if any
    if (scheduledActions && scheduledActions.length > 0) {
      const actionPromises = scheduledActions.map(action => 
        addDoc(collection(db, SCHEDULED_ACTIONS_COLLECTION), {
          ...action,
          companyId,
          userId,
          createdAt: serverTimestamp()
        })
      );
      await Promise.all(actionPromises);
    }
    
    return companyId;
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};

export const getCompanies = async (user) => {
  try {
    const userId = getUserId(user);
    const q = query(
      collection(db, COMPANIES_COLLECTION), 
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting companies:', error);
    throw error;
  }
};

export const getCompany = async (user, companyId) => {
  try {
    const userId = getUserId(user);
    const docRef = doc(db, COMPANIES_COLLECTION, companyId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const companyData = { id: docSnap.id, ...docSnap.data() };
      
      // Verify user owns this company
      if (companyData.userId !== userId) {
        throw new Error('Unauthorized access to company');
      }
      
      return companyData;
    } else {
      throw new Error('Company not found');
    }
  } catch (error) {
    console.error('Error getting company:', error);
    throw error;
  }
};

export const updateCompany = async (user, companyId, updateData) => {
  try {
    const userId = getUserId(user);
    
    // Verify user owns this company first
    await getCompany(user, companyId);
    
    // Separate embedded data from main company data
    const { contacts, scheduledActions, ...mainUpdateData } = updateData;
    
    const docRef = doc(db, COMPANIES_COLLECTION, companyId);
    await updateDoc(docRef, {
      ...mainUpdateData,
      updatedAt: serverTimestamp()
    });
    
    // Handle contacts update (simple approach: delete and recreate)
    if (contacts !== undefined) {
      // Delete existing contacts
      const existingContactsQuery = query(
        collection(db, CONTACTS_COLLECTION),
        where('companyId', '==', companyId),
        where('userId', '==', userId)
      );
      const existingContacts = await getDocs(existingContactsQuery);
      const deletePromises = existingContacts.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Add new contacts
      if (contacts.length > 0) {
        const contactPromises = contacts.map(contact => 
          addDoc(collection(db, CONTACTS_COLLECTION), {
            ...contact,
            companyId,
            userId,
            createdAt: serverTimestamp()
          })
        );
        await Promise.all(contactPromises);
      }
    }
    
    // Handle scheduled actions update
    if (scheduledActions !== undefined) {
      // Delete existing actions
      const existingActionsQuery = query(
        collection(db, SCHEDULED_ACTIONS_COLLECTION),
        where('companyId', '==', companyId),
        where('userId', '==', userId)
      );
      const existingActions = await getDocs(existingActionsQuery);
      const deletePromises = existingActions.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Add new actions
      if (scheduledActions.length > 0) {
        const actionPromises = scheduledActions.map(action => 
          addDoc(collection(db, SCHEDULED_ACTIONS_COLLECTION), {
            ...action,
            companyId,
            userId,
            createdAt: serverTimestamp()
          })
        );
        await Promise.all(actionPromises);
      }
    }
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};

export const deleteCompany = async (user, companyId) => {
  try {
    const userId = getUserId(user);
    
    // Verify user owns this company first
    await getCompany(user, companyId);
    
    // Delete related data first
    const [contactsQuery, actionsQuery, commentsQuery] = [
      query(collection(db, CONTACTS_COLLECTION), where('companyId', '==', companyId), where('userId', '==', userId)),
      query(collection(db, SCHEDULED_ACTIONS_COLLECTION), where('companyId', '==', companyId), where('userId', '==', userId)),
      query(collection(db, COMMENTS_COLLECTION), where('companyId', '==', companyId), where('userId', '==', userId))
    ];
    
    const [contacts, actions, comments] = await Promise.all([
      getDocs(contactsQuery),
      getDocs(actionsQuery),
      getDocs(commentsQuery)
    ]);
    
    const deletePromises = [
      ...contacts.docs.map(doc => deleteDoc(doc.ref)),
      ...actions.docs.map(doc => deleteDoc(doc.ref)),
      ...comments.docs.map(doc => deleteDoc(doc.ref))
    ];
    
    await Promise.all(deletePromises);
    
    // Finally delete the company
    await deleteDoc(doc(db, COMPANIES_COLLECTION, companyId));
  } catch (error) {
    console.error('Error deleting company:', error);
    throw error;
  }
};

// Get all unique tags for the user
export const getUserTags = async (user) => {
  try {
    const companies = await getCompanies(user);
    const allTags = companies.reduce((tags, company) => {
      if (company.tags) {
        tags.push(...company.tags);
      }
      return tags;
    }, []);
    return Array.from(new Set(allTags)).sort();
  } catch (error) {
    console.error('Error getting user tags:', error);
    return [];
  }
};

// Contact operations
export const addContact = async (user, companyId, contactData) => {
  try {
    const userId = getUserId(user);
    
    // Verify user owns this company
    await getCompany(user, companyId);
    
    const docRef = await addDoc(collection(db, CONTACTS_COLLECTION), {
      ...contactData,
      companyId,
      userId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
};

export const getContacts = async (user, companyId) => {
  try {
    const userId = getUserId(user);
    const q = query(
      collection(db, CONTACTS_COLLECTION),
      where('companyId', '==', companyId),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting contacts:', error);
    throw error;
  }
};

export const updateContact = async (user, contactId, updateData) => {
  try {
    const userId = getUserId(user);
    
    // Verify user owns this contact
    const contactRef = doc(db, CONTACTS_COLLECTION, contactId);
    const contactSnap = await getDoc(contactRef);
    
    if (!contactSnap.exists() || contactSnap.data().userId !== userId) {
      throw new Error('Contact not found or unauthorized');
    }
    
    await updateDoc(contactRef, updateData);
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
};

export const deleteContact = async (user, contactId) => {
  try {
    const userId = getUserId(user);
    
    // Verify user owns this contact
    const contactRef = doc(db, CONTACTS_COLLECTION, contactId);
    const contactSnap = await getDoc(contactRef);
    
    if (!contactSnap.exists() || contactSnap.data().userId !== userId) {
      throw new Error('Contact not found or unauthorized');
    }
    
    await deleteDoc(contactRef);
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
};

// Scheduled actions operations
export const addScheduledAction = async (user, companyId, actionData) => {
  try {
    const userId = getUserId(user);
    
    // Verify user owns this company
    await getCompany(user, companyId);
    
    const docRef = await addDoc(collection(db, SCHEDULED_ACTIONS_COLLECTION), {
      ...actionData,
      companyId,
      userId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding scheduled action:', error);
    throw error;
  }
};

export const getScheduledActions = async (user, companyId) => {
  try {
    const userId = getUserId(user);
    const q = query(
      collection(db, SCHEDULED_ACTIONS_COLLECTION),
      where('companyId', '==', companyId),
      where('userId', '==', userId),
      orderBy('scheduledDate', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting scheduled actions:', error);
    throw error;
  }
};

export const updateScheduledAction = async (user, actionId, updateData) => {
  try {
    const userId = getUserId(user);
    
    // Verify user owns this action
    const actionRef = doc(db, SCHEDULED_ACTIONS_COLLECTION, actionId);
    const actionSnap = await getDoc(actionRef);
    
    if (!actionSnap.exists() || actionSnap.data().userId !== userId) {
      throw new Error('Scheduled action not found or unauthorized');
    }
    
    await updateDoc(actionRef, updateData);
  } catch (error) {
    console.error('Error updating scheduled action:', error);
    throw error;
  }
};

export const deleteScheduledAction = async (user, actionId) => {
  try {
    const userId = getUserId(user);
    
    // Verify user owns this action
    const actionRef = doc(db, SCHEDULED_ACTIONS_COLLECTION, actionId);
    const actionSnap = await getDoc(actionRef);
    
    if (!actionSnap.exists() || actionSnap.data().userId !== userId) {
      throw new Error('Scheduled action not found or unauthorized');
    }
    
    await deleteDoc(actionRef);
  } catch (error) {
    console.error('Error deleting scheduled action:', error);
    throw error;
  }
};

// Comments operations
export const addComment = async (user, companyId, commentData) => {
  try {
    const userId = getUserId(user);
    
    // Verify user owns this company
    await getCompany(user, companyId);
    
    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
      ...commentData,
      companyId,
      userId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const getComments = async (user, companyId) => {
  try {
    const userId = getUserId(user);
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where('companyId', '==', companyId),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
};

export const deleteComment = async (user, commentId) => {
  try {
    const userId = getUserId(user);
    
    // Verify user owns this comment
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    const commentSnap = await getDoc(commentRef);
    
    if (!commentSnap.exists() || commentSnap.data().userId !== userId) {
      throw new Error('Comment not found or unauthorized');
    }
    
    await deleteDoc(commentRef);
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}; 