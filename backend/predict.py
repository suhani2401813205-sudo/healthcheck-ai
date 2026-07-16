import pickle
import json
import sys
import os
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Model aur encoder load karo
with open(os.path.join(BASE_DIR, 'model', 'disease_model.pkl'), 'rb') as f:
    model = pickle.load(f)

with open(os.path.join(BASE_DIR, 'model', 'symptom_encoder.pkl'), 'rb') as f:
    mlb = pickle.load(f)

# Severity weights load karo
df_severity = pd.read_csv(os.path.join(BASE_DIR, 'model', 'severity.csv'))
df_severity['Symptom'] = df_severity['Symptom'].str.strip().str.lower().str.replace(' ', '_').str.replace('__', '_')

# Precautions load karo
df_precaution = pd.read_csv(os.path.join(BASE_DIR, 'data', 'symptom_precaution.csv'))
df_precaution['Disease'] = df_precaution['Disease'].str.strip()

# Description load karo
df_description = pd.read_csv(os.path.join(BASE_DIR, 'data', 'symptom_Description.csv'))
df_description['Disease'] = df_description['Disease'].str.strip()

# Symptoms from command line
# PowerShell compatibility fix
arg = sys.argv[1]
# Agar single string hai comma separated to split karo
try:
    selected_symptoms = json.loads(arg)
except:
    selected_symptoms = [s.strip() for s in arg.split(',')]

# Encode symptoms
input_encoded = mlb.transform([selected_symptoms])
input_df = pd.DataFrame(input_encoded, columns=mlb.classes_)

# Severity weights apply karo
for symptom in mlb.classes_:
    weight_row = df_severity[df_severity['Symptom'] == symptom]
    if len(weight_row) > 0:
        weight = weight_row['weight'].values[0]
        input_df[symptom] = input_df[symptom] * weight

# Prediction karo
prediction = model.predict(input_df)[0]
probabilities = model.predict_proba(input_df)[0]

# Top 3 predictions
classes = model.classes_
top3_idx = np.argsort(probabilities)[-3:][::-1]
top3 = [
    {
        "disease": classes[i],
        "confidence": round(float(probabilities[i]) * 100, 2)
    }
    for i in top3_idx
]

# Precautions nikalo
precaution_row = df_precaution[df_precaution['Disease'] == prediction]
precautions = []
if len(precaution_row) > 0:
    for col in ['Precaution_1', 'Precaution_2', 'Precaution_3', 'Precaution_4']:
        val = precaution_row[col].values[0]
        if pd.notna(val):
            precautions.append(val.strip())

# Description nikalo
desc_row = df_description[df_description['Disease'] == prediction]
description = ""
if len(desc_row) > 0:
    description = desc_row['Description'].values[0]

result = {
    "primary_prediction": prediction,
    "top_predictions": top3,
    "precautions": precautions,
    "description": description
}

print(json.dumps(result))