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
import json
import asyncio
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add path for custom layers
sys.path.append(os.path.join(os.getcwd(), "Emotion_det_recommend-master", "Facial-Expression-Prediction-1.0", "custom_layers"))
from scale_layer import Scale

app = FastAPI()

# Load model once on startup with custom object scope
MODEL_PATH = os.path.join(os.getcwd(), "Emotion_det_recommend-master", "Facial-Expression-Prediction-1.0", "emotion_detection_model.h5")
print(f"Attempting to load model from: {MODEL_PATH}")
print(f"Model file exists: {os.path.exists(MODEL_PATH)}")

model = None
face_cascade = None

try:
    with custom_object_scope({'Scale': Scale}):
        model = load_model(MODEL_PATH)
        print(f"Model input shape: {model.input_shape}")
        print(f"Model output shape: {model.output_shape}")
    
    # Load face cascade classifier
    cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    face_cascade = cv2.CascadeClassifier(cascade_path)
    
    if face_cascade.empty():
        logger.error("Failed to load face cascade classifier")
    else:
        logger.info("Successfully loaded face cascade classifier")
        
except Exception as e:
    logger.error(f"Error loading model or cascade: {e}")

# Emotion labels
EMOTION_LABELS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

# Allow CORS for frontend localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # More permissive for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def preprocess_face(face_img):
    """Preprocess face image for emotion prediction"""
    try:
        # Resize to model input size
        face_img = cv2.resize(face_img, (48, 48))
        
        # Convert to grayscale if not already
        if len(face_img.shape) == 3:
            face_img = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
        
        # Normalize pixel values
        face_img = face_img.astype('float32') / 255.0
        
        # Add channel and batch dimensions
        face_img = np.expand_dims(face_img, axis=-1)  # Add channel dimension
        face_img = np.expand_dims(face_img, axis=0)   # Add batch dimension
        
        return face_img
    except Exception as e:
        logger.error(f"Error in preprocessing: {e}")
        return None

def detect_faces_and_emotions(image_cv):
    """Detect faces and predict emotions"""
    if model is None or face_cascade is None:
        logger.error("Model or face cascade not loaded")
        return []
    
    try:
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)
        
        # Detect faces with optimized parameters
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(50, 50),
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        
        results = []
        
        for (x, y, w, h) in faces:
            # Filter out very small faces
            if w < 60 or h < 60:
                continue
            
            # Extract face region with some padding
            padding = 10
            x1 = max(0, x - padding)
            y1 = max(0, y - padding)
            x2 = min(image_cv.shape[1], x + w + padding)
            y2 = min(image_cv.shape[0], y + h + padding)
            
            face_img = image_cv[y1:y2, x1:x2]
            
            # Preprocess face for emotion prediction
            processed_face = preprocess_face(face_img)
            
            if processed_face is not None:
                # Predict emotion
                preds = model.predict(processed_face, verbose=0)
                emotion_idx = np.argmax(preds)
                emotion_label = EMOTION_LABELS[emotion_idx]
                confidence = float(preds[0][emotion_idx])
                
                # Only include predictions with reasonable confidence
                if confidence > 0.3:  # Lowered threshold for better detection
                    results.append({
                        "box": {
                            "x": int(x),
                            "y": int(y),
                            "w": int(w),
                            "h": int(h)
                        },
                        "emotion": emotion_label,
                        "confidence": round(confidence, 3),
                        "all_predictions": {
                            label: round(float(preds[0][i]), 3) 
                            for i, label in enumerate(EMOTION_LABELS)
                        }
                    })
        
        return results
    
    except Exception as e:
        logger.error(f"Error in face detection and emotion prediction: {e}")
        return []

@app.get("/")
async def root():
    return {"message": "Emotion Detection API is running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "face_cascade_loaded": face_cascade is not None and not face_cascade.empty()
    }

@app.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        return JSONResponse(status_code=400, content={"message": "File is not an image."})
    
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"filename": file.filename, "message": "Image uploaded successfully."}
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Failed to upload image: {e}"})

@app.post("/detect_emotion")
async def detect_emotion(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        return JSONResponse(status_code=400, content={"message": "File is not an image."})
    
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    # Save uploaded file temporarily
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Load and process image
        image_cv = cv2.imread(file_location)
        if image_cv is None:
            return JSONResponse(status_code=400, content={"message": "Failed to read image."})
        
        # Detect faces and emotions
        results = detect_faces_and_emotions(image_cv)
        
        # Clean up temporary file
        try:
            os.remove(file_location)
        except:
            pass
        
        return {"faces": results, "total_faces": len(results)}
    
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        return JSONResponse(status_code=500, content={"message": f"Error processing image: {e}"})

@app.post("/upload/video")
async def upload_video(file: UploadFile = File(...)):
    if not file.content_type.startswith("video/"):
        return JSONResponse(status_code=400, content={"message": "File is not a video."})
    
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"filename": file.filename, "message": "Video uploaded successfully."}
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Failed to upload video: {e}"})

@app.websocket("/ws/capture")
async def websocket_capture(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket connection established")
    
    try:
        while True:
            # Receive image data from frontend
            data = await websocket.receive_text()
            
            try:
                # Parse base64 image data
                if ',' in data:
                    header, encoded = data.split(",", 1)
                else:
                    encoded = data
                
                # Decode base64 image
                image_data = base64.b64decode(encoded)
                image = Image.open(io.BytesIO(image_data)).convert('RGB')
                
                # Convert PIL image to OpenCV format
                image_cv = np.array(image)
                image_cv = cv2.cvtColor(image_cv, cv2.COLOR_RGB2BGR)
                
                # Detect faces and emotions
                results = detect_faces_and_emotions(image_cv)
                
                # Send results back to frontend
                response = {
                    "faces": results,
                    "total_faces": len(results),
                    "timestamp": asyncio.get_event_loop().time()
                }
                
                await websocket.send_text(json.dumps(response))
                
            except Exception as e:
                logger.error(f"Error processing frame: {e}")
                error_response = {
                    "error": f"Processing error: {str(e)}",
                    "faces": [],
                    "total_faces": 0
                }
                await websocket.send_text(json.dumps(error_response))
                
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")