const EventEmitter = require('events');
const { Users } = require('./supabaseRepo');

class RealtimeService extends EventEmitter {
  constructor() {
    super();
    this.connectedClients = new Map(); // userId -> Set of socket connections
    this.userSessions = new Map(); // userId -> user data cache
  }

  // Add a client connection
  addClient(userId, socket) {
    if (!this.connectedClients.has(userId)) {
      this.connectedClients.set(userId, new Set());
    }
    this.connectedClients.get(userId).add(socket);
    
    console.log(`User ${userId} connected. Total connections: ${this.connectedClients.get(userId).size}`);
    
    // Handle client disconnect
    socket.on('disconnect', () => {
      this.removeClient(userId, socket);
    });
    
    // Send current user data immediately
    this.sendUserData(userId, socket);
  }

  // Remove a client connection
  removeClient(userId, socket) {
    if (this.connectedClients.has(userId)) {
      this.connectedClients.get(userId).delete(socket);
      if (this.connectedClients.get(userId).size === 0) {
        this.connectedClients.delete(userId);
        this.userSessions.delete(userId);
      }
    }
    console.log(`User ${userId} disconnected`);
  }

  // Broadcast user data update to all connected clients
  async broadcastUserUpdate(userId, updateData = null) {
    try {
      // Fetch fresh user data from Supabase
      let user = null
      try { user = await Users.getById(userId) } catch (_) { user = null }
      if (!user) return;

      // Update cache
      this.userSessions.set(userId, user);

      // Broadcast to all connected clients for this user
      if (this.connectedClients.has(userId)) {
        const userData = {
          type: 'USER_UPDATE',
          user,
          timestamp: new Date().toISOString(),
          ...updateData
        };

        this.connectedClients.get(userId).forEach(socket => {
          socket.emit('userUpdate', userData);
        });

        console.log(`Broadcasted user update to ${this.connectedClients.get(userId).size} clients for user ${userId}`);
      }
    } catch (error) {
      console.error('Error broadcasting user update:', error);
    }
  }

  // Send current user data to a specific socket
  async sendUserData(userId, socket) {
    try {
      let userData = this.userSessions.get(userId);
      
      if (!userData) {
        let user = null
        try { user = await Users.getById(userId) } catch (_) { user = null }
        if (user) {
          userData = user;
          this.userSessions.set(userId, userData);
        }
      }

      if (userData) {
        socket.emit('userUpdate', {
          type: 'USER_DATA',
          user: userData,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error sending user data:', error);
    }
  }

  // Broadcast email verification status change
  async broadcastEmailVerification(userId, isVerified) {
    await this.broadcastUserUpdate(userId, {
      type: 'EMAIL_VERIFICATION_UPDATE',
      isEmailVerified: isVerified,
      message: isVerified ? 'Email verified successfully!' : 'Email verification status updated'
    });
  }

  // Broadcast KYC status change
  async broadcastKYCUpdate(userId, kycData) {
    await this.broadcastUserUpdate(userId, {
      type: 'KYC_UPDATE',
      kyc: kycData,
      message: 'KYC status updated'
    });
  }

  // Get connected clients count for a user
  getClientCount(userId) {
    return this.connectedClients.has(userId) ? this.connectedClients.get(userId).size : 0;
  }

  // Get all connected users
  getConnectedUsers() {
    return Array.from(this.connectedClients.keys());
  }

  // Cleanup inactive sessions
  cleanup() {
    // Remove users with no active connections
    for (const [userId, connections] of this.connectedClients.entries()) {
      if (connections.size === 0) {
        this.connectedClients.delete(userId);
        this.userSessions.delete(userId);
      }
    }
  }
}

// Create singleton instance
const realtimeService = new RealtimeService();

// Cleanup every 5 minutes
setInterval(() => {
  realtimeService.cleanup();
}, 5 * 60 * 1000);

module.exports = realtimeService;
