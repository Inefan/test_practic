const fs = require('fs/promises');
const path = require('path');

const usersPath = path.join(__dirname, '../storage/users.json');
const ordersPath = path.join(__dirname, '../storage/orders.json');

class FileStorageService {
  async getUsers() {
    try {
      const data = await fs.readFile(usersPath, 'utf8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async saveUsers(users) {
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2), 'utf8');
  }

  async getOrders() {
    try {
      const data = await fs.readFile(ordersPath, 'utf8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async saveOrders(orders) {
    await fs.writeFile(ordersPath, JSON.stringify(orders, null, 2), 'utf8');
  }

  async findUserById(id) {
    const users = await this.getUsers();
    const user = users.find(u => u.id === Number(id));
    if (!user) return null;

    const orders = await this.getOrders();
    const userOrders = orders.filter(o => o.userId === Number(id));

    const { passwordHash, ...safeUser } = user;
    return { ...safeUser, orders: userOrders };
  }

  async findUserByUsername(username) {
    const users = await this.getUsers();
    return users.find(u => u.username === username);
  }
}

module.exports = new FileStorageService();
