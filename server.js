const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
    host:'localhost',
    user:'W1_86938_Gauri',
    password:'manager',
    database:'collaborative_editor'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

let documentContent = "";

// WebSocket connection
wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.send(JSON.stringify({ type: 'init', data: documentContent }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'update') {
            documentContent = data.data;
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'update', data: documentContent }));
                }
            });
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Save Document API
app.post('/save', (req, res) => {
    const { content } = req.body;
    
    const sql = 'INSERT INTO documents (content) VALUES (?)';
    db.query(sql, [content], (err, result) => {
        if (err) {
            console.error('Error saving document:', err);
            return res.json({ success: false, error: err.message });
        }
        return res.json({ success: true, message: 'Document saved successfully' });
    });
});

server.listen(5000, () => {
    console.log('Server running on port 5000');
});
