import cv2
import mediapipe as mp
import joblib
import time

# Load trained model and label encoder
clf = joblib.load("../models/gesture_model.pkl")
le = joblib.load("../models/label_encoder.pkl")

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=1)
mp_draw = mp.solutions.drawing_utils

# Open webcam
cap = cv2.VideoCapture(0)

print("Camera is on. Please position your hand... Detection will start in 3 seconds.")
start_time = time.time()
detected = False

while True:
    ret, frame = cap.read()
    if not ret:
        continue

    # Show the webcam feed immediately
    cv2.imshow("Gesture Recognition", frame)

    # Wait 3 seconds before starting detection
    if not detected and (time.time() - start_time) >= 3:
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = hands.process(frame_rgb)

        if result.multi_hand_landmarks:
            for hand_landmarks in result.multi_hand_landmarks:
                # Flatten landmarks
                landmarks = []
                for lm in hand_landmarks.landmark:
                    landmarks.extend([lm.x, lm.y, lm.z])

                # Predict gesture
                prediction = clf.predict([landmarks])
                gesture = le.inverse_transform(prediction)[0]

                print(f"Detected Gesture: {gesture}")
                detected = True
                break

    # Exit if gesture detected or user presses 'q'
    if detected or (cv2.waitKey(1) & 0xFF == ord('q')):
        break

cap.release()
cv2.destroyAllWindows()