const nodemailer = require('nodemailer');
const { NOTIFICATION_TYPES } = require('../config/constants');

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// SMS service (Twilio - optional)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// Notification templates
const templates = {
  [NOTIFICATION_TYPES.QUEUE_UPDATE]: {
    email: {
      subject: 'Your Queue Position Update',
      template: (data) => `
        <h2>Queue Update</h2>
        <p>Hello ${data.customerName},</p>
        <p>Your queue position has been updated:</p>
        <ul>
          <li>Queue Number: ${data.queueNumber}</li>
          <li>Current Position: ${data.position}</li>
          <li>Estimated Wait Time: ${data.estimatedTime} minutes</li>
        </ul>
        <p>Thank you for your patience.</p>
      `
    },
    sms: (data) => 
      `Queue update: ${data.queueNumber}, Position: ${data.position}, Wait: ${data.estimatedTime}min`
  },
  
  [NOTIFICATION_TYPES.CALL_NEXT]: {
    email: {
      subject: 'Your Turn is Here!',
      template: (data) => `
        <h2>Please Proceed to Counter</h2>
        <p>Hello ${data.customerName},</p>
        <p>Your turn has arrived! Please proceed to:</p>
        <ul>
          <li>Counter: ${data.counterName} (${data.counterNumber})</li>
          <li>Queue Number: ${data.queueNumber}</li>
        </ul>
        <p>${data.message || 'Please be ready for service.'}</p>
      `
    },
    sms: (data) => 
      `Your turn! ${data.queueNumber}, proceed to ${data.counterName}. ${data.message || ''}`
  },
  
  [NOTIFICATION_TYPES.NEAR_TURN]: {
    email: {
      subject: 'You Are Almost Up!',
      template: (data) => `
        <h2>Almost Your Turn</h2>
        <p>Hello ${data.customerName},</p>
        <p>You are almost at the front of the queue:</p>
        <ul>
          <li>Queue Number: ${data.queueNumber}</li>
          <li>Positions Ahead: ${data.positionsAhead}</li>
          <li>Estimated Time: ${data.estimatedTime} minutes</li>
        </ul>
        <p>Please be ready for your turn soon.</p>
      `
    },
    sms: (data) => 
      `Almost your turn! ${data.queueNumber}, ${data.positionsAhead} ahead, ${data.estimatedTime}min`
  },
  
  [NOTIFICATION_TYPES.CUSTOMER_JOINED]: {
    email: {
      subject: 'New Customer Joined Queue',
      template: (data) => `
        <h2>New Queue Entry</h2>
        <p>A new customer has joined your queue:</p>
        <ul>
          <li>Queue Number: ${data.queueNumber}</li>
          <li>Customer: ${data.customerName}</li>
          <li>Service: ${data.serviceType}</li>
          <li>Position: ${data.position}</li>
        </ul>
        <p>Current waiting count: ${data.waitingCount}</p>
      `
    },
    sms: (data) => 
      `New queue: ${data.queueNumber}, ${data.customerName}, ${data.serviceType}, pos:${data.position}`
  }
};

// Send notification service
exports.sendNotification = async (notificationData) => {
  try {
    const { 
      type, 
      customerId, 
      customerPhone, 
      customerEmail, 
      businessId,
      data 
    } = notificationData;
    
    const template = templates[type];
    if (!template) {
      throw new Error(`Unknown notification type: ${type}`);
    }
    
    const results = [];
    
    // Send email if customer email is provided
    if (customerEmail && template.email) {
      try {
        const mailOptions = {
          from: `"QNow Queue System" <${process.env.EMAIL_USER}>`,
          to: customerEmail,
          subject: template.email.subject,
          html: template.email.template(data)
        };
        
        await transporter.sendMail(mailOptions);
        results.push({ method: 'email', success: true });
      } catch (error) {
        console.error('Email notification error:', error);
        results.push({ method: 'email', success: false, error: error.message });
      }
    }
    
    // Send SMS if customer phone is provided and Twilio is configured
    if (customerPhone && template.sms && twilioClient) {
      try {
        await twilioClient.messages.create({
          body: template.sms(data),
          from: process.env.TWILIO_PHONE_NUMBER,
          to: customerPhone
        });
        results.push({ method: 'sms', success: true });
      } catch (error) {
        console.error('SMS notification error:', error);
        results.push({ method: 'sms', success: false, error: error.message });
      }
    }
    
    // Send push notification (would require FCM setup)
    // This is a placeholder for future implementation
    if (customerId) {
      try {
        // Here you would send push notification via Firebase Cloud Messaging
        console.log('Push notification would be sent to:', customerId, 'with data:', data);
        results.push({ method: 'push', success: true });
      } catch (error) {
        console.error('Push notification error:', error);
        results.push({ method: 'push', success: false, error: error.message });
      }
    }
    
    // Log notification in database
    try {
      const { db, Timestamp } = require('../config/firebase-admin.config');
      const { COLLECTIONS } = require('../config/constants');
      
      await db.collection(COLLECTIONS.NOTIFICATIONS).add({
        type,
        customerId,
        customerEmail,
        customerPhone,
        businessId,
        data,
        results,
        createdAt: Timestamp.now(),
        read: false
      });
    } catch (error) {
      console.error('Notification logging error:', error);
    }
    
    return {
      success: results.some(r => r.success),
      results
    };
  } catch (error) {
    console.error('Send notification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send bulk notifications
exports.sendBulkNotifications = async (notifications) => {
  try {
    const promises = notifications.map(notification => 
      exports.sendNotification(notification)
    );
    
    const results = await Promise.allSettled(promises);
    
    return {
      total: results.length,
      successful: results.filter(r => r.status === 'fulfilled' && r.value.success).length,
      failed: results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length,
      results
    };
  } catch (error) {
    throw new Error(`Bulk notification error: ${error.message}`);
  }
};

// Get user notifications
exports.getUserNotifications = async (userId, limit = 20) => {
  try {
    const { db } = require('../config/firebase-admin.config');
    const { COLLECTIONS } = require('../config/constants');
    
    const snapshot = await db.collection(COLLECTIONS.NOTIFICATIONS)
      .where('customerId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    const notifications = [];
    snapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return notifications;
  } catch (error) {
    throw new Error(`Get user notifications error: ${error.message}`);
  }
};

// Mark notification as read
exports.markAsRead = async (notificationId) => {
  try {
    const { db } = require('../config/firebase-admin.config');
    const { COLLECTIONS } = require('../config/constants');
    
    await db.collection(COLLECTIONS.NOTIFICATIONS)
      .doc(notificationId)
      .update({
        read: true,
        readAt: new Date()
      });
    
    return true;
  } catch (error) {
    throw new Error(`Mark notification as read error: ${error.message}`);
  }
};