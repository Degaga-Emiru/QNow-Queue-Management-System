const { db, FieldValue, Timestamp } = require('../config/firebase-admin.config');
const { COLLECTIONS } = require('../config/constants');

class Business {
  constructor(data) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.address = data.address || '';
    this.ownerId = data.ownerId || '';
    this.businessCode = data.businessCode || this.generateBusinessCode();
    this.category = data.category || 'general';
    this.description = data.description || '';
    this.logo = data.logo || '';
    this.website = data.website || '';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.verified = data.verified || false;
    this.settings = data.settings || {
      maxQueueLength: 50,
      maxWaitTime: 120,
      notifyBeforePositions: 3,
      autoCallInterval: 30,
      allowRemoteJoin: true,
      requireCustomerInfo: false,
      enableSmsNotifications: false,
      enableEmailNotifications: true,
      enablePushNotifications: true
    };
    this.operatingHours = data.operatingHours || {
      monday: { open: '09:00', close: '17:00', isOpen: true },
      tuesday: { open: '09:00', close: '17:00', isOpen: true },
      wednesday: { open: '09:00', close: '17:00', isOpen: true },
      thursday: { open: '09:00', close: '17:00', isOpen: true },
      friday: { open: '09:00', close: '17:00', isOpen: true },
      saturday: { open: '10:00', close: '14:00', isOpen: true },
      sunday: { open: '00:00', close: '00:00', isOpen: false }
    };
    this.createdAt = data.createdAt || Timestamp.now();
    this.updatedAt = data.updatedAt || Timestamp.now();
    this.qrCode = data.qrCode || '';
    this.apiKey = data.apiKey || this.generateApiKey();
    this.stats = data.stats || {
      totalCustomersServed: 0,
      avgWaitTime: 0,
      avgServingTime: 0,
      customerSatisfaction: 0,
      peakHours: []
    };
  }

  generateBusinessCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  generateApiKey() {
    return 'qnow_' + require('crypto').randomBytes(32).toString('hex');
  }

  toFirestore() {
    return {
      name: this.name,
      email: this.email,
      phone: this.phone,
      address: this.address,
      ownerId: this.ownerId,
      businessCode: this.businessCode,
      category: this.category,
      description: this.description,
      logo: this.logo,
      website: this.website,
      isActive: this.isActive,
      verified: this.verified,
      settings: this.settings,
      operatingHours: this.operatingHours,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      qrCode: this.qrCode,
      apiKey: this.apiKey,
      stats: this.stats
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Business({
      id: doc.id,
      ...data
    });
  }

  // Static methods
  static async create(businessData) {
    try {
      // Check if business code already exists
      const existing = await Business.findByCode(businessData.businessCode);
      if (existing) {
        businessData.businessCode = new Business(businessData).generateBusinessCode();
      }

      const business = new Business(businessData);
      const businessRef = db.collection(COLLECTIONS.BUSINESSES).doc();
      business.id = businessRef.id;
      
      await businessRef.set(business.toFirestore());
      return business;
    } catch (error) {
      throw new Error(`Error creating business: ${error.message}`);
    }
  }

  static async findById(businessId) {
    try {
      const businessRef = db.collection(COLLECTIONS.BUSINESSES).doc(businessId);
      const doc = await businessRef.get();
      
      if (!doc.exists) {
        return null;
      }
      
      return Business.fromFirestore(doc);
    } catch (error) {
      throw new Error(`Error finding business: ${error.message}`);
    }
  }

  static async findByCode(businessCode) {
    try {
      const businessesRef = db.collection(COLLECTIONS.BUSINESSES);
      const snapshot = await businessesRef.where('businessCode', '==', businessCode).limit(1).get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return Business.fromFirestore(doc);
    } catch (error) {
      throw new Error(`Error finding business by code: ${error.message}`);
    }
  }

  static async findByOwner(ownerId) {
    try {
      const businessesRef = db.collection(COLLECTIONS.BUSINESSES);
      const snapshot = await businessesRef.where('ownerId', '==', ownerId).get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => Business.fromFirestore(doc));
    } catch (error) {
      throw new Error(`Error finding businesses by owner: ${error.message}`);
    }
  }

  static async update(businessId, updateData) {
    try {
      const businessRef = db.collection(COLLECTIONS.BUSINESSES).doc(businessId);
      updateData.updatedAt = Timestamp.now();
      
      await businessRef.update(updateData);
      return await Business.findById(businessId);
    } catch (error) {
      throw new Error(`Error updating business: ${error.message}`);
    }
  }

  static async updateStats(businessId, statsData) {
    try {
      const businessRef = db.collection(COLLECTIONS.BUSINESSES).doc(businessId);
      
      await businessRef.update({
        'stats': statsData,
        'updatedAt': Timestamp.now()
      });
      
      return await Business.findById(businessId);
    } catch (error) {
      throw new Error(`Error updating business stats: ${error.message}`);
    }
  }

  static async delete(businessId) {
    try {
      const businessRef = db.collection(COLLECTIONS.BUSINESSES).doc(businessId);
      await businessRef.delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting business: ${error.message}`);
    }
  }

  static async getAll(limit = 20, offset = 0) {
    try {
      const businessesRef = db.collection(COLLECTIONS.BUSINESSES);
      const snapshot = await businessesRef
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => Business.fromFirestore(doc));
    } catch (error) {
      throw new Error(`Error getting businesses: ${error.message}`);
    }
  }
}

module.exports = Business;