<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://thumbs.dreamstime.com/b/aerial-drone-view-field-trees-forest-agriculture-land-top-look-to-meadow-near-village-farm-beautiful-green-fresh-crop-146036946.jpg"/>
</div>

# SIH_SOFTWARE_Demo

A demo AI Studio web app that uses the Gemini API. This repository contains the source code and instructions to run the app locally and deploy it.

Live demo: https://sih-software-demo.onrender.com
## Features

- Web UI built with Node.js (and typical frontend tooling)
- Connects to Gemini (set via GEMINI_API_KEY)
- Ready for local development and deployment

## Tech stack

- Node.js
- (Add frontend framework / bundler info here if applicable)

## Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- A Gemini API key

## Setup (Local)

1. Clone the repository:

   ```bash
   git clone https://github.com/Subhom-Ghosh/SIH_SOFTWARE_Demo.git
   cd SIH_SOFTWARE_Demo
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   # yarn install
   ```

3. Create a local environment file `.env.local` at the project root and add your Gemini API key:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   Make sure `.env.local` is listed in `.gitignore` so you don't commit secrets to the repo.

4. Run the app in development mode:

   ```bash
   npm run dev
   ```

5. Open your browser at the URL printed by the dev server (commonly http://localhost:3000).

## Build & Deploy

- To create a production build (if applicable):

  ```bash
  npm run build
  npm run start
  ```

- Deploy to your preferred hosting (Vercel, Netlify, Render, etc.). Ensure the `GEMINI_API_KEY` is set in your platform's environment variables.

## Environment Variables

- GEMINI_API_KEY — Required. Your API key for the Gemini service.

Optional variables (add as needed):
- PORT — Port the server should listen on (default is typically 3000).

## Troubleshooting

- "Missing GEMINI_API_KEY" — Ensure `.env.local` exists and contains the key, and restart the dev server.
- Dependency or build errors — try removing `node_modules` and reinstalling: `rm -rf node_modules && npm install`.

## Contributing

Contributions are welcome. Please open issues for bugs or features and create pull requests for proposed changes.

## License

Specify a license for your project (e.g., MIT). If you don't have one yet, add a `LICENSE` file or change this section as needed.

---

If you'd like, I can:
- Add more details about the tech stack (frontend framework, build tools) by inspecting the repo,
- Add sample screenshots or a short demo GIF to the README,
- Create a `.env.example` file and a basic deploy guide for a specific host (Vercel/Heroku).
