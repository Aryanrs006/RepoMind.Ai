import os

import google.generativeai as genai

_model = None


def _get_model():
    global _model

    if _model is not None:
        return _model

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not set. Add it to your .env file.")

    genai.configure(api_key=api_key)
    _model = genai.GenerativeModel("gemini-2.5-flash")
    return _model


def ask_gemini(context, question):
    prompt = f"""
You are a senior software engineer.

Context:
{context}

Question:
{question}

Answer the question in simple English.
Do not copy the code.
Explain the code functionality only.
"""

    response = _get_model().generate_content(prompt)

    if not response.text:
        raise RuntimeError("Empty response from Gemini API")

    return response.text
