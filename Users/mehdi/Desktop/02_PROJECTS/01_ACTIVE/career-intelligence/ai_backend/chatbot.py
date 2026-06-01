import os
import re
from pathlib import Path
from typing import List

import google.generativeai as genai
from dotenv import load_dotenv

REFUSAL_MESSAGE = (
    "I can only answer questions about RIT Dubai Co-op policies that are explicitly covered in the knowledge base."
)


class CoopPolicyChatbot:
    def __init__(self, knowledge_base_path: str = "knowledge_base.txt") -> None:
        load_dotenv()

        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key:
            raise RuntimeError("Missing GEMINI_API_KEY")

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-1.5-flash")

        kb_file = Path(knowledge_base_path)
        if not kb_file.is_file():
            raise RuntimeError(f"Knowledge base not found: {knowledge_base_path}")

        self.knowledge_base = kb_file.read_text(encoding="utf-8").strip()
        self.kb_lines = [line.strip() for line in self.knowledge_base.splitlines() if line.strip()]
        self.kb_vocabulary = self._build_vocabulary(self.knowledge_base)

    @staticmethod
    def _build_vocabulary(text: str) -> set:
        tokens = re.findall(r"[a-zA-Z0-9]+", text.lower())
        return {t for t in tokens if len(t) > 2}

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        return re.findall(r"[a-zA-Z0-9]+", text.lower())

    def _is_in_scope(self, user_message: str) -> bool:
        tokens = [t for t in self._tokenize(user_message) if len(t) > 2]
        if not tokens:
            return False

        overlap = sum(1 for t in tokens if t in self.kb_vocabulary)
        return overlap >= 1

    def _retrieve_relevant_lines(self, user_message: str, limit: int = 10) -> str:
        query_tokens = set(self._tokenize(user_message))
        scored = []

        for line in self.kb_lines:
            line_tokens = set(self._tokenize(line))
            score = len(query_tokens.intersection(line_tokens))
            if score > 0:
                scored.append((score, line))

        scored.sort(key=lambda item: item[0], reverse=True)
        selected = [line for _, line in scored[:limit]]

        if not selected:
            return self.knowledge_base

        return "\n".join(selected)

    def ask(self, user_message: str) -> str:
        message = (user_message or "").strip()
        if not message:
            return REFUSAL_MESSAGE

        if not self._is_in_scope(message):
            return REFUSAL_MESSAGE

        context = self._retrieve_relevant_lines(message)

        system_prompt = (
            "You are a strict policy assistant for RIT Dubai Co-op. "
            "Answer ONLY using the provided knowledge base context. "
            "If the answer is not explicitly present, reply exactly with: "
            f"{REFUSAL_MESSAGE} "
            "Do not guess. Do not add external information. Keep answers concise and clear."
        )

        prompt = (
            f"{system_prompt}\n\n"
            f"Knowledge Base Context:\n{context}\n\n"
            f"User Question:\n{message}\n\n"
            "Assistant Answer:"
        )

        response = self.model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.0,
                "top_p": 0.0,
                "max_output_tokens": 220,
            },
        )

        text = (getattr(response, "text", "") or "").strip()
        if not text:
            return REFUSAL_MESSAGE

        return text
