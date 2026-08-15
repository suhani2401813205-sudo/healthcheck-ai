# 🏥 HealthCheck AI

An end-to-end AI-powered disease symptom checker built with 
Machine Learning, deployed as a full-stack web application.

🔗 **Live Demo:** https://healthcheck-ai-kxs2.onrender.com

---

## Overview

HealthCheck AI is a clinical decision support system that analyzes 
user-reported symptoms and predicts the top 3 most likely diseases 
using a trained Logistic Regression model. The system provides 
disease descriptions, evidence-based precautions, and confidence 
scores — with a prominent disclaimer that this is for educational 
purposes only.

---

## Features

- 🔍 Search across 131 symptoms with instant filtering
- 📂 Symptoms organized by 9 body system categories
  (Respiratory, Neurological, Digestive, Skin, Urinary, Eyes, Pain, Fever, General)
- 🧠 Top-3 differential diagnosis with confidence percentages
- 📖 Disease etiology description per prediction
- 🛡️ Evidence-based precautionary recommendations
- 📊 Severity-weighted symptom analysis
- 🌓 Dark / Light theme with localStorage persistence
- 📱 Fully responsive — desktop + mobile
- ⚠️ Medical disclaimer on every prediction

---

## Tech Stack

| Layer | Technology |
|---|---|
| ML Engine | Python, Pandas, Scikit-learn |
| Algorithm | Logistic Regression (Multi-class) |
| Encoding | MultiLabelBinarizer |
| Backend | Node.js, Express.js |
| IPC Bridge | child_process.spawn() |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Deployment | Render.com |
| Dataset | Kaggle — Disease Symptom Prediction |

---

## ML Architecture

### Dataset
- **Source:** Kaggle — Disease Symptom Prediction Dataset
- **Records:** 4,920 training samples
- **Diseases:** 41 unique disease classes
- **Symptoms:** 131 unique clinical symptoms (Symptom_1 to Symptom_17)
- **Supporting files:** symptom_severity.csv, symptom_Description.csv, symptom_precaution.csv

### Feature Engineering

**MultiLabelBinarizer Encoding:**
Unlike standard One-Hot Encoding (which assumes single-category membership), 
MultiLabelBinarizer handles the reality that patients present with 
multiple simultaneous symptoms. Each row is encoded as a binary vector 
of 131 dimensions.

**Severity Weighting:**
Domain-informed feature engineering where high-acuity symptoms receive 
proportionally higher influence:
chest_pain → weight: 7 (high acuity)
coma → weight: 7 (high acuity)
skin_rash → weight: 3 (moderate)
itching → weight: 1 (low acuity)

### Model

```python
from sklearn.linear_model import LogisticRegression
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)
```

- **Algorithm:** Logistic Regression (multinomial)
- **Accuracy:** 100% on synthetic dataset
- **Why 100%?** The dataset is synthetically generated with 
  non-overlapping symptom clusters per disease. Real clinical 
  data introduces noise, comorbidity overlap, and missing values — 
  which would significantly reduce accuracy. This is documented 
  as a known limitation.
- **Output:** predict_proba() across all 41 classes — 
  probabilistic ranked inference

### Why Logistic Regression?

- **Explainability over black-box performance** — in medical AI, 
  understanding why a prediction was made is more important than 
  squeezing out marginal accuracy gains from a neural network
- **Top-3 predictions** — many diseases share overlapping symptom 
  profiles; returning only 1 prediction would be clinically irresponsible

---

## System Architecture
User selects symptoms (Frontend)
↓
JSON: {symptoms: ["fever", "cough", "chills"]}
↓
Node.js + Express (REST API — server.js)
↓
child_process.spawn() → Python subprocess
↓
predict.py:

Load disease_model.pkl + symptom_encoder.pkl
Encode symptoms via MultiLabelBinarizer
Apply severity weights from severity.csv
model.predict_proba() → ranked probabilities
Fetch description from symptom_Description.csv
Fetch precautions from symptom_precaution.csv
↓
JSON response → Frontend renders result

---

## Project Structure

```
healthcheck-ai/
├── backend/
│   ├── server.js
│   ├── predict.py
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── data/
│   ├── disease_symptoms.csv
│   ├── symptom_Description.csv
│   ├── symptom_precaution.csv
│   └── Symptom-severity.csv
├── model/
│   ├── disease_model.pkl
│   ├── symptom_encoder.pkl
│   ├── severity.csv
│   └── symptoms_list.json
└── notebooks/
    └── explore.ipynb
```


---

## Running Locally

```bash
# Clone repo
git clone https://github.com/suhani2401813205-sudo/healthcheck-ai.git
cd healthcheck-ai

# Install Node dependencies
cd backend
npm install

# Install Python dependencies
pip install -r requirements.txt

# Start server
node server.js
```

Visit `http://localhost:3000`

---

## Key Engineering Decisions

| Decision | Reasoning |
|---|---|
| MultiLabelBinarizer over OneHotEncoder | Patients present multiple symptoms simultaneously — OHE assumes mutual exclusivity |
| Logistic Regression over Neural Network | Interpretability over black-box accuracy — critical in medical AI |
| Top-3 predictions over Top-1 | Differential diagnosis — many diseases share symptom profiles |
| Severity weighting | Not all symptoms carry equal clinical significance |
| Document 100% accuracy as limitation | Intellectual honesty > impressive-looking metrics |

---

## Limitations

- Dataset is synthetically generated — real clinical data would 
  introduce noise, comorbidity, and significantly lower accuracy
- 131 symptoms cover common conditions only — rare diseases excluded
- No patient history, age, gender, or vitals considered
- Model cannot account for symptom duration or severity progression
- Not validated by medical professionals

---

## Future Enhancements

- Patient profile integration (age, gender, medical history)
- Symptom duration and severity slider inputs
- SHAP values for explainable AI — why each symptom influenced the prediction
- Multi-language support (Hindi, Marathi)
- Integration with real clinical datasets (MIMIC-III)
- Report download as PDF

---

## Disclaimer

⚠️ **HealthCheck AI is strictly for educational and research purposes.**
It does not constitute medical advice, diagnosis, or treatment.
Always consult a qualified healthcare professional for proper 
clinical evaluation and treatment decisions.

---

## Author

**Suhani** — 3rd Year BE Computer Engineering, VCET Vasai, Maharashtra

[![GitHub](https://img.shields.io/badge/GitHub-suhani2401813205--sudo-black?logo=github)](https://github.com/suhani2401813205-sudo)