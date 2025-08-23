# Healthcare Survey Analytics API Setup

## Overview
This solution provides a Python FastAPI backend that processes healthcare survey data and serves visualization data to the Next.js frontend.

## Architecture
```
Next.js Frontend (http://localhost:1994)
        ↓ API Calls
Python FastAPI Backend (http://localhost:8000)
        ↓ CSV Processing
    Data Visualizations
```

## Quick Start

### Option 1: Using the startup script (Linux/Mac/WSL)
```bash
cd app/(dashboard)/proof-of-concept
./start_api.sh
```

### Option 2: Manual setup

1. **Install Python 3.8+** (if not already installed)
   - Check version: `python3 --version`
   - Download from: https://www.python.org/downloads/

2. **Install dependencies**
   ```bash
   cd app/(dashboard)/proof-of-concept
   pip install -r requirements.txt
   ```

3. **Start the API server**
   ```bash
   python3 api_server.py
   ```

4. **Access the services**
   - API Server: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Frontend Dashboard: http://localhost:1994/proof-of-concept

## API Endpoints

### Health Check
- `GET /` - Check if API is running

### Data Endpoints
- `GET /api/sample-data` - Get visualization data from sample CSV
- `POST /api/process-csv` - Upload and process a CSV file
- `GET /api/visualization-data/{viz_type}` - Get specific visualization data
  - `viz_type`: "regional" or "sizeband"

## Features

### Exhibit 1: Regional Distribution
- Summary table showing organization counts by region
- Donut chart visualization
- Percentages: So Cal (45%), Bay Area (20%), Rural (18%), Sacramento (10%), San Diego (7%)

### Exhibit 2: Organization Size Distribution
- Summary table showing organizations by employee size bands
- Horizontal bar chart
- Size bands: 100-999, 1000-2499, 2500-4999, 5000-9999, 10000-19999, 20000+

## Frontend Integration

The React component `DataVisualizationDashboard` automatically:
1. Checks API server status
2. Fetches data from the Python backend
3. Displays both exhibits with tables and charts
4. Shows real-time connection status
5. Provides data refresh capability

## Troubleshooting

### API Server won't start
- Ensure Python 3.8+ is installed
- Check if port 8000 is available: `lsof -i :8000`
- Install missing dependencies: `pip install -r requirements.txt`

### CORS errors
- The API is configured to accept requests from localhost:1994 and localhost:3000
- Ensure you're accessing the frontend from the correct URL

### Data not loading
1. Check API server is running: http://localhost:8000
2. Check browser console for errors
3. Verify CSV file has required columns:
   - `General Information - Location Represented`
   - `General Information - Number of Employees`

## Development

### Adding new visualizations
1. Add endpoint in `api_server.py`
2. Create React component in `/components/proof-of-concept/`
3. Import and use in the dashboard

### Modifying data processing
- Edit `categorize_size_band()` function for different size bands
- Adjust percentage calculations in endpoint handlers
- Update color schemes in both Python and React code

## Production Deployment

For production deployment:
1. Use a production ASGI server like Gunicorn
2. Configure proper CORS origins
3. Add authentication/authorization
4. Use environment variables for configuration
5. Deploy behind a reverse proxy (nginx/Apache)

Example production command:
```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker api_server:app --bind 0.0.0.0:8000
```