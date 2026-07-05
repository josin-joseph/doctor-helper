import numpy as np
import pandas as pd
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
import xgboost as xgb

#Paths 
DATASET_PATH = os.path.join(
    os.path.dirname(__file__),
    'Final_Augmented_dataset_Diseases_and_Symptoms.csv'
)
MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

print("Loading dataset...")
df = pd.read_csv(DATASET_PATH)
print(f"Dataset shape: {df.shape}")
print(f"Unique diseases: {df['diseases'].nunique()}")

#  Clean column names 
df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_').str.replace(
    r'[^a-z0-9_]', '', regex=True
)
print("Columns cleaned.")

# Features and target
X = df.drop('diseases', axis=1)
y = df['diseases']


feature_names = list(X.columns)
print(f"Total features: {len(feature_names)}")

print("Filtering rare disease classes...")
from collections import Counter
class_counts = Counter(y)
valid_classes = {cls for cls, count in class_counts.items() if count >= 2}
mask = np.array([y_val in valid_classes for y_val in y])
X = X[mask]
y = y[mask]
print(f"Rows after filtering: {len(X)}")
print(f"Valid disease classes: {len(valid_classes)}")

le = LabelEncoder()
y_encoded = le.fit_transform(y)
print(f"Total classes after encoding: {len(le.classes_)}")
# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)
print(f"Train size: {len(X_train)}, Test size: {len(X_test)}")
#Train XGBoost 
print("\nTraining XGBoost model... (this may take a few minutes)")
model = xgb.XGBClassifier(
    n_estimators=200,
    max_depth=8,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    use_label_encoder=False,
    eval_metric='mlogloss',
    random_state=42,
    n_jobs=-1,
    tree_method='hist',
)
model.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)],
    verbose=50,
)

#  Evaluate 
score = model.score(X_test, y_test)
print(f"\nModel accuracy: {score:.4f} ({score*100:.2f}%)")

#  Save everything 
print("\nSaving model files...")

with open(os.path.join(MODELS_DIR, 'disease_prediction_model.pkl'), 'wb') as f:
    pickle.dump(model, f)

with open(os.path.join(MODELS_DIR, 'disease_label_encoder.pkl'), 'wb') as f:
    pickle.dump(le, f)

with open(os.path.join(MODELS_DIR, 'feature_names.pkl'), 'wb') as f:
    pickle.dump(feature_names, f)

print("All model files saved to models/ folder!")
print(f"Diseases covered: {len(le.classes_)}")
print(f"Symptoms tracked: {len(feature_names)}")
print("\nDone!")