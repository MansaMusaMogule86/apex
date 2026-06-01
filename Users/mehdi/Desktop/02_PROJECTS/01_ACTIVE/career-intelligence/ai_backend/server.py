from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from chatbot import CoopPolicyChatbot, REFUSAL_MESSAGE


class ChatRequest(BaseModel):
    message: str


app = FastAPI(title="RIT Dubai Co-op Policy Chatbot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

kb_path = Path(__file__).with_name("knowledge_base.txt")
chatbot = CoopPolicyChatbot(str(kb_path))


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/chat")
def chat(payload: ChatRequest) -> dict:
    try:
        reply = chatbot.ask(payload.message)

        if not reply:
            return {"response": REFUSAL_MESSAGE}

        return {"response": reply}
    except Exception:
        return {"response": "System error"}
