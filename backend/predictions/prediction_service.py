import pickle
import numpy as np
import os

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'models')


def load_model():
    with open(os.path.join(MODELS_DIR, 'disease_prediction_model.pkl'), 'rb') as f:
        model = pickle.load(f)
    with open(os.path.join(MODELS_DIR, 'disease_label_encoder.pkl'), 'rb') as f:
        le = pickle.load(f)
    with open(os.path.join(MODELS_DIR, 'feature_names.pkl'), 'rb') as f:
        feature_names = pickle.load(f)
    return model, le, feature_names


def get_feature_importance_explanation(model, features, feature_names, pred_encoded):
    """
    Lightweight alternative to SHAP — uses XGBoost's built-in
    feature importances multiplied by input values.
    No memory allocation issues regardless of class count.
    """
    try:
        # Get global feature importances from the model
        importances = model.feature_importances_  # shape: (n_features,)

        # Weight by whether the symptom is actually present
        feature_array = features[0]  # shape: (n_features,)
        weighted = importances * (feature_array + 0.1)

        # Build explanation dict
        explanation = {
            name: round(float(val), 4)
            for name, val in zip(feature_names, weighted)
        }

        # Top 10 contributing features
        sorted_features = sorted(
            explanation.items(),
            key=lambda x: abs(x[1]),
            reverse=True
        )
        top_features = [
            {
                'symptom': k.replace('_', ' ').title(),
                'impact':  round(v, 4),
            }
            for k, v in sorted_features[:10]
            if v > 0
        ]

        return explanation, top_features

    except Exception as e:
        # Fallback — return empty explanation rather than crash
        return {}, []


def predict_disease(input_data: dict):
    model, le, feature_names = load_model()

    # Build feature vector — all features default to 0
    features = np.array([[
        float(input_data.get(f, 0)) for f in feature_names
    ]])

    # ── Predict ───────────────────────────────────────────────────────
    pred_encoded  = model.predict(features)[0]
    pred_proba    = model.predict_proba(features)[0]
    predicted_disease = le.inverse_transform([pred_encoded])[0]
    confidence        = float(pred_proba[pred_encoded])

    # ── Top 5 most likely diseases ────────────────────────────────────
    top5_idx = np.argsort(pred_proba)[::-1][:5]
    top5_diseases = {
        le.inverse_transform([i])[0]: round(float(pred_proba[i]), 4)
        for i in top5_idx
    }

    # ── Lightweight feature importance explanation ────────────────────
    shap_explanation, top_features = get_feature_importance_explanation(
        model, features, feature_names, pred_encoded
    )

    return {
        'predicted_disease':  predicted_disease,
        'confidence_score':   confidence,
        'top_5_diseases':     top5_diseases,
        'shap_values':        shap_explanation,
        'top_features':       top_features,
    }