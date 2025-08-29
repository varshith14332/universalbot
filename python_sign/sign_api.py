from flask import Flask, request, jsonify
import cv2
import numpy as np
import mediapipe as mp
import joblib

app = Flask(__name__)

clf = joblib.load("gesture_model.pkl")
le = joblib.load("label_encoder.pkl")

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=1)
mp_draw = mp.solutions.drawing_utils

@app.route("/predict-sign", methods=["POST"])
def predict_sign():
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image uploaded"}), 400

    npimg = np.frombuffer(file.read(), np.uint8)
    frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(frame_rgb)

    if result.multi_hand_landmarks:
        for hand_landmarks in result.multi_hand_landmarks:
            landmarks = [lm for lm in hand_landmarks.landmark]
            landmarks_flat = [coord for lm in landmarks for coord in [lm.x, lm.y, lm.z]]
            prediction = clf.predict([landmarks_flat])
            gesture = le.inverse_transform(prediction)[0]
            return jsonify({"sign_text": gesture})

    return jsonify({"sign_text": "No gesture detected"})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
