Programming Languages

Python 🐍
→ Backend logic, AI pipeline, automation, FastAPI server

JavaScript (React) ⚛️
→ Frontend UI (ChatPanel, BrowserView, SuggestionsPanel)

HTML + CSS 🎨
→ UI structure and styling

🤖 AI & APIs

Google Gemini Live API
→ Real-time multimodal analysis (screenshots → intent, prices, context)
→ Used for:

Screen understanding

Intent detection

Travel data extraction

Gemini Multimodal Models (via google-generativeai)
→ For structured outputs (TravelContext, suggestions)

🌐 Backend & Communication

FastAPI
→ Backend server
→ Handles agent logic + API endpoints

WebSockets (Bidirectional Streaming)
→ Real-time communication between frontend and backend
→ Enables:

Live suggestions

Chat updates

Streaming AI responses

🧭 Browser Automation

Playwright
→ Controls browser actions
→ Used for:

Clicking buttons

Filling forms

Scrolling

Navigating travel websites

🧠 Data & Memory

Custom Memory Bank (Graph-based / JSON storage)
→ Stores:

User preferences

Past searches

Suggestion feedback

🎨 Frontend Stack

React.js
→ UI components

react-use-websocket (or native WebSocket)
→ Handles real-time connection

Tailwind CSS (optional but recommended)
→ Styling and layout

☁️ Cloud & Deployment

Google Cloud Run
→ Hosts backend

Vertex AI (Gemini integration)
→ Access to Gemini models

MCP Server (Model Context Protocol)
→ Media + context integration (optional advanced feature)

⚙️ Supporting Tools

Pydantic → data validation (TravelContext)

Uvicorn → ASGI server

Playwright Chromium → browser engine
