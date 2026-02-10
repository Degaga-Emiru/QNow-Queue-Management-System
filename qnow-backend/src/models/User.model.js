const { db, FieldValue, Timestamp } = require('../config/firebase-admin.config');
const { COLLECTIONS, USER_ROLES } = require('../config/constants');

class User {
  constructor(data) {
    this.id = data.id || null;
    this.email = data.email || '';
    this.password = data.password || '';
    this.fullName = data.fullName || '';
    this.phone = data.phone || '';
    this.role = data.role || USER_ROLES.CUSTOMER;
    this.businessId = data.businessId || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.emailVerified = data.emailVerified || false;
    this.phoneVerified = data.phoneVerified || false;
    this.createdAt = data.createdAt || Timestamp.now();
    this.updatedAt = data.updatedAt || Timestamp.now();
    this.lastLogin = data.lastLogin || null;
    this.profileImage = data.profileImage || '';
    this.notificationPreferences = data.notificationPreferences || {
      email: true,
      sms: false,
      push: true
    };
  }

  // Convert to Firestore data
  toFirestore() {
    return {
      email: this.email,
      fullName: this.fullName,
      phone: this.phone,
      role: this.role,
      businessId: this.businessId,
      isActive: this.isActive,
      emailVerified: this.emailVerified,
      phoneVerified: this.phoneVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLogin: this.lastLogin,
      profileImage: this.profileImage,
      notificationPreferences: this.notificationPreferences
    };
  }

  // Static methods
  static fromFirestore(doc) {
    const data = doc.data();
    return new User({
      id: doc.id,
      ...data
    });
  }

  // Database operations
  static async create(userData) {
    try {
      const user = new User(userData);
      const userRef = db.collection(COLLECTIONS.USERS).doc();
      user.id = userRef.id;
      
      await userRef.set(user.toFirestore());
      return user;
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  static async findById(userId) {
    try {
      const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
      const doc = await userRef.get();
      
      if (!doc.exists) {
        return null;
      }
      
      return User.fromFirestore(doc);
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  static async findByEmail(email) {
    try {
      const usersRef = db.collection(COLLECTIONS.USERS);
      const snapshot = await usersRef.where('email', '==', email).limit(1).get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return User.fromFirestore(doc);
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  static async update(userId, updateData) {
    try {
      const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
      updateData.updatedAt = Timestamp.now();
      
      await userRef.update(updateData);
      return await User.findById(userId);
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  static async delete(userId) {
    try {
      const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
      await userRef.delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  static async findByBusinessId(businessId) {
    try {
      const usersRef = db.collection(COLLECTIONS.USERS);
      const snapshot = await usersRef.where('businessId', '==', businessId).get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => User.fromFirestore(doc));
    } catch (error) {
      throw new Error(`Error finding users by business: ${error.message}`);
    }
  }
}

module.exports = User;