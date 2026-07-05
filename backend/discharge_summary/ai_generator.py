import requests
import os

OLLAMA_URL = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')


def generate_ai_narrative(summary_data: dict) -> str:
    """Use Llama 3 to generate a professional hospital course narrative."""

    prompt = f"""You are a medical documentation specialist. Write a professional 
hospital course narrative for a discharge summary based on the following information.
Write in clear clinical language, past tense, 3-5 sentences only.

Patient: {summary_data.get('patient_name', 'Patient')}
Age/Gender: {summary_data.get('age', '')} / {summary_data.get('gender', '')}
Diagnosis: {summary_data.get('diagnosis', '')}
Chief Complaints: {summary_data.get('chief_complaints', '')}
Hospital Course: {summary_data.get('hospital_course', '')}
Treatment Given: {summary_data.get('treatment_given', '')}
Procedures: {summary_data.get('procedures_performed', '')}
Condition at Discharge: {summary_data.get('condition_at_discharge', '')}
Duration of Stay: {summary_data.get('stay_duration', '')} days

Write a concise, professional hospital course narrative paragraph:"""

    try:
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                'model': 'llama3',
                'prompt': prompt,
                'stream': False,
                'options': {
                    'temperature': 0.2,
                    'num_predict': 300,
                }
            },
            timeout=120
        )
        if response.status_code == 200:
            return response.json().get('response', '').strip()
        return summary_data.get('hospital_course', '')
    except Exception:
        return summary_data.get('hospital_course', '')