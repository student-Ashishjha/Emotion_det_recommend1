from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from fastapi import HTTPException
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from PIL import Image
import numpy as np
import sys
from tensorflow.keras.utils import custom_object_scope
import cv2
import base64
import io

# Add path for custom layers
sys.path.append(os.path.join(os.getcwd(), "Emotion_det_recommend-master", "Facial-Expression-Prediction-1.0", "custom_layers"))
from scale_layer import Scale

app = FastAPI()

# Load model once on startup with custom object scope
MODEL_PATH = os.path.join(os.getcwd(), "Emotion_det_recommend-master", "Facial-Expression-Prediction-1.0", "emotion_detection_model.h5")
print(f"Attempting to load model from: {MODEL_PATH}")
print(f"Model file exists: {os.path.exists(MODEL_PATH)}")
try:
    with custom_object_scope({'Scale': Scale}):
        model = load_model(MODEL_PATH)
        print(f"Model input shape: {model.input_shape}")
        print(f"Model output shape: {model.output_shape}")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Emotion labels
EMOTION_LABELS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

# Allow CORS for frontend localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        return JSONResponse(status_code=400, content={"message": "File is not an image."})
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename, "message": "Image uploaded successfully."}

@app.post("/detect_emotion")
async def detect_emotion(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        return JSONResponse(status_code=400, content={"message": "File is not an image."})
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    # Save uploaded file temporarily
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # Load image with OpenCV for face detection
    try:
        image_cv = cv2.imread(file_location)
        if image_cv is None:
            return JSONResponse(status_code=400, content={"message": "Failed to read image with OpenCV."})
        gray = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
        results = []
        for (x, y, w, h) in faces:
            face_img = image_cv[y:y+h, x:x+w]
            face_img = cv2.resize(face_img, (48, 48))  # Resize to 48x48 as model expects
            face_img = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)  # Convert to grayscale
            face_img = face_img.astype('float32') / 255.0
            face_img = np.expand_dims(face_img, axis=-1)  # Add channel dimension
            face_img = np.expand_dims(face_img, axis=0)  # Add batch dimension
            preds = model.predict(face_img)
            emotion_idx = np.argmax(preds)
            emotion_label = EMOTION_LABELS[emotion_idx]
            confidence = float(preds[0][emotion_idx])
            results.append({
                "box": {"x": int(x), "y": int(y), "w": int(w), "h": int(h)},
                "emotion": emotion_label,
                "confidence": confidence
            })
        return {"faces": results}
    except Exception as e:
        return JSONResponse(status_code=400, content={"message": f"Error processing image: {e}"})

@app.post("/upload/video")
async def upload_video(file: UploadFile = File(...)):
    if not file.content_type.startswith("video/"):
        return JSONResponse(status_code=400, content={"message": "File is not a video."})
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename, "message": "Video uploaded successfully."}

@app.websocket("/ws/capture")
async def websocket_capture(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Data is expected to be a base64 image string
            if ',' in data:
                header, encoded = data.split(",", 1)
            else:
                encoded = data
            image_data = base64.b64decode(encoded)
            image = Image.open(io.BytesIO(image_data)).convert('RGB')
            # Convert PIL image to numpy array for OpenCV
            image_cv = np.array(image)
            image_cv = cv2.cvtColor(image_cv, cv2.COLOR_RGB2BGR)
            gray = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
            results = []
            for (x, y, w, h) in faces:
                face_img = image_cv[y:y+h, x:x+w]
                face_img = cv2.resize(face_img, (48, 48))  # Resize to 48x48 as model expects
                face_img = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)  # Convert to grayscale
                face_img = face_img.astype('float32') / 255.0
                face_img = np.expand_dims(face_img, axis=-1)  # Add channel dimension
                face_img = np.expand_dims(face_img, axis=0)  # Add batch dimension
                preds = model.predict(face_img)
                emotion_idx = np.argmax(preds)
                emotion_label = EMOTION_LABELS[emotion_idx]
                confidence = float(preds[0][emotion_idx])
                results.append({
                    "box": {"x": int(x), "y": int(y), "w": int(w), "h": int(h)},
                    "emotion": emotion_label,
                    "confidence": confidence
                })
            await websocket.send_json({"faces": results})
    except WebSocketDisconnect:
        print("Client disconnected")
