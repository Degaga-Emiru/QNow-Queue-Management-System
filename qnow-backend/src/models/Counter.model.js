const { db, FieldValue, Timestamp } = require('../config/firebase-admin.config');
const { COLLECTIONS, COUNTER_STATUS } = require('../config/constants');

class Counter {
  constructor(data) {
    this.id = data.id || null;
    this.businessId = data.businessId || '';
    this.name = data.name || '';
    this.number = data.number || 1;
    this.serviceType = data.serviceType || 'general';
    this.staffId = data.staffId || null;
    this.staffName = data.staffName || '';
    this.status = data.status || COUNTER_STATUS.INACTIVE;
    this.currentQueueId = data.currentQueueId || null;
    this.currentQueueNumber = data.currentQueueNumber || '';
    nextAvailableAt: data.nextAvailableAt || null;
    this.settings = data.settings || {
      autoCall: false,
      maxCustomersPerHour: 20,
      breakDuration: 15, // minutes
      breakFrequency: 120 // minutes
    };
    this.stats = data.stats || {
      servedToday: 0,
      avgServingTime: 0,
      totalServed: 0,
      efficiency: 0
    };
    this.createdAt = data.createdAt || Timestamp.now();
    this.updatedAt = data.updatedAt || Timestamp.now();
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  toFirestore() {
    return {
      businessId: this.businessId,
      name: this.name,
      number: this.number,
      serviceType: this.serviceType,
      staffId: this.staffId,
      staffName: this.staffName,
      status: this.status,
      currentQueueId: this.currentQueueId,
      currentQueueNumber: this.currentQueueNumber,
      nextAvailableAt: this.nextAvailableAt,
      settings: this.settings,
      stats: this.stats,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Counter({
      id: doc.id,
      ...data
    });
  }

  // Static methods
  static async create(counterData) {
    try {
      const counter = new Counter(counterData);
      const counterRef = db.collection(COLLECTIONS.COUNTERS).doc();
      counter.id = counterRef.id;
      
      await counterRef.set(counter.toFirestore());
      return counter;
    } catch (error) {
      throw new Error(`Error creating counter: ${error.message}`);
    }
  }

  static async findById(counterId) {
    try {
      const counterRef = db.collection(COLLECTIONS.COUNTERS).doc(counterId);
      const doc = await counterRef.get();
      
      if (!doc.exists) {
        return null;
      }
      
      return Counter.fromFirestore(doc);
    } catch (error) {
      throw new Error(`Error finding counter: ${error.message}`);
    }
  }

  static async findByBusinessId(businessId) {
    try {
      const countersRef = db.collection(COLLECTIONS.COUNTERS);
      const snapshot = await countersRef
        .where('businessId', '==', businessId)
        .orderBy('number')
        .get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => Counter.fromFirestore(doc));
    } catch (error) {
      throw new Error(`Error finding counters by business: ${error.message}`);
    }
  }

  static async findByStaffId(staffId) {
    try {
      const countersRef = db.collection(COLLECTIONS.COUNTERS);
      const snapshot = await countersRef
        .where('staffId', '==', staffId)
        .where('isActive', '==', true)
        .get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => Counter.fromFirestore(doc));
    } catch (error) {
      throw new Error(`Error finding counters by staff: ${error.message}`);
    }
  }

  static async update(counterId, updateData) {
    try {
      const counterRef = db.collection(COLLECTIONS.COUNTERS).doc(counterId);
      updateData.updatedAt = Timestamp.now();
      
      await counterRef.update(updateData);
      return await Counter.findById(counterId);
    } catch (error) {
      throw new Error(`Error updating counter: ${error.message}`);
    }
  }

  static async delete(counterId) {
    try {
      const counterRef = db.collection(COLLECTIONS.COUNTERS).doc(counterId);
      await counterRef.delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting counter: ${error.message}`);
    }
  }

  static async assignQueue(counterId, queueId, queueNumber) {
    try {
      const counterRef = db.collection(COLLECTIONS.COUNTERS).doc(counterId);
      
      await counterRef.update({
        currentQueueId: queueId,
        currentQueueNumber: queueNumber,
        status: COUNTER_STATUS.BUSY,
        updatedAt: Timestamp.now()
      });
      
      return await Counter.findById(counterId);
    } catch (error) {
      throw new Error(`Error assigning queue to counter: ${error.message}`);
    }
  }

  static async completeQueue(counterId) {
    try {
      const counterRef = db.collection(COLLECTIONS.COUNTERS).doc(counterId);
      
      await counterRef.update({
        currentQueueId: null,
        currentQueueNumber: '',
        status: COUNTER_STATUS.ACTIVE,
        'stats.servedToday': FieldValue.increment(1),
        'stats.totalServed': FieldValue.increment(1),
        updatedAt: Timestamp.now()
      });
      
      return await Counter.findById(counterId);
    } catch (error) {
      throw new Error(`Error completing queue on counter: ${error.message}`);
    }
  }

  static async setBreak(counterId, duration) {
    try {
      const counterRef = db.collection(COLLECTIONS.COUNTERS).doc(counterId);
      const nextAvailableAt = new Date();
      nextAvailableAt.setMinutes(nextAvailableAt.getMinutes() + duration);
      
      await counterRef.update({
        status: COUNTER_STATUS.BREAK,
        nextAvailableAt: Timestamp.fromDate(nextAvailableAt),
        updatedAt: Timestamp.now()
      });
      
      return await Counter.findById(counterId);
    } catch (error) {
      throw new Error(`Error setting counter break: ${error.message}`);
    }
  }

  static async endBreak(counterId) {
    try {
      const counterRef = db.collection(COLLECTIONS.COUNTERS).doc(counterId);
      
      await counterRef.update({
        status: COUNTER_STATUS.ACTIVE,
        nextAvailableAt: null,
        updatedAt: Timestamp.now()
      });
      
      return await Counter.findById(counterId);
    } catch (error) {
      throw new Error(`Error ending counter break: ${error.message}`);
    }
  }

  static async resetDailyStats(businessId) {
    try {
      const counters = await Counter.findByBusinessId(businessId);
      const batch = db.batch();
      
      counters.forEach(counter => {
        const counterRef = db.collection(COLLECTIONS.COUNTERS).doc(counter.id);
        batch.update(counterRef, {
          'stats.servedToday': 0,
          updatedAt: Timestamp.now()
        });
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      throw new Error(`Error resetting daily stats: ${error.message}`);
    }
  }
}

module.exports = Counter;