const { db, auth, FieldValue } = require('../config/firebase-admin.config');
const { COLLECTIONS } = require('../config/constants');

// Firebase service for common operations
class FirebaseService {
  
  // Batch write operations
  static async batchWrite(operations) {
    try {
      const batch = db.batch();
      
      operations.forEach(op => {
        if (op.type === 'set') {
          batch.set(db.collection(op.collection).doc(op.id), op.data);
        } else if (op.type === 'update') {
          batch.update(db.collection(op.collection).doc(op.id), op.data);
        } else if (op.type === 'delete') {
          batch.delete(db.collection(op.collection).doc(op.id));
        }
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      throw new Error(`Batch write failed: ${error.message}`);
    }
  }
  
  // Get document with real-time updates
  static async getDocumentWithListener(collection, docId, callback) {
    try {
      const unsubscribe = db.collection(collection)
        .doc(docId)
        .onSnapshot((doc) => {
          if (doc.exists) {
            callback(null, { id: doc.id, ...doc.data() });
          } else {
            callback(new Error('Document not found'), null);
          }
        }, (error) => {
          callback(error, null);
        });
      
      return unsubscribe;
    } catch (error) {
      throw new Error(`Document listener error: ${error.message}`);
    }
  }
  
  // Query with pagination
  static async queryWithPagination(collection, queryParams, options = {}) {
    try {
      const {
        where = [],
        orderBy = ['createdAt', 'desc'],
        limit = 20,
        startAfter = null
      } = options;
      
      let query = db.collection(collection);
      
      // Apply where conditions
      where.forEach(condition => {
        query = query.where(condition.field, condition.operator, condition.value);
      });
      
      // Apply ordering
      query = query.orderBy(orderBy[0], orderBy[1]);
      
      // Apply pagination
      if (startAfter) {
        query = query.startAfter(startAfter);
      }
      
      query = query.limit(limit + 1); // Get one extra to check for next page
      
      const snapshot = await query.get();
      const documents = [];
      
      snapshot.forEach(doc => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      const hasNextPage = documents.length > limit;
      if (hasNextPage) {
        documents.pop(); // Remove the extra document
      }
      
      const lastDoc = documents.length > 0 ? documents[documents.length - 1] : null;
      const nextStartAfter = hasNextPage ? lastDoc : null;
      
      return {
        documents,
        hasNextPage,
        nextStartAfter,
        total: documents.length
      };
    } catch (error) {
      throw new Error(`Query with pagination failed: ${error.message}`);
    }
  }
  
  // Get collection statistics
  static async getCollectionStats(collection, filters = {}) {
    try {
      let query = db.collection(collection);
      
      // Apply filters
      Object.entries(filters).forEach(([field, value]) => {
        query = query.where(field, '==', value);
      });
      
      const snapshot = await query.get();
      return snapshot.size;
    } catch (error) {
      throw new Error(`Get collection stats failed: ${error.message}`);
    }
  }
  
  // Create Firebase user
  static async createFirebaseUser(userData) {
    try {
      const user = await auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.fullName,
        phoneNumber: userData.phone,
        disabled: false
      });
      
      // Set custom claims for role-based access
      await auth.setCustomUserClaims(user.uid, {
        role: userData.role,
        businessId: userData.businessId
      });
      
      return user;
    } catch (error) {
      throw new Error(`Create Firebase user failed: ${error.message}`);
    }
  }
  
  // Update Firebase user
  static async updateFirebaseUser(uid, updates) {
    try {
      await auth.updateUser(uid, updates);
      return true;
    } catch (error) {
      throw new Error(`Update Firebase user failed: ${error.message}`);
    }
  }
  
  // Verify Firebase token
  static async verifyFirebaseToken(token) {
    try {
      const decodedToken = await auth.verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      throw new Error(`Verify Firebase token failed: ${error.message}`);
    }
  }
  
  // Send Firebase Cloud Message (FCM)
  static async sendFCMNotification(tokens, notification, data = {}) {
    try {
      // This requires Firebase Cloud Messaging setup
      // For now, we'll return a mock implementation
      console.log('FCM Notification:', {
        tokens,
        notification,
        data
      });
      
      return {
        success: true,
        message: 'FCM notification sent (mock)'
      };
    } catch (error) {
      throw new Error(`Send FCM notification failed: ${error.message}`);
    }
  }
  
  // Clean up old documents (for maintenance)
  static async cleanupOldDocuments(collection, field, daysOld) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const snapshot = await db.collection(collection)
        .where(field, '<', cutoffDate)
        .get();
      
      const batch = db.batch();
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      return { deleted: snapshot.size };
    } catch (error) {
      throw new Error(`Cleanup old documents failed: ${error.message}`);
    }
  }
}

module.exports = FirebaseService;