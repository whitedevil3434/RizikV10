"""
Knowledge Service for Rizik Agent - RAG (Retrieval Augmented Generation)
Indexes PDFs and Markdown files into ChromaDB for semantic search.
"""

import os
import re
import logging
import fitz  # PyMuPDF
import chromadb
from pathlib import Path
from typing import List, Dict, Optional

logger = logging.getLogger("rizik-knowledge")

# Paths
PROJECT_ROOT = Path(__file__).parent.parent.parent  # flutter_rizikv1
PDF_DIR = PROJECT_ROOT / "Aplans" / "Planofrizik "
DOCS_DIR = PROJECT_ROOT / "_project_docs"
CHROMA_DIR = Path(__file__).parent / ".chroma_db"

# ChromaDB Client (persistent local storage)
_client = None
_collection = None


def get_collection():
    """Get or create ChromaDB collection."""
    global _client, _collection
    
    if _collection is None:
        _client = chromadb.PersistentClient(path=str(CHROMA_DIR))
        _collection = _client.get_or_create_collection(
            name="rizik_knowledge",
            metadata={"hnsw:space": "cosine"}
        )
        logger.info(f"📚 ChromaDB loaded: {_collection.count()} documents")
    
    return _collection


def chunk_text_bengali(text: str, max_chars: int = 500) -> List[str]:
    """
    Smart chunking for Bengali text.
    Respects Bengali Purnodari (।), question marks, and natural sentence breaks.
    """
    # Split by Bengali sentence endings, keep delimiter
    sentences = re.split(r'(?<=[।?!।\n])\s*', text)
    
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
            
        if len(current_chunk) + len(sentence) < max_chars:
            current_chunk += " " + sentence
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return [c for c in chunks if len(c) > 20]  # Filter tiny chunks


def parse_pdf(pdf_path: Path) -> List[Dict]:
    """Parse PDF and extract text with metadata."""
    chunks = []
    
    try:
        doc = fitz.open(pdf_path)
        full_text = ""
        
        for page_num, page in enumerate(doc):
            full_text += page.get_text() + "\n"
        
        # Chunk the text
        text_chunks = chunk_text_bengali(full_text)
        
        for i, chunk in enumerate(text_chunks):
            chunks.append({
                "id": f"pdf_{pdf_path.stem}_{i}",
                "text": chunk,
                "metadata": {
                    "source": pdf_path.name,
                    "type": "pdf",
                    "chunk_index": i
                }
            })
        
        logger.info(f"📄 Parsed {pdf_path.name}: {len(chunks)} chunks")
        doc.close()
        
    except Exception as e:
        logger.error(f"PDF parse error {pdf_path}: {e}")
    
    return chunks


def parse_markdown(md_path: Path) -> List[Dict]:
    """Parse Markdown file and extract text."""
    chunks = []
    
    try:
        with open(md_path, 'r', encoding='utf-8') as f:
            text = f.read()
        
        # Remove code blocks (keep focus on prose)
        text = re.sub(r'```[\s\S]*?```', '', text)
        
        # Chunk the text
        text_chunks = chunk_text_bengali(text, max_chars=400)
        
        for i, chunk in enumerate(text_chunks):
            chunks.append({
                "id": f"md_{md_path.stem}_{i}",
                "text": chunk,
                "metadata": {
                    "source": md_path.name,
                    "type": "markdown",
                    "chunk_index": i
                }
            })
        
    except Exception as e:
        logger.error(f"Markdown parse error {md_path}: {e}")
    
    return chunks


def index_knowledge_base(force_reindex: bool = False) -> int:
    """
    Index all PDFs and key Markdown files into ChromaDB.
    Returns number of documents indexed.
    """
    collection = get_collection()
    
    # Skip if already indexed (unless forced)
    if collection.count() > 0 and not force_reindex:
        logger.info(f"📚 Knowledge base already indexed: {collection.count()} docs")
        return collection.count()
    
    # Clear existing if reindexing
    if force_reindex and collection.count() > 0:
        _client.delete_collection("rizik_knowledge")
        collection = get_collection()
    
    all_chunks = []
    seen_ids = set()
    
    # Index PDFs
    if PDF_DIR.exists():
        for pdf_file in PDF_DIR.glob("*.pdf"):
            try:
                chunks = parse_pdf(pdf_file)
                all_chunks.extend(chunks)
            except Exception as e:
                logger.error(f"PDF error {pdf_file}: {e}")
    
    # Index key Markdown files (HOW_TO, QUICK_START, etc.)
    if DOCS_DIR.exists():
        priority_patterns = ["HOW_TO_*", "QUICK_*", "RIZIK_*"]
        for pattern in priority_patterns:
            for md_file in DOCS_DIR.glob(pattern):
                try:
                    chunks = parse_markdown(md_file)
                    all_chunks.extend(chunks)
                except Exception as e:
                    logger.error(f"MD error {md_file}: {e}")
    
    if not all_chunks:
        logger.warning("No documents found to index!")
        return 0
    
    # Deduplicate by ID
    unique_chunks = []
    for c in all_chunks:
        if c["id"] not in seen_ids:
            seen_ids.add(c["id"])
            unique_chunks.append(c)
    
    # Add to ChromaDB in batches
    batch_size = 100
    for i in range(0, len(unique_chunks), batch_size):
        batch = unique_chunks[i:i+batch_size]
        collection.add(
            ids=[c["id"] for c in batch],
            documents=[c["text"] for c in batch],
            metadatas=[c["metadata"] for c in batch]
        )
    
    logger.info(f"✅ Indexed {len(unique_chunks)} chunks into ChromaDB")
    return len(unique_chunks)


def search_knowledge(query: str, n_results: int = 3) -> List[Dict]:
    """
    Search knowledge base for relevant chunks.
    Returns top N most relevant chunks.
    """
    collection = get_collection()
    
    if collection.count() == 0:
        logger.warning("Knowledge base is empty - indexing now...")
        index_knowledge_base()
    
    try:
        results = collection.query(
            query_texts=[query],
            n_results=n_results
        )
        
        chunks = []
        if results and results['documents']:
            for i, doc in enumerate(results['documents'][0]):
                chunks.append({
                    "text": doc,
                    "metadata": results['metadatas'][0][i] if results['metadatas'] else {},
                    "distance": results['distances'][0][i] if results['distances'] else 0
                })
        
        return chunks
        
    except Exception as e:
        logger.error(f"Search error: {e}")
        return []


def build_rag_context(query: str) -> str:
    """
    Build RAG context for LLM from knowledge base search.
    Returns formatted context string for injection into prompt.
    """
    chunks = search_knowledge(query, n_results=3)
    
    if not chunks:
        return ""
    
    context_parts = []
    for i, chunk in enumerate(chunks):
        source = chunk['metadata'].get('source', 'Unknown')
        context_parts.append(f"[{source}]: {chunk['text']}")
    
    return "\n\n".join(context_parts)


# Auto-index on module load (background)
def init_knowledge_base():
    """Initialize knowledge base (call on agent startup)."""
    try:
        count = index_knowledge_base()
        logger.info(f"🧠 Knowledge base ready: {count} documents")
    except Exception as e:
        logger.error(f"Knowledge base init error: {e}")
