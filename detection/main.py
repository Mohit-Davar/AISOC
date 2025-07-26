from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
from src.processing import process_frame

app = Flask(__name__)
CORS(app)

@app.route("/process", methods=["POST"])
def process():
    data = request.get_json()
    if not data or "frame" not in data:
        return jsonify({"error": "Missing 'frame' in request"}), 400

    try:
        img_bytes = base64.b64decode(data["frame"])
        frame = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
        if frame is None:
            return jsonify({"error": "Invalid image data"}), 400

        annotated, is_violation, info = process_frame(frame)
        resized_frame = cv2.resize(annotated, (720, 480))
        _, buffer = cv2.imencode(".jpg", resized_frame)
        encoded = base64.b64encode(buffer).decode("utf-8")

        return jsonify({
            "annotated_frame": encoded,
            "violation": is_violation,
            "violation_labels": info,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
