import sys
import json
import pickle
import os
import numpy as np
import warnings
import pandas as pd

warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

with open(os.path.join(BASE_DIR, 'model', 'disease_model.pkl'), 'rb') as f:
    model = pickle.load(f)

with open(os.path.join(BASE_DIR, 'model', 'symptom_encoder.pkl'), 'rb') as f:
    mlb = pickle.load(f)

# Severity load karo
df_severity = pd.read_csv(os.path.join(BASE_DIR, 'model', 'severity.csv'))
df_severity['Symptom'] = df_severity['Symptom'].str.strip().str.lower().str.replace(' ','_').str.replace('__','_')

desc_df = pd.read_csv(os.path.join(BASE_DIR, 'data', 'symptom_Description.csv'))
prec_df = pd.read_csv(os.path.join(BASE_DIR, 'data', 'symptom_precaution.csv'))
desc_df['Disease'] = desc_df['Disease'].str.strip()
prec_df['Disease'] = prec_df['Disease'].str.strip()

desc_dict = dict(zip(desc_df['Disease'], desc_df['Description']))
prec_dict = {}
for _, row in prec_df.iterrows():
    precs = [str(row[c]).strip() for c in ['Precaution_1','Precaution_2','Precaution_3','Precaution_4'] if pd.notna(row[c])]
    prec_dict[row['Disease']] = precs

def parse_input(user_input):
    try:
        data = json.loads(user_input)
        if isinstance(data, list):
            return [s.strip().lower().replace(' ','_') for s in data]
    except:
        pass
    return [s.strip().lower().replace(' ','_') for s in user_input.split(',')]

def predict(symptoms):
    valid_symptoms = [s for s in symptoms if s in mlb.classes_]
    if not valid_symptoms:
        return {"error": "No valid symptoms found. Please check symptom names."}

    input_vector = mlb.transform([valid_symptoms])
    input_df = pd.DataFrame(input_vector, columns=mlb.classes_)

    # Severity weights apply karo
    for symptom in mlb.classes_:
        weight_row = df_severity[df_severity['Symptom'] == symptom]
        if len(weight_row) > 0:
            weight = weight_row['weight'].values[0]
            input_df[symptom] = input_df[symptom] * weight

    probs = model.predict_proba(input_df)[0]
    classes = model.classes_

    top_indices = np.argsort(probs)[-3:][::-1]
    top_predictions = [
        {"disease": classes[i], "confidence": round(float(probs[i]*100), 2)}
        for i in top_indices
    ]
    primary = top_predictions[0]['disease']

    return {
        "primary_prediction": primary,
        "top_predictions": top_predictions,
        "description": desc_dict.get(primary, "No description available."),
        "precautions": prec_dict.get(primary, []),
        "used_symptoms": valid_symptoms
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No symptoms provided"}))
        sys.exit()
    symptoms = parse_input(sys.argv[1])
    result = predict(symptoms)
    print(json.dumps(result))