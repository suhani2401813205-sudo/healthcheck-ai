
let selectedSymptoms = [];
let allSymptoms = [];
 
// Load symptoms from backend
async function loadSymptoms() {
    try {
        const res = await fetch('/symptoms');
        const data = await res.json();
        allSymptoms = data.symptoms;
        renderSymptoms(allSymptoms);
    } catch(err) {
        document.getElementById('symptom-grid').innerHTML =
            '<div class="loading-symptoms"><i class="fa-solid fa-circle-exclamation"></i> Could not load symptoms. Is server running?</div>';
    }
}
 
function renderSymptoms(symptoms) {
    const grid = document.getElementById('symptom-grid');
    if (symptoms.length === 0) {
        grid.innerHTML = '<div class="loading-symptoms">No symptoms found.</div>';
        return;
    }
    grid.innerHTML = symptoms.map(s => `
        <div class="symptom-item ${selectedSymptoms.includes(s) ? 'selected' : ''}"
             onclick="toggleSymptom('${s}')" id="sym-${s}">
            <i class="fa-solid ${selectedSymptoms.includes(s) ? 'fa-check-circle' : 'fa-circle-dot'}"></i>
            <span class="symptom-name">${s.replace(/_/g, ' ')}</span>
        </div>
    `).join('');
}
 
function toggleSymptom(symptom) {
    if (selectedSymptoms.includes(symptom)) {
        selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
    } else {
        selectedSymptoms.push(symptom);
    }
    updateSelectedChips();
    renderSymptoms(getCurrentFilteredSymptoms());
}
 
function removeSymptom(symptom) {
    selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
    updateSelectedChips();
    renderSymptoms(getCurrentFilteredSymptoms());
}
 
function getCurrentFilteredSymptoms() {
    const query = document.getElementById('symptom-search').value.toLowerCase();
    return allSymptoms.filter(s => s.toLowerCase().includes(query));
}
 
function filterSymptoms() {
    renderSymptoms(getCurrentFilteredSymptoms());
}
 
function updateSelectedChips() {
    const wrap = document.getElementById('selected-wrap');
    const chips = document.getElementById('selected-chips');
 
    if (selectedSymptoms.length === 0) {
        wrap.style.display = 'none';
        return;
    }
 
    wrap.style.display = 'block';
    chips.innerHTML = selectedSymptoms.map(s => `
        <div class="chip">
            <i class="fa-solid fa-virus-slash"></i>
            ${s.replace(/_/g, ' ')}
            <button onclick="removeSymptom('${s}')"><i class="fa-solid fa-xmark"></i></button>
        </div>
    `).join('');
}
 
async function predict() {
    if (selectedSymptoms.length === 0) {
        showError('Please select at least one symptom!');
        return;
    }
 
    hideError();
    showLoading(true);
    document.getElementById('result').style.display = 'none';
 
    try {
        const res = await fetch('/predict', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ symptoms: selectedSymptoms })
        });
 
        const data = await res.json();
        showLoading(false);
 
        if (data.error) {
            showError(data.error);
            return;
        }
 
        displayResult(data);
 
    } catch(err) {
        showLoading(false);
        showError('Cannot connect to server — is server running?');
    }
}
 
function displayResult(data) {
    const top = data.top_predictions;
    const precautions = data.precautions || [];
 
    document.getElementById('result').innerHTML = `
        <div class="result-title"><i class="fa-solid fa-microscope"></i> Prediction Result</div>
 
        <div class="prediction-banner">
            <div class="label">Most Likely Condition</div>
            <div class="disease-name">${data.primary_prediction}</div>
            <div class="confidence"><i class="fa-solid fa-chart-bar"></i> Confidence: ${top[0].confidence}%</div>
        </div>
 
        <div class="top3-title"><i class="fa-solid fa-list-ol"></i> Top 3 Predictions</div>
        ${top.map((pred, i) => `
            <div class="prediction-row">
                <div class="pred-label">
                    <span class="pred-name">${i+1}. ${pred.disease}</span>
                    <span class="pred-conf">${pred.confidence}%</span>
                </div>
                <div class="pred-bar">
                    <div class="pred-fill ${i===1?'second':i===2?'third':''}" style="width:${pred.confidence}%"></div>
                </div>
            </div>
        `).join('')}
 
        <div class="section-card">
            <div class="section-card-title"><i class="fa-solid fa-book-medical"></i> About This Condition</div>
            <p>${data.description || 'No description available.'}</p>
        </div>
 
        ${precautions.length > 0 ? `
        <div class="section-card">
            <div class="section-card-title"><i class="fa-solid fa-shield-heart"></i> Precautions to Take</div>
            <ul class="precaution-list">
                ${precautions.map(p => `<li><i class="fa-solid fa-circle-check"></i> ${p}</li>`).join('')}
            </ul>
        </div>` : ''}
 
        <div class="section-card">
            <div class="section-card-title"><i class="fa-solid fa-virus"></i> Symptoms Analyzed</div>
            <p style="display:flex;flex-wrap:wrap;gap:6px;">
                ${(data.used_symptoms || selectedSymptoms).map(s =>
                    `<span class="chip" style="font-size:11px;">${s.replace(/_/g,' ')}</span>`
                ).join('')}
            </p>
        </div>
 
        <div class="doctor-warning">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span><strong>Important:</strong> This is an AI prediction for educational purposes only. Please consult a qualified doctor for proper diagnosis and treatment.</span>
        </div>
    `;
 
    document.getElementById('result').style.display = 'block';
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
}
 
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
    document.getElementById('btn').disabled = show;
    document.getElementById('btn').innerHTML = show
        ? '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...'
        : '<i class="fa-solid fa-wand-magic-sparkles"></i> Analyze Symptoms';
}
 
function showError(msg) {
    const e = document.getElementById('error');
    e.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> ' + msg;
    e.style.display = 'flex';
}
 
function hideError() {
    document.getElementById('error').style.display = 'none';
}
 
// Load symptoms on page load
loadSymptoms();
 
