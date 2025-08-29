import cv2
import mediapipe as mp
import pandas as pd

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=1)
mp_draw = mp.solutions.drawing_utils

# Define gestures
gestures = ["hello", "bye", "how_are_you", "help_me", "peace"]

# Number of samples per gesture
num_samples = 100

# Data storage
data = []

# Open webcam
cap = cv2.VideoCapture(0)

for gesture in gestures:
    print(f"Perform gesture: {gesture}")
    input("Press Enter to start capturing...")
    
    count = 0
    while count < num_samples:
        ret, frame = cap.read()
        if not ret:
            continue

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = hands.process(frame_rgb)

        if result.multi_hand_landmarks:
            for hand_landmarks in result.multi_hand_landmarks:
                mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                
                # Flatten hand landmarks
                landmarks = []
                for lm in hand_landmarks.landmark:
                    landmarks.extend([lm.x, lm.y, lm.z])
                
                # Append label
                landmarks.append(gesture)
                data.append(landmarks)
                
                count += 1
                print(f"{gesture}: {count}/{num_samples}")

        cv2.imshow("Frame", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

cap.release()
cv2.destroyAllWindows()

# Save to CSV
df = pd.DataFrame(data)
df.to_csv("../data/gesture_dataset.csv", index=False, header=False)
print("Gesture dataset created successfully!")