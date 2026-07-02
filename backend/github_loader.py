from git import Repo
import os

def clone_repo(repo_url):

    repo_name = repo_url.split("/")[-1].replace(".git","")

    save_path = f"repos/{repo_name}"

    if os.path.exists(save_path):
        return save_path

    Repo.clone_from(repo_url, save_path)

    return save_path