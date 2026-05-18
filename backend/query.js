import dotenv from 'dotenv';
dotenv.config()
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf'
import { Pinecone } from '@pinecone-database/pinecone';

const History = []

const FREE_MODELS = [
    'openrouter/free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'qwen/qwen-2.5-7b-instruct:free',
    'deepseek/deepseek-r1:free',
]

const openRouterChat = async (messages, modelIndex = 0) => {
    if (modelIndex >= FREE_MODELS.length) {
        throw new Error('All free models are rate limited. Try again in a minute.')
    }

    const model = FREE_MODELS[modelIndex]
    console.log(`Trying model: ${model}`)

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, messages })
    })

    const data = await response.json()

    if (data.error?.code === 429 || response.status === 429) {
        console.log(`Model ${model} rate limited, trying next...`)
        return openRouterChat(messages, modelIndex + 1)
    }

    if (data.error || !data.choices?.[0]) {
        console.log(`Model ${model} failed, trying next...`)
        return openRouterChat(messages, modelIndex + 1)
    }

    const content = data.choices[0].message.content
    if (!content) {
        console.log(`Model ${model} returned null content, trying next...`)
        return openRouterChat(messages, modelIndex + 1)
    }

    return content
}

const transformQuery = async (question) => {
    return await openRouterChat([
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

    const answer = await openRouterChat(messages)
    History.push({ role: 'user', content: queries })
    History.push({ role: 'assistant', content: answer })
    return answer
}