const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Frontend serve karo
app.use(express.static(path.join(__dirname, '../frontend')));

// Root test
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Symptoms list
app.get('/symptoms', (req, res) => {
    const symptomsPath = path.join(__dirname, '../model/symptoms_list.json');
    if (fs.existsSync(symptomsPath)) {
        const symptoms = JSON.parse(fs.readFileSync(symptomsPath, 'utf8'));
        res.json({ symptoms });
    } else {
        res.status(404).json({ error: 'Symptoms list not found' });
    }
});

// Predict
app.post('/predict', (req, res) => {
    const { symptoms } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
        return res.status(400).json({ error: 'Please provide at least one symptom' });
    }

    const cleanSymptoms = symptoms.map(s => s.trim().toLowerCase());
    const pythonCmd = process.platform === 'win32' ? 'py' : 'python3';
    const scriptPath = path.join(__dirname, 'predict.py');

    // spawn use karo — exec nahi (CET/IPL jaisa)
    const python = spawn(pythonCmd, [scriptPath, JSON.stringify(cleanSymptoms)]);

    let result = '';
    let error = '';

    python.stdout.on('data', (data) => { result += data.toString(); });
    python.stderr.on('data', (data) => { error += data.toString(); });

    python.on('close', (code) => {
        if (code !== 0) {
            console.error('Python error:', error);
            return res.status(500).json({ error: 'Prediction failed' });
        }
        try {
            res.json(JSON.parse(result));
        } catch (e) {
            res.status(500).json({ error: 'Invalid response from model' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`HealthCheck AI running on http://localhost:${PORT}`);
});