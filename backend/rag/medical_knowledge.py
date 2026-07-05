import os

KNOWLEDGE_DIR = os.path.join(os.path.dirname(__file__), 'medical_knowledge')


def load_medical_documents():
    documents = []

    if not os.path.exists(KNOWLEDGE_DIR):
        print(f'WARNING: Folder not found: {KNOWLEDGE_DIR}')
        return documents

    txt_files = [f for f in os.listdir(KNOWLEDGE_DIR) if f.endswith('.txt')]
    print(f'Found {len(txt_files)} .txt files in knowledge folder.')

    for filename in sorted(txt_files):
        filepath = os.path.join(KNOWLEDGE_DIR, filename)
        disease_name = filename.replace('.txt', '').replace('_', ' ')

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read().strip()
            if content:
                documents.append({
                    'id': filename.replace('.txt', ''),
                    'title': disease_name.title(),
                    'content': content,
                })
        except Exception as e:
            print(f'Could not read {filename}: {e}')

    print(f'Loaded {len(documents)} medical documents.')
    return documents


MEDICAL_DOCUMENTS = load_medical_documents()
