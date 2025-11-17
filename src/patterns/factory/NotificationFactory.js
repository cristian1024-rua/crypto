export default class NotificationFactory {
  static create(type, message) {
    return { id: crypto.randomUUID(), type, message, timestamp: Date.now() };
  }
}