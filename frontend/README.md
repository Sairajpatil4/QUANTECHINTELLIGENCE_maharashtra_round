# TrustLayer frontend

React, TypeScript, Vite, and Tailwind CSS frontend for the TrustLayer API.

## Run locally

Prerequisites: Node.js and Python.

1. From this directory, install frontend packages with `npm install`.
2. In another terminal, start the backend from the repository root using the instructions in [backend/README.md](../backend/README.md).
3. Start this app with `npm run dev` and open `http://localhost:3000`.

The Vite development server proxies `/api` requests to `http://127.0.0.1:8000`, so the browser uses the same origin and does not require backend CORS changes. Set `VITE_API_BASE_URL` only when using a different API base; see [.env.example](.env.example).

## Investigation flow

The investigation dialog creates an investigation, uploads selected evidence, requests analysis, and renders the API assessment, findings, evidence signals, graph counts, and limitations. Supported API evidence types are image, video, audio, and text. Documents are sent as text evidence.

Real analysis requires analyzer and fusion integrations to be registered in the backend. Without them, the API stores and returns explicit limitations instead of fabricating a verdict.
