import cv2
import base64
import socketio
import time

sio = socketio.Client()
sio.connect("http://localhost:3000")

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break
    _, buffer = cv2.imencode('.jpg', frame)
    b64_frame = base64.b64encode(buffer).decode("utf-8")

    sio.emit("feed", {"id": 6, "frame": b64_frame})
    time.sleep(0.1)