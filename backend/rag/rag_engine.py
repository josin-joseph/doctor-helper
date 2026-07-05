import os
import json
import numpy as np
import requests
from sentence_transformers import SentenceTransformer
import faiss
from .medical_knowledge import MEDICAL_DOCUMENTS

VECTOR_DB_PATH = os.path.join(
    os.path.dirname(__file__), '..', '..', 'vector_db', 'faiss_index'
)
OLLAMA_URL = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')

_embedder = None
_index = None
_documents = None


def get_embedder():
    global _embedder
    if _embedder is None:
        print("Loading sentence transformer model...")
        _embedder = SentenceTransformer('all-MiniLM-L6-v2')
    return _embedder


def build_faiss_index():
    """Build and save FAISS index from all 773 medical documents."""
    embedder = get_embedder()
    os.makedirs(VECTOR_DB_PATH, exist_ok=True)

    if not MEDICAL_DOCUMENTS:
        raise ValueError("No medical documents found. Check medical_knowledge folder.")

    print(f"Building FAISS index for {len(MEDICAL_DOCUMENTS)} documents...")
    texts = [doc['content'] for doc in MEDICAL_DOCUMENTS]

    # Encode in batches to avoid memory issues
    embeddings = embedder.encode(
        texts,
        batch_size=64,
        show_progress_bar=True,
        convert_to_numpy=True
    )
    embeddings = embeddings.astype('float32')

    # Normalize for cosine similarity
    faiss.normalize_L2(embeddings)

    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)  # Inner product = cosine after normalization
    index.add(embeddings)

    # Save index and metadata
    faiss.write_index(index, os.path.join(VECTOR_DB_PATH, 'medical.index'))
    with open(os.path.join(VECTOR_DB_PATH, 'documents.json'), 'w', encoding='utf-8') as f:
        json.dump(MEDICAL_DOCUMENTS, f, ensure_ascii=False)

    print(f"FAISS index built with {len(MEDICAL_DOCUMENTS)} documents and saved.")
    return index


def load_faiss_index():
    """Load existing FAISS index or build a new one."""
    index_path = os.path.join(VECTOR_DB_PATH, 'medical.index')
    docs_path  = os.path.join(VECTOR_DB_PATH, 'documents.json')

    if os.path.exists(index_path) and os.path.exists(docs_path):
        print("Loading existing FAISS index...")
        index = faiss.read_index(index_path)
        with open(docs_path, 'r', encoding='utf-8') as f:
            documents = json.load(f)
        print(f"Loaded FAISS index with {index.ntotal} documents.")
        return index, documents
    else:
        print("No existing index found. Building new index...")
        index = build_faiss_index()
        return index, MEDICAL_DOCUMENTS


def retrieve_relevant_docs(query: str, top_k: int = 5):
    """Retrieve top_k most relevant documents for a query."""
    global _index, _documents

    if _index is None:
        _index, _documents = load_faiss_index()

    embedder = get_embedder()
    query_embedding = embedder.encode([query], convert_to_numpy=True).astype('float32')
    faiss.normalize_L2(query_embedding)

    scores, indices = _index.search(query_embedding, top_k)

    results = []
    for idx, score in zip(indices[0], scores[0]):
        if 0 <= idx < len(_documents):
            doc = _documents[idx].copy()
            doc['relevance_score'] = round(float(score), 4)
            results.append(doc)

    return results


def query_ollama(prompt: str, model: str = 'llama3'):
    """Send a prompt to Ollama and stream the response."""
    try:
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                'model': model,
                'prompt': prompt,
                'stream': False,
                'options': {
                    'temperature': 0.3,
                    'num_predict': 512,
                }
            },
            timeout=120
        )
        if response.status_code == 200:
            return response.json().get('response', '').strip()
        else:
            return f"Ollama error: {response.status_code} - {response.text}"
    except requests.exceptions.ConnectionError:
        return "Error: Cannot connect to Ollama. Please ensure Ollama is running (ollama serve)."
    except requests.exceptions.Timeout:
        return "Error: Ollama request timed out. The model may still be loading."
    except Exception as e:
        return f"Error: {str(e)}"


def ask_medical_assistant(question: str, patient_context: str = ''):
    """
    Full RAG pipeline:
    1. Retrieve relevant docs from 773-disease knowledge base
    2. Build context-rich prompt
    3. Query Llama 3 via Ollama
    4. Return answer with sources
    """
    # Step 1 — Retrieve relevant documents
    relevant_docs = retrieve_relevant_docs(question, top_k=5)

    # Step 2 — Build context
    context = "\n\n".join([
        f"[{doc['title']}]\n{doc['content'].strip()}"
        for doc in relevant_docs
    ])

    patient_section = (
        f"\nPatient Context:\n{patient_context}\n"
        if patient_context else ""
    )

    # Step 3 — Build prompt
    prompt = f"""You are a clinical decision support assistant helping doctors.
Use the medical knowledge below to answer the doctor's question accurately.
Always recommend verifying with clinical guidelines before final decisions.

Medical Knowledge:
{context}
{patient_section}
Doctor's Question: {question}

Provide a clear, evidence-based answer in 3-5 sentences.
Include specific values, dosages, or thresholds when relevant.
End with a brief clinical recommendation.

Answer:"""

    # Step 4 — Get Llama 3 response
    answer = query_ollama(prompt)

    return {
        'answer': answer,
        'sources': [
            {
                'title': doc['title'],
                'relevance': doc['relevance_score']
            }
            for doc in relevant_docs
        ],
        'question': question,
        'documents_searched': len(_documents) if _documents else 0,
    }