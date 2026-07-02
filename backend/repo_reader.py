import os

SKIP_DIRS = {".git", "node_modules", "__pycache__", "venv", ".venv", "chroma_db"}
CODE_EXTENSIONS = (".py", ".js", ".ts", ".tsx", ".jsx", ".md", ".json")


def read_repo(repo_path):
    if not repo_path or not os.path.isdir(repo_path):
        return []

    files_data = []

    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

        for file in files:
            if not file.endswith(CODE_EXTENSIONS):
                continue

            full_path = os.path.join(root, file)

            try:
                with open(full_path, "r", encoding="utf-8") as f:
                    content = f.read()

                if content.strip():
                    files_data.append({
                        "file": full_path,
                        "content": content,
                    })
            except (OSError, UnicodeDecodeError):
                continue

    return files_data
