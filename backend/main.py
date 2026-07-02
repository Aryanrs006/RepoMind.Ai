from dotenv import load_dotenv

load_dotenv()

import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from github_loader import clone_repo
from repo_reader import read_repo
from chunker import chunk_text
from vector_store import store_chunks
from search_chunks import search_chunks
from gemini_helper import ask_gemini

app = FastAPI()

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CURRENT_REPO = None


def require_repo():
    if not CURRENT_REPO:
        raise HTTPException(status_code=400, detail="No repo cloned. Call /clone first.")


@app.get("/")
def home():
    return {"message": "RepoMind Running"}


@app.get("/clone")
def clone(url: str):
    global CURRENT_REPO

    try:
        CURRENT_REPO = clone_repo(url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Clone failed: {e}")

    return {"repo": CURRENT_REPO}


@app.get("/read")
def read():
    require_repo()

    data = read_repo(CURRENT_REPO)

    if len(data) == 0:
        return {"message": "No files found"}

    return {
        "total_files": len(data),
        "files": [file["file"] for file in data],
    }


@app.get("/chunks")
def chunks():
    require_repo()

    data = read_repo(CURRENT_REPO)

    if len(data) == 0:
        return {"message": "No files"}

    content = data[0]["content"]
    chunks = chunk_text(content)

    return {
        "total_chunks": len(chunks),
        "chunks": chunks,
    }


@app.get("/store")
def store():
    require_repo()

    data = read_repo(CURRENT_REPO)

    if len(data) == 0:
        return {"message": "No files to store"}

    chunk_items = []

    for file in data:
        chunks = chunk_text(file["content"])
        for i, chunk in enumerate(chunks):
            chunk_items.append({
                "text": chunk,
                "file": file["file"],
                "index": i,
            })

    stored_count = store_chunks(chunk_items)

    return {
        "stored_in_db": stored_count,
        "chunks_stored": len(chunk_items),
    }


@app.get("/search")
def search(query: str):
    return search_chunks(query)


@app.get("/ask")
def ask(question: str):
    results = search_chunks(question)

    documents = results.get("documents", [[]])
    if not documents or not documents[0]:
        return {"error": "No relevant code found"}

    metadatas = results.get("metadatas", [[]])
    context_parts = []

    for i, doc in enumerate(documents[0]):
        file_name = ""
        if metadatas and metadatas[0] and i < len(metadatas[0]):
            file_name = metadatas[0][i].get("file", "")
        prefix = f"[{file_name}]\n" if file_name else ""
        context_parts.append(prefix + doc)

    context = "\n\n".join(context_parts)

    try:
        answer = ask_gemini(context, question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {e}")

    return {
        "question": question,
        "answer": answer,
    }
