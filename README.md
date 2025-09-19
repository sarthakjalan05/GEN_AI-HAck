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

##### Start Frontend (Terminal 2)
```bash
cd frontend
yarn add @craco/craco --dev (if necessary)
yarn start
```


