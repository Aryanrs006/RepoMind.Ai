import { useState } from "react";
import { cloneRepo, readRepo, storeRepo, askQuestion } from "./api";
import "./App.css";

const STEPS = ["Clone", "Read", "Store", "Ready"];

const SUGGESTIONS = [
  "What does this project do?",
  "How does github_loader work?",
  "What endpoints are available?",
  "Explain the main architecture",
];

export default function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [step, setStep] = useState(-1);
  const [repoPath, setRepoPath] = useState("");
  const [files, setFiles] = useState([]);
  const [chunksStored, setChunksStored] = useState(0);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [asking, setAsking] = useState(false);

  const isReady = status === "ready";
  const isLoading = ["cloning", "reading", "storing"].includes(status);

  async function handleAnalyze() {
    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repo URL");
      return;
    }

    setError("");
    setMessages([]);
    setFiles([]);
    setChunksStored(0);
    setRepoPath("");

    try {
      setStatus("cloning");
      setStep(0);
      const cloneData = await cloneRepo(repoUrl.trim());
      setRepoPath(cloneData.repo);

      setStatus("reading");
      setStep(1);
      const readData = await readRepo();

      if (readData.message) {
        throw new Error(readData.message);
      }

      setFiles(readData.files || []);

      setStatus("storing");
      setStep(2);
      const storeData = await storeRepo();
      setChunksStored(storeData.chunks_stored || 0);

      setStep(3);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  async function handleAsk(text) {
    const q = text.trim();
    if (!q || asking || !isReady) return;

    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setAsking(true);
    setError("");

    try {
      const data = await askQuestion(q);

      if (data.error) {
        setMessages((prev) => [...prev, { role: "error", text: data.error }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "error", text: err.message }]);
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="logo">{"</>"}</span>
          <div>
            <h1>RepoMind.Ai</h1>
            <p>Understand any GitHub repo with AI</p>
          </div>
        </div>
        <div className={`status-pill ${isReady ? "online" : ""}`}>
          {isReady ? "Repo indexed" : "Waiting for repo"}
        </div>
      </header>

      <section className="hero card">
        <label htmlFor="repo-url">GitHub Repository URL</label>
        <div className="input-row">
          <input
            id="repo-url"
            type="url"
            placeholder="https://github.com/user/repo.git"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            disabled={isLoading}
          />
          <button type="button" onClick={handleAnalyze} disabled={isLoading}>
            {isLoading ? "Analyzing..." : "Analyze Repo"}
          </button>
        </div>

        <div className="steps">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`step ${i <= step ? "done" : ""} ${i === step && isLoading ? "active" : ""}`}
            >
              <span className="step-dot">{i < step || (i === step && isReady) ? "✓" : i + 1}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {error && <div className="error-banner">{error}</div>}
      </section>

      <div className="main-grid">
        <aside className="sidebar card">
          <h2>Repository</h2>
          {repoPath ? (
            <p className="repo-path">{repoPath}</p>
          ) : (
            <p className="muted">No repo loaded yet</p>
          )}

          <div className="stats">
            <div className="stat">
              <span className="stat-value">{files.length}</span>
              <span className="stat-label">Files</span>
            </div>
            <div className="stat">
              <span className="stat-value">{chunksStored}</span>
              <span className="stat-label">Chunks</span>
            </div>
          </div>

          <h3>Files</h3>
          <ul className="file-list">
            {files.length === 0 && <li className="muted">Files will appear here</li>}
            {files.map((file) => (
              <li key={file}>{file.split(/[/\\]/).pop()}</li>
            ))}
          </ul>
        </aside>

        <section className="chat card">
          <h2>Ask about the repo</h2>

          <div className="messages">
            {messages.length === 0 && (
              <div className="empty-chat">
                <p>Clone a repo and ask anything about its code.</p>
                {isReady && (
                  <div className="suggestions">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} type="button" onClick={() => handleAsk(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <span className="message-label">
                  {msg.role === "user" ? "You" : msg.role === "error" ? "Error" : "RepoMind"}
                </span>
                <p>{msg.text}</p>
              </div>
            ))}

            {asking && (
              <div className="message assistant loading">
                <span className="message-label">RepoMind</span>
                <p className="typing">Thinking...</p>
              </div>
            )}
          </div>

          <form
            className="ask-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk(question);
            }}
          >
            <input
              type="text"
              placeholder={isReady ? "Ask a question about this repo..." : "Analyze a repo first"}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={!isReady || asking}
            />
            <button type="submit" disabled={!isReady || asking || !question.trim()}>
              Ask
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
