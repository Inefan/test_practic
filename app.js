const express = require('express');
require('dotenv').config();

const app = express();

app.use(express.json());

// Логування всіх вхідних HTTP-запитів
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

const bcrypt = require('bcryptjs');
const storage = require('./dto/storage');

app.post('/auth/register', async (req, res, next) => {
  try {
    const { username, password, name, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username та password є обов'язковими"
      });
    }

    const existingUser = await storage.findUserByUsername(username);

    if (existingUser) {
      return res.status(400).json({
        error: 'Користувач з таким username вже існує'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const users = await storage.getUsers();

    const newUser = {
      id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
      username,
      passwordHash,
      name: name || username,
      role: role || 'user'
    };

    users.push(newUser);
    await storage.saveUsers(users);

    const { passwordHash: _, ...safeUser } = newUser;

    res.status(201).json({
      message: 'Користувача успішно зареєстровано',
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});