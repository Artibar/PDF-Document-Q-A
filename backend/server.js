import express from 'express';
import cors from 'cors';
import {chatting} from './query.js'
import {indexDocument} from "./index.js"
import { Pinecone } from '@pinecone-database/pinecone'
import { config } from 'dotenv';

const app = express();
app.use(cors({
    origin: ["https://pdf-document-q-a.onrender.com", "https://pdf-document-q-a-1.onrender.com"],
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(express.json());
const port = process.env.PORT || 5000;


app.get('/api/check-index', async (req, res) => {
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME)
    const stats = await index.describeIndexStats()
    res.json(stats)
})

app.post('/api/chat', async(req, res) => {
    try {
        const { question } = req.body;
        console.log('Question received:', question) // ← add
        const answer = await chatting(question);
        console.log('Answer:', answer)              // ← add
        res.json({ answer });
    } catch (error) {
        console.error('CHAT ERROR:', error)         // ← add full error object
        res.status(500).json({ error: error.message });
    }
});

const server = app.listen(port, '0.0.0.0', ()=>{
    console.log(`Server running on PORT : ${port}`)
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Stop the other process or set a different PORT.`);
    } else {
        console.error('Server failed to start:', error);
    }
    process.exit(1);
});