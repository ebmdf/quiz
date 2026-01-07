
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
// Using process.env.PORT is critical for cPanel Passenger
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: '*', // Adjust this for production security if needed
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '50mb' }));

// MySQL Connection Pool
let pool;

const connectDB = async () => {
    try {
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'quiz_app_db',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            charset: 'utf8mb4'
        };

        // Log config for debugging (hiding password)
        console.log('Tentando conectar ao MySQL com:');
        console.log(`Host: ${dbConfig.host}`);
        console.log(`User: ${dbConfig.user}`);
        console.log(`Database: ${dbConfig.database}`);
        
        if (process.env.DB_SSL === 'true') {
            dbConfig.ssl = { rejectUnauthorized: false };
        }

        pool = mysql.createPool(dbConfig);
        
        // Test connection
        const connection = await pool.getConnection();
        console.log('✅ Conexão MySQL bem-sucedida!');
        connection.release();
        
        // Init DB structure
        await initDb();
        
    } catch (error) {
        console.error('❌ ERRO FATAL DE CONEXÃO COM BANCO:', error.message);
    }
};

// Initialize/Verify Database Structure
const initDb = async () => {
    if (!pool) return;
    let connection;
    try {
        connection = await pool.getConnection();
        
        await connection.query(`
            CREATE TABLE IF NOT EXISTS app_data (
                collection_name VARCHAR(50) NOT NULL,
                item_id VARCHAR(255) NOT NULL,
                item_data JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (collection_name, item_id),
                INDEX idx_collection (collection_name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS analytics_events (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                event_type VARCHAR(100) NOT NULL,
                event_data JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_type (event_type),
                INDEX idx_date (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        console.log('✅ Tabelas do banco verificadas/criadas.');
    } catch (err) {
        console.error('❌ Erro na inicialização das tabelas:', err.message);
    } finally {
        if (connection) connection.release();
    }
};

// Start DB connection
connectDB();

// --- Routes ---

app.get('/', (req, res) => {
    res.send('API v1.0 Online - Quiz App Backend');
});

app.get('/api/health', async (req, res) => {
    try {
        if (pool) {
            const connection = await pool.getConnection();
            await connection.ping();
            connection.release();
            res.json({ status: 'online', database: 'connected' });
        } else {
            res.status(503).json({ status: 'offline', database: 'disconnected', details: 'Pool not initialized' });
        }
    } catch (e) {
        res.status(500).json({ status: 'error', database: 'error', error: e.message });
    }
});

const handleDbError = (res, err) => {
    console.error('DB Operation Error:', err.message);
    res.status(500).json({ error: 'Database operation failed', details: err.message });
};

// Generic GET for collections
app.get('/api/:collection', async (req, res) => {
    const { collection } = req.params;
    if (!pool) return res.status(503).json({ error: 'Database not available' });

    try {
        if (collection === 'analyticsEvents') {
            const [rows] = await pool.query(
                'SELECT id, event_type as type, event_data as data, UNIX_TIMESTAMP(created_at) * 1000 as timestamp FROM analytics_events ORDER BY created_at DESC LIMIT 1000'
            );
            const data = rows.map(r => ({ ...r, data: r.data })); 
            return res.json(data);
        }

        const [rows] = await pool.query(
            'SELECT item_data FROM app_data WHERE collection_name = ?',
            [collection]
        );
        const data = rows.map(row => row.item_data);
        res.json(data);
    } catch (err) {
        handleDbError(res, err);
    }
});

// Generic POST (Upsert)
app.post('/api/:collection', async (req, res) => {
    const { collection } = req.params;
    const item = req.body;
    
    if (!pool) return res.status(503).json({ error: 'Database not available' });

    try {
        if (collection === 'analyticsEvents') {
            await pool.query(
                'INSERT INTO analytics_events (event_type, event_data) VALUES (?, ?)',
                [item.type, JSON.stringify(item.data || {})]
            );
            return res.json({ success: true });
        }

        if (!item.id) return res.status(400).json({ error: 'Item must have an id' });
        const itemId = String(item.id);
        
        await pool.query(
            `INSERT INTO app_data (collection_name, item_id, item_data) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE item_data = VALUES(item_data)`,
            [collection, itemId, JSON.stringify(item)]
        );
        res.json(item);
    } catch (err) {
        handleDbError(res, err);
    }
});

// Generic DELETE
app.delete('/api/:collection/:id', async (req, res) => {
    const { collection, id } = req.params;
    if (!pool) return res.status(503).json({ error: 'Database not available' });

    try {
        if (collection === 'analyticsEvents') {
             await pool.query('DELETE FROM analytics_events WHERE id = ?', [id]);
             return res.json({ success: true });
        }

        await pool.query(
            'DELETE FROM app_data WHERE collection_name = ? AND item_id = ?',
            [collection, String(id)]
        );
        res.json({ success: true });
    } catch (err) {
        handleDbError(res, err);
    }
});

// Bulk POST
app.post('/api/:collection/bulk', async (req, res) => {
    const { collection } = req.params;
    const items = req.body;

    if (!pool) return res.status(503).json({ error: 'Database not available' });
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Body must be an array' });

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        for (const item of items) {
            if (collection === 'analyticsEvents') {
                 await connection.query(
                    'INSERT INTO analytics_events (event_type, event_data) VALUES (?, ?)',
                    [item.type, JSON.stringify(item.data || {})]
                );
            } else if (item.id) {
                await connection.query(
                    `INSERT INTO app_data (collection_name, item_id, item_data) 
                     VALUES (?, ?, ?) 
                     ON DUPLICATE KEY UPDATE item_data = VALUES(item_data)`,
                    [collection, String(item.id), JSON.stringify(item)]
                );
            }
        }
        await connection.commit();
        res.json({ success: true, count: items.length });
    } catch (err) {
        if (connection) await connection.rollback();
        handleDbError(res, err);
    } finally {
        if (connection) connection.release();
    }
});

// Clear Collection
app.post('/api/:collection/clear', async (req, res) => {
    const { collection } = req.params;
    if (!pool) return res.status(503).json({ error: 'Database not available' });

    try {
        if (collection === 'analyticsEvents') {
            await pool.query('TRUNCATE TABLE analytics_events');
        } else {
            await pool.query('DELETE FROM app_data WHERE collection_name = ?', [collection]);
        }
        res.json({ success: true });
    } catch (err) {
        handleDbError(res, err);
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Backend Server running on port ${PORT}`);
});
