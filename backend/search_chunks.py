import vector_store


def search_chunks(query, n_results=5):
    collection = vector_store.collection
    count = collection.count()

    if count == 0:
        return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

    n_results = min(n_results, count)

    return collection.query(
        query_texts=[query],
        n_results=n_results,
    )
