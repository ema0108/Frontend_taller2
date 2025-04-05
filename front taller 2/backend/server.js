const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Configuración
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Base de datos
const db = new sqlite3.Database('./tasks.db', (err) => {
    if (err) return console.error(err.message);
    console.log('Conectado a SQLite');
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Endpoints
app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks ORDER BY createdAt DESC', (err, rows) => {
        err ? res.status(500).json({error: err.message}) : res.json(rows);
    });
});

app.post('/tasks', (req, res) => {
    const {title} = req.body;
    if (!title) return res.status(400).json({error: 'Título requerido'});
    
    db.run('INSERT INTO tasks (title) VALUES (?)', [title], function(err) {
        err ? res.status(500).json({error: err.message}) 
            : res.json({id: this.lastID, title, completed: false});
    });
});

app.put('/tasks/:id', (req, res) => {
    const {id} = req.params;
    const {completed} = req.body;
    
    db.run('UPDATE tasks SET completed = ? WHERE id = ?', [completed, id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        this.changes === 0 ? res.status(404).json({error: 'Tarea no encontrada'}) 
                          : res.json({message: 'Tarea actualizada'});
    });
});

app.delete('/tasks/:id', (req, res) => {
    const {id} = req.params;
    
    db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        this.changes === 0 ? res.status(404).json({error: 'Tarea no encontrada'}) 
                          : res.json({message: 'Tarea eliminada'});
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor en http://localhost:${port}`);
});