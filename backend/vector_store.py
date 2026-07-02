import hashlib

import chromadb

client = chromadb.PersistentClient(path="./chroma_db")

collection = client.get_or_create_collection(name="repo_chunks")


def _make_id(file_path: str, index: int) -> str:
    file_hash = hashlib.md5(file_path.encode()).hexdigest()[:8]
    return f"{file_hash}_{index}"


def clear_collection():
    data = collection.get(include=[])
    if data and data["ids"]:
        collection.delete(ids=data["ids"])


def store_chunks(chunk_items):
    clear_collection()

    batch_size = 100
    for start in range(0, len(chunk_items), batch_size):
        batch = chunk_items[start : start + batch_size]

        collection.add(
            documents=[item["text"] for item in batch],
            ids=[_make_id(item["file"], item["index"]) for item in batch],
            metadatas=[{"file": item["file"]} for item in batch],
        )

    return len(chunk_items)
