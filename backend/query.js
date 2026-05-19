import dotenv from 'dotenv';
dotenv.config()
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf'
import { Pinecone } from '@pinecone-database/pinecone';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const History = []



const model = new ChatGoogleGenerativeAI({
    model: 'gemini-1.5-pro',
    configuration: { baseURL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent' },
    apiKey: process.env.GOOGLE_API_KEY,
})

const transformQuery = async (question) => {
    return await model.generateContent([
        {
            role: 'user',
            content: `Rephrase this into a standalone question. Only output the rewritten question. Question: ${question}`
        }
    ])
}

export const chatting = async (question) => {
    const queries = await transformQuery(question)
    console.log('Transformed query:', queries)

    const embeddings = new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HUGGINGFACE_API_KEY,
        model: 'sentence-transformers/all-MiniLM-L6-v2',
    })
    const queryVector = await embeddings.embedQuery(queries)
    console.log('Query vector length:', queryVector.length)

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME)

    const searchResults = await pineconeIndex.query({
        topK: 20,  // ← increased
        vector: queryVector,
        includeMetadata: true,
    })

    console.log('Search matches:', searchResults.matches.length)
    console.log('All scores:', searchResults.matches.map(m => m.score))
    console.log('First match text:', searchResults.matches[0]?.metadata?.text?.slice(0, 200))

    const context = searchResults.matches
        .filter(match => match.score > 0.3)  // ← filter low quality
        .map(match => match.metadata.text)
        .join("\n\n---\n\n")

    console.log('Context length:', context.length)

    const messages = [
        ...History,
        {
            role: 'user',
            content: `You are a DSA Expert. Use the context below to answer the question.
Context:
${context}

Question: ${queries}

Give a clear, detailed answer based on the context. If the exact answer is not in the context, use your general DSA knowledge to answer.`
        }
    ]

    const answer = await model.generateContent(messages)
    History.push({ role: 'user', content: queries })
    History.push({ role: 'assistant', content: answer })
    return answer
}