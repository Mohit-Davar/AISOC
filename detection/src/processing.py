import cv2
from ultralytics import YOLO
from datetime import datetime
from . import config

model = YOLO(config.MODEL_PATH)
last_logged = {}

def should_log(label):
    last = last_logged.get(label)
    return not last or (datetime.now() - last).total_seconds() > config.COOLDOWN

def draw_box(frame, bbox, label, conf, is_violation):
    x1, y1, x2, y2 = map(int, bbox)
    color = config.COLOR_VIOLATION if is_violation else config.COLOR_NORMAL
    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
    text = f"{label} ({conf:.2f})"
    (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
    cv2.rectangle(frame, (x1, y1 - th - 10), (x1 + tw, y1), color, -1)
    cv2.putText(frame, text, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

def draw_overlay(frame, count):
    overlay = frame.copy()
    cv2.rectangle(overlay, (10, 10), (200, 50), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.3, frame, 0.7, 0, frame)
    cv2.putText(frame, f"People: {count}", (15, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

def process_frame(frame):
    results = model.predict(source=frame, conf=config.CONFIDENCE, stream=True, verbose=False)
    total_people = 0
    violation_detected = False
    violation_info = []

    for result in results:
        boxes = result.boxes
        if boxes is None:
            continue

        for box, conf, cls in zip(boxes.xyxy, boxes.conf, boxes.cls):
            label = result.names[int(cls)]
            bbox = box.tolist()
            is_person = "person" in label.lower()
            is_violation = "no" in label.lower()

            if is_person:
                total_people += 1

            draw_box(frame, bbox, label, conf, is_violation)

            if is_violation:
                if should_log(label):
                    violation_detected = True
                    last_logged[label] = datetime.now()
                violation_info.append(label)

    draw_overlay(frame, total_people)
    return frame, violation_detected, violation_info