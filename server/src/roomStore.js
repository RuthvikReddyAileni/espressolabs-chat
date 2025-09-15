// Simple in-memory room store. For production, use Redis or a DB.
export class RoomStore {
  constructor(maxMessagesPerRoom = 200) {
    this.rooms = new Map(); // roomName -> { users: Map<socketId, user>, messages: Array }
    this.maxMessagesPerRoom = maxMessagesPerRoom;
  }

  listRooms() {
    return Array.from(this.rooms.entries()).map(([name, data]) => ({
      name,
      online: data.users.size,
      messages: data.messages.length,
    }));
  }

  ensureRoom(name) {
    if (!this.rooms.has(name)) {
      this.rooms.set(name, { users: new Map(), messages: [] });
    }
    return this.rooms.get(name);
  }

  addUser(roomName, socketId, user) {
    const room = this.ensureRoom(roomName);
    room.users.set(socketId, user);
    return this.getUsers(roomName);
  }

  removeUser(roomName, socketId) {
    const room = this.rooms.get(roomName);
    if (!room) return [];
    room.users.delete(socketId);
    if (room.users.size === 0 && room.messages.length === 0) {
      this.rooms.delete(roomName); // cleanup empty rooms
      return [];
    }
    return this.getUsers(roomName);
  }

  getUsers(roomName) {
    const room = this.rooms.get(roomName);
    if (!room) return [];
    return Array.from(room.users.values());
  }

  addMessage(roomName, message) {
    const room = this.ensureRoom(roomName);
    room.messages.push(message);
    if (room.messages.length > this.maxMessagesPerRoom) {
      room.messages.shift();
    }
    return message;
  }

  getMessages(roomName) {
    const room = this.rooms.get(roomName);
    return room ? room.messages : [];
  }
}
