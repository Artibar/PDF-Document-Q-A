import dotenv from 'dotenv';
dotenv.config()
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf'
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';

export const indexDocument = async () => {
    //load pdf
    const PDF_PATH = './Dsa.pdf';
    const pdfLoader = new PDFLoader(PDF_PATH);
    const rawDocs = await pdfLoader.load();

    console.log(rawDocs.length)
    console.log("PDF loaded");
    
    // split vector and overlap vector 
    const textSplitter = new RecursiveCharacterTextSplitter({
         chunkSize: 500,    // ← was 1000
         chunkOverlap: 100, // ← was 200
    })
    const chunkDocs = await textSplitter.splitDocuments(rawDocs);
    console.log("Chunking completed");
  

const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACE_API_KEY,
    model: 'sentence-transformers/all-MiniLM-L6-v2',
})
    console.log("Embedding model configured");
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    console.log("Pinecone configured");
    
    //  connect to vector-DB
    await PineconeStore.fromDocuments(chunkDocs, embeddings,{
        pineconeIndex,
        maxConcurrency: 5,
    })
    console.log("Data Stored successfully");
    
}
// indexDocument()




