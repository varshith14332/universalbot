import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# Ensure models folder exists
os.makedirs("../models", exist_ok=True)

# Load the dataset
data = pd.read_csv("../data/gesture_dataset.csv", header=None)

# Features and labels
X = data.iloc[:, :-1]  # all columns except last (landmarks)
y = data.iloc[:, -1]   # last column (gesture label)

# Encode labels
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# Split into train and test
X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

# Train a Random Forest Classifier
clf = RandomForestClassifier(n_estimators=200, random_state=42)
clf.fit(X_train, y_train)

# Evaluate accuracy
accuracy = clf.score(X_test, y_test)
print(f"Model Accuracy: {accuracy*100:.2f}%")

# Save the trained model and label encoder
joblib.dump(clf, "../models/gesture_model.pkl")
joblib.dump(le, "../models/label_encoder.pkl")
print("Model and label encoder saved in models/ folder")