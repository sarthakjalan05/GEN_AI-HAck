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
yarn add @craco/craco --dev (if necessary)
yarn start
```
