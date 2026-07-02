def chunk_text(text, chunk_size=500, overlap=50):
    if not text:
        return []

    chunks = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = min(start + chunk_size, text_len)
        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end >= text_len:
            break

        start += chunk_size - overlap

    return chunks
