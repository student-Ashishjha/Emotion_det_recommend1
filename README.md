# Emotion Detection and Recommendation System

This project is an Emotion Detection and Recommendation system that uses a deep learning model to detect facial expressions from images and videos. It consists of a backend API built with FastAPI and a frontend interface built with React.

## Backend

The backend provides REST API endpoints for uploading images and videos, detecting emotions in images, and a WebSocket endpoint for real-time emotion detection.

### Setup

1. Create a virtual environment (optional but recommended):

```bash
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```

2. Install the required Python packages:

```bash
pip install -r backend/requirements.txt
```

3. Run the backend server:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

## Frontend

The frontend is built with React and located in the `frontend` directory. Follow the instructions in the `frontend` folder to set up and run the frontend application.

## Usage

- Use the API endpoints to upload images or videos and detect emotions.
- The WebSocket endpoint `/ws/capture` supports real-time emotion detection from video streams.

## License

This project is licensed under the MIT License.

## Author

Your Name Here
