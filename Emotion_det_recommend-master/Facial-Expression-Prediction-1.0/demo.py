# import the necessary packages
import os
import cv2 as cv
import numpy as np
import argparse
import tensorflow as tf
from utils import load_emotion_model
from utils import apply_offsets
from utils import draw_bounding_box
from utils import draw_text
from utils import get_color
from utils import draw_str


def rect_to_bb(rect):
    x, y, w, h = rect
    return x, y, w, h


if __name__ == '__main__':
    # Configure TensorFlow to dynamically grow GPU memory as needed
    gpus = tf.config.experimental.list_physical_devices('GPU')
    if gpus:
        try:
            for gpu in gpus:
                tf.config.experimental.set_memory_growth(gpu, True)
            print("TensorFlow GPU memory growth enabled")
        except RuntimeError as e:
            print(f"Error setting TensorFlow GPU memory growth: {e}")

    ap = argparse.ArgumentParser()
    ap.add_argument("-v", "--video", help="path to the video file")
    args = vars(ap.parse_args())

    video = args["video"]
    if video is None:
        video = 0  # Use webcam if no video file is provided

    img_width, img_height = 224, 224
    num_channels = 3
    num_classes = 7

    class_names = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(script_dir, 'model.best.hdf5')
        emotion_model = load_emotion_model(model_path)
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")
        exit(1)

    face_cascade = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_default.xml')

    cap = cv.VideoCapture(video)
    if not cap.isOpened():
        print("Error: Could not open video source.")
        exit(1)
    else:
        print("Video source opened successfully.")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break
        else:
            print("Frame grabbed successfully.")

        gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)

        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        print(f"Detected {len(faces)} faces.")

        for (x, y, w, h) in faces:
            x1, x2, y1, y2 = apply_offsets((x, y, w, h), (20, 40))

            # Clamp coordinates to image size
            x1 = max(x1, 0)
            y1 = max(y1, 0)
            x2 = min(x2, gray.shape[1])
            y2 = min(y2, gray.shape[0])

            gray_face = gray[y1:y2, x1:x2]
            if gray_face.size == 0:
                print("Empty face region, skipping.")
                continue
            gray_face = cv.resize(gray_face, (img_height, img_width))
            gray_face = cv.cvtColor(gray_face, cv.COLOR_GRAY2RGB)
            gray_face = np.expand_dims(gray_face, 0)
            try:
                preds = emotion_model.predict(gray_face)
            except Exception as e:
                print(f"Error during prediction: {e}")
                continue
            prob = np.max(preds)
            class_id = np.argmax(preds)
            emotion = class_names[class_id]

            color = get_color(emotion, prob)
            draw_bounding_box(image=frame, coordinates=(x1, y1, x2 - x1, y2 - y1), color=color)
            draw_text(image=frame, coordinates=(x1, y1, x2 - x1, y2 - y1), color=color, text=emotion)
            draw_str(frame, (x1, y1 - 10), f'{emotion}: {prob:.2f}')

        cv.imshow("Frame", frame)

        key = cv.waitKey(1)
        if key == ord('q'):
            print("Quitting demo.")
            break

    cap.release()
    cv.destroyAllWindows()
