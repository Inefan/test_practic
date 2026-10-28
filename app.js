require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const storage = require('./dto/storage.js');

const app = express();
const PORT = process.env.PORT || 3111;


// ==================================================
// 5. Глобальні Middleware та налаштування Express
// ==================================================

// Дозволяє Express читати JSON з body запитів
app.use(express.json());

// Логування всіх HTTP-запитів
app.use((req, res, next) => {
    console.log(
        `[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`
    );

    next();
});


// ==================================================
// 8. Middleware авторизації JWT
// ==================================================

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Перевіряємо, чи є Authorization: Bearer TOKEN
    if (authHeader && authHeader.startsWith('Bearer ')) {

        const token = authHeader.split(' ')[1];

        jwt.verify(
            token,
            process.env.JWT_SECRET || 'secret',
            (err, user) => {

                if (err) {
                    return res.status(403).json({
                        error: 'Токен недійсний або прострочений'
                    });
                }

                // Зберігаємо інформацію з токена
                req.user = user;

                next();
            }
        );

    } else {
        return res.status(401).json({
            error: 'Авторизаційний токен відсутній (Bearer Token required)'
        });
    }
};


// Middleware перевірки ролі користувача
const requireRole = (requiredRole) => {

    return (req, res, next) => {

        if (!req.user || req.user.role !== requiredRole) {
            return res.status(403).json({
                error: `Доступ заборонено. Необхідна роль: ${requiredRole}`
            });
        }

        next();
    };
};


// ==================================================
// 6. Реєстрація користувача
// POST /auth/register
// ==================================================

app.post('/auth/register', async (req, res, next) => {

    try {

        const {
            username,
            password,
            name,
            role
        } = req.body;


        // Перевірка обов'язкових полів
        if (!username || !password) {

            return res.status(400).json({
                error: "Username та password є обов'язковими"
            });
        }


        // Перевіряємо, чи існує користувач
        const existingUser =
            await storage.findUserByUsername(username);

        if (existingUser) {

            return res.status(400).json({
                error: 'Користувач з таким username вже існує'
            });
        }


        // Хешування пароля
        const passwordHash =
            await bcrypt.hash(password, 10);


        // Отримуємо всіх користувачів
        const users =
            await storage.getUsers();


        // Створюємо нового користувача
        const newUser = {

            id: users.length > 0
                ? users[users.length - 1].id + 1
                : 1,

            username,

            passwordHash,

            name: name || username,

            role: role || 'user'
        };


        // Додаємо користувача
        users.push(newUser);


        // Зберігаємо у users.json
        await storage.saveUsers(users);


        // Не відправляємо passwordHash клієнту
        const {
            passwordHash: _,
            ...safeUser
        } = newUser;


        res.status(201).json({

            message: 'Користувача успішно зареєстровано',

            user: safeUser
        });

    } catch (err) {

        next(err);
    }
});


// ==================================================
// 7. Авторизація та JWT
// POST /auth/login
// ==================================================

app.post('/auth/login', async (req, res, next) => {

    try {

        const {
            username,
            password
        } = req.body;


        // Шукаємо користувача
        const user =
            await storage.findUserByUsername(username);


        // Якщо користувача немає
        if (!user) {

            return res.status(401).json({
                error: 'Невірний логін або пароль'
            });
        }


        // Перевіряємо пароль
        const isMatch =
            await bcrypt.compare(
                password,
                user.passwordHash
            );


        if (!isMatch) {

            return res.status(401).json({
                error: 'Невірний логін або пароль'
            });
        }


        // Створюємо JWT
        const token = jwt.sign(

            {
                userId: user.id,
                username: user.username,
                role: user.role
            },

            process.env.JWT_SECRET || 'secret',

            {
                expiresIn:
                    process.env.JWT_EXPIRES_IN || '1h'
            }
        );


        // Відправляємо токен
        res.json({

            message: 'Авторизація успішна',

            token
        });

    } catch (err) {

        next(err);
    }
});


// ==================================================
// 9. Захищені ендпоінти
// ==================================================


// Отримати користувача
// GET /users/:id

app.get(
    '/users/:id',
    authenticateJWT,
    async (req, res, next) => {

        try {

            const userData =
                await storage.findUserById(req.params.id);


            if (!userData) {

                return res.status(404).json({
                    error: 'Користувача не знайдено'
                });
            }


            // Не повертаємо passwordHash
            const {
                passwordHash,
                ...safeUser
            } = userData;


            res.json(safeUser);

        } catch (err) {

            next(err);
        }
    }
);


// --------------------------------------------------
// Створення нового замовлення
// POST /orders
// --------------------------------------------------

app.post(
    '/orders',
    authenticateJWT,
    async (req, res, next) => {

        try {

            const {
                product,
                amount
            } = req.body;


            // Перевірка даних
            if (!product || !amount) {

                return res.status(400).json({
                    error: 'Поля product та amount є обов’язковими'
                });
            }


            // Отримуємо замовлення
            const orders =
                await storage.getOrders();


            // Створюємо нове замовлення
            const newOrder = {

                id: orders.length > 0
                    ? orders[orders.length - 1].id + 1
                    : 1,

                // ID користувача беремо з JWT
                userId: req.user.userId,

                product,

                amount: Number(amount)
            };


            // Додаємо замовлення
            orders.push(newOrder);


            // Зберігаємо у orders.json
            await storage.saveOrders(orders);


            res.status(201).json({

                message: 'Замовлення успішно створено',

                order: newOrder
            });

        } catch (err) {

            next(err);
        }
    }
);


// ==================================================
// Адміністративний ендпоінт
// GET /admin/all-users
// ==================================================

app.get(
    '/admin/all-users',
    authenticateJWT,
    requireRole('admin'),
    async (req, res, next) => {

        try {

            // Отримуємо всіх користувачів
            const users =
                await storage.getUsers();


            // Видаляємо passwordHash
            const safeUsers =
                users.map(
                    ({ passwordHash, ...user }) => user
                );


            res.json(safeUsers);

        } catch (err) {

            next(err);
        }
    }
);


// ==================================================
// 10. Централізована обробка помилок
// ==================================================

app.use((err, req, res, next) => {

    console.error('[ERROR]', err.stack);


    res.status(500).json({

        error: 'Внутрішня помилка сервера',

        details: err.message
    });
});


// ==================================================
// Запуск сервера
// ==================================================

app.listen(PORT, () => {

    console.log(
        `Server is running at http://127.0.0.1:${PORT}`
    );
});