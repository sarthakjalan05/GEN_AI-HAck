#### To Start the Application Locally

# Create virtual environment

python -m venv myenv

# Activate it

.\myenv\Scripts\Activate

# Then

pip install -r requirements.txt

##### Start Backend (Terminal 1)

```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

Note: Backend now uses Firebase Firestore. Ensure you have a Google Cloud service account JSON and set the environment variable before starting:

```powershell
# PowerShell (Windows)
$env:GOOGLE_APPLICATION_CREDENTIALS="D:\\path\\to\\service-account.json"
```

Or create a `.env` file in `backend/` that sets `GOOGLE_APPLICATION_CREDENTIALS` to the absolute path of your service account JSON. Firestore project should match your Firebase project configured in the frontend.

##### Start Frontend (Terminal 2)

```bash
cd frontend
# Prereqs: Install Node.js (LTS) from https://nodejs.org and ensure `node` & `npm` are on PATH.
# Optional: Install Yarn (https://yarnpkg.com/getting-started/install) or use npm.

# Install deps
# If using Yarn
yarn install
# If using npm
npm install

# Install dotenv-cli (dev dependency) so the frontend can read the root .env
# Yarn
yarn add -D dotenv-cli
# npm
npm install -D dotenv-cli

# Start dev server (CRA via craco), loading env from both ../.env and ./frontend/.env
yarn start
# or
npm run start
```

Environment variables

- This project supports a single root-level .env (at repository root) shared by both backend and frontend.
- The frontend has been configured to load env from both ../.env (root) and ./frontend/.env, with frontend/.env taking precedence when the same key is present.
- Recommended placement:
  - Root .env: REACT_APP_BACKEND_URL, CORS_ORIGINS, GOOGLE_APPLICATION_CREDENTIALS (for local backend), GEMINI_API_KEY
  - Frontend .env: Firebase web config (REACT*APP_FIREBASE*\* keys) and any frontend-only overrides

Notes

- REACT_APP_BACKEND_URL may include a trailing slash; the frontend normalizes it to avoid double slashes.
- Backend CORS defaults to allow all (\*) unless overridden via CORS_ORIGINS in .env.
- On Cloud Run, backend uses ADC; locally, set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path.
