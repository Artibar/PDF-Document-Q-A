<img width="1920" height="1200" alt="Screenshot 2026-05-20 111121" src="https://github.com/user-attachments/assets/638480d3-0eff-402a-8e1f-a4b062279716" />
<div align="center">

<img src="https://img.shields.io/badge/RAG%20Powered-LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" />
<img src="https://img.shields.io/badge/LLaMA-Groq-F55036?style=for-the-badge&logo=meta&logoColor=white" />
<img src="https://img.shields.io/badge/Pinecone-Vector%20DB-00BFB3?style=for-the-badge" />
<img src="https://img.shields.io/badge/HuggingFace-Embeddings-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black" />
<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />

# 📄 PDF Document Q&A — RAG Chatbot

### *Ask anything. Get answers grounded in the document — not hallucinations.*

**Retrieval-Augmented Generation over a pre-indexed knowledge base, powered by LLaMA via Groq.**

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-DSA%20ChatBot%20AI-6C63FF?style=for-the-badge)](https://pdf-document-q-a-1.onrender.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Artibar/PDF-Document-Q-A)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

## 🧠 What is this?

**PDF Document Q&A** is a production-ready RAG (Retrieval-Augmented Generation) chatbot that lets users have intelligent, multi-turn conversations with a pre-indexed document knowledge base — no file upload, no setup, just ask.

At build time, the document corpus is chunked, embedded using HuggingFace models, and stored in **Pinecone**. At query time, the most relevant chunks are retrieved and injected as context into each LLM prompt — keeping answers factual, source-grounded, and hallucination-resistant.

> *"What is the time complexity of merge sort?"* → Accurate answer pulled directly from the indexed DSA document.

---

## ✨ Features
LiveLink : [ DSA ChatBot AI](https://pdf-document-q-a-1.onrender.com/)

### 🔍 Retrieval-Augmented Generation (RAG)
- PDF loaded with **LangChain PDFLoader** and split into overlapping chunks using **RecursiveCharacterTextSplitter**
- Chunks embedded via **HuggingFace Embeddings** and stored in **Pinecone** vector DB
- No runtime file upload needed — knowledge base is always ready
- Semantic similarity search retrieves the most relevant chunks per query

### ⚡ Groq-Accelerated LLM Inference
- LLM inference routed through **Groq** (LLaMA) for ultra-fast response times
- Retrieved chunks injected as context into every prompt
- Answers are grounded in source material — dramatically reducing hallucination

### 💬 Conversational Multi-Turn Chat
- React frontend maintains full **chat history per document session**
- Context-aware follow-up questions supported
- Clean, responsive chat UI

### 🏗️ Zero-Upload Architecture
- Knowledge base pre-indexed at build time — instant first response
- No user file management or upload latency
- Scales efficiently — vector index built once, queried many times

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, CSS, JavaScript |
| **Backend** | Node.js, Express |
| **RAG Framework** | LangChain (JS) |
| **Embeddings** | HuggingFace Embeddings |
| **Vector Database** | Pinecone |
| **LLM** | LLaMA via Groq |
| **Deployment** | Render |

---

## 🏗️ Architecture Overview

```
                        BUILD TIME
┌──────────────────────────────────────────────┐
│  PDF Document                                │
│      │                                       │
│  LangChain PDFLoader                         │
│      │                                       │
│  RecursiveCharacterTextSplitter              │
│      │                                       │
│  Chunked Corpus ──► HuggingFace Embeddings   │
│                           │                  │
│                      Pinecone Index          │
└──────────────────────────────────────────────┘

                        QUERY TIME
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                       │
│         Multi-turn Chat UI + Session History            │
└────────────────────┬────────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────────┐
│                  Express Backend                         │
│                                                         │
│  User Query ──► Pinecone Semantic Search                │
│                       │                                 │
│              Top-K Relevant Chunks                      │
│                       │                                 │
│         Prompt = Query + Context Chunks                 │
│                       │                                 │
│              Groq (LLaMA) Inference                     │
│                       │                                 │
│              Grounded Answer ──► Client                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Pinecone account + index
- HuggingFace API key
- Groq API key

### 1. Clone the repository

```bash
git clone https://github.com/Artibar/PDF-Document-Q-A.git
cd PDF-Document-Q-A
```

### 2. Configure environment variables

Create a `.env` file in the root/server directory:

```env
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name
HUGGINGFACE_API_KEY=your_huggingface_api_key
GROQ_API_KEY=your_groq_api_key
PORT=5000
```

### 3. Index your document (build time)

```bash
# Run the loader & splitter script to chunk, embed, and push to Pinecone
node server/loader.js
```

### 4. Install & run

```bash
# Backend
cd server && npm install && npm start

# Frontend (new terminal)
cd client && npm install && npm run dev
```

The app will be available at `http://localhost:5173`

---


## 💡 How RAG Works Here

```
1. LOAD    →  PDF is loaded via LangChain PDFLoader
2. SPLIT   →  RecursiveCharacterTextSplitter breaks corpus into overlapping chunks
3. EMBED   →  Each chunk is converted to a vector via HuggingFace
4. STORE   →  Vectors are upserted into Pinecone with metadata
5. QUERY   →  User question is embedded, top-K chunks retrieved
6. AUGMENT →  Retrieved chunks injected into the LLM prompt as context
7. RESPOND →  Groq (LLaMA) generates a grounded, accurate answer
```

This pipeline ensures the model **never answers from memory alone** — every response is anchored to the source document.

---

## 🔮 Roadmap

- [ ] Support multiple documents with per-doc session switching
- [ ] Highlight the source chunk used to answer each question
- [ ] User-facing document upload for custom knowledge bases
- [ ] Streaming responses for faster perceived latency
- [ ] Citation references in answers with page numbers

---

## 🙋‍♂️ About This Project

This is a **portfolio project** demonstrating applied ML engineering and full-stack development skills including:

- Designing and implementing a **RAG pipeline** end-to-end from scratch
- Working with **vector databases** (Pinecone) for semantic retrieval
- Integrating **HuggingFace embedding models** in a Node.js environment
- Leveraging **Groq's inference API** for low-latency LLM calls
- Building multi-turn conversational UIs with session history in React
- Architecting a **zero-upload, build-time indexing** strategy for production readiness

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ as a portfolio project**

[![Live Demo](https://img.shields.io/badge/🌐%20Try%20It%20Live-DSA%20ChatBot%20AI-6C63FF?style=flat-square)](https://pdf-document-q-a-1.onrender.com/)
&nbsp;&nbsp;
[![GitHub](https://img.shields.io/badge/⭐%20Star%20on%20GitHub-Artibar%2FPDF--Document--Q--A-181717?style=flat-square)](https://github.com/Artibar/PDF-Document-Q-A)

*If this helped you understand RAG, drop a ⭐ — it means a lot!*

</div>
