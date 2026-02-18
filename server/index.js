const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 4830;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(bodyParser.json());

// Initialize data.json if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Helper to read data
const readData = () => {
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
};

// Helper to write data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Get all words
app.get('/api/words', (req, res) => {
    try {
        const words = readData();
        res.json(words);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read data' });
    }
});

// Add a word
app.post('/api/words', (req, res) => {
    const { word, translation, pronunciation, caseUses, relatedIds } = req.body;

    if (!word || !translation) {
        return res.status(400).json({ error: 'Word and Translation are required' });
    }

    const words = readData();

    // Check if word already exists (case insensitive)
    const exists = words.find(w => w.word.toLowerCase() === word.toLowerCase());
    if (exists) {
        return res.status(400).json({ error: 'Word already exists in dictionary' });
    }

    const newEntry = {
        id: uuidv4(),
        word,
        translation,
        pronunciation: pronunciation || '',
        caseUses: caseUses || '',
        relatedIds: relatedIds || []
    };

    words.push(newEntry);
    writeData(words);
    res.status(201).json(newEntry);
});

// Update a word
app.put('/api/words/:id', (req, res) => {
    const { id } = req.params;
    const { word, translation, pronunciation, caseUses, relatedIds } = req.body;

    let words = readData();
    const index = words.findIndex(w => w.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Word not found' });
    }

    words[index] = {
        ...words[index],
        word: word || words[index].word,
        translation: translation || words[index].translation,
        pronunciation: pronunciation !== undefined ? pronunciation : words[index].pronunciation,
        caseUses: caseUses !== undefined ? caseUses : words[index].caseUses,
        relatedIds: relatedIds || words[index].relatedIds
    };

    writeData(words);
    res.json(words[index]);
});

// Delete a word
app.delete('/api/words/:id', (req, res) => {
    const { id } = req.params;
    let words = readData();

    const filteredWords = words.filter(w => w.id !== id);

    if (words.length === filteredWords.length) {
        return res.status(404).json({ error: 'Word not found' });
    }

    // Also remove this ID from any relatedIds in other words
    const finalWords = filteredWords.map(w => ({
        ...w,
        relatedIds: w.relatedIds.filter(rid => rid !== id)
    }));

    writeData(finalWords);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
