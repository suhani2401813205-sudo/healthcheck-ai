// HealthCheck AI — app.js

let selectedSymptoms = [];
let allSymptoms = [];

const CATEGORIES = [
    { name: "Fever & Infection", icon: "fa-thermometer-half", color: "#DC2626",
      symptoms: ["fever","chills","sweating","high_fever","mild_fever","shivering","continuous_fever","fatigue","malaise","toxic_look_typhos"] },
    { name: "Respiratory", icon: "fa-lungs", color: "#2563EB",
      symptoms: ["cough","breathlessness","wheezing","mucoid_sputum","rusty_sputum","blood_in_sputum","phlegm","throat_irritation","runny_nose","congestion"] },
    { name: "Pain & Discomfort", icon: "fa-face-grimace", color: "#7C3AED",
      symptoms: ["headache","chest_pain","back_pain","abdominal_pain","belly_pain","joint_pain","knee_pain","hip_joint_pain","neck_pain","muscle_pain","muscle_weakness","painful_walking","pain_during_bowel_movements","pain_in_anal_region"] },
    { name: "Skin & Hair", icon: "fa-hand-dots", color: "#059669",
      symptoms: ["itching","skin_rash","nodal_skin_eruptions","dischromic_patches","blackheads","blister","bruising","brittle_nails","inflammatory_nails","skin_peeling","pus_filled_pimples","silver_like_dusting","red_sore_around_nose","yellow_crust_ooze","scurring","small_dents_in_nails"] },
    { name: "Digestive", icon: "fa-utensils", color: "#D97706",
      symptoms: ["nausea","vomiting","diarrhoea","constipation","acidity","stomach_pain","stomach_bleeding","passage_of_gases","indigestion","loss_of_appetite","distention_of_abdomen","swelling_of_stomach","bloody_stool","ulcers_on_tongue"] },
    { name: "Eyes & Vision", icon: "fa-eye", color: "#0284C7",
      symptoms: ["yellowing_of_eyes","redness_of_eyes","blurred_and_distorted_vision","watering_from_eyes","sunken_eyes","visual_disturbances"] },
    { name: "Neurological", icon: "fa-brain", color: "#7C3AED",
      symptoms: ["dizziness","altered_sensorium","loss_of_balance","lack_of_concentration","slurred_speech","spinning_movements","unsteadiness","weakness_of_one_body_side","loss_of_smell","coma","depression","anxiety","mood_swings","irritability","restlessness","lethargy"] },
    { name: "Urinary & Kidney", icon: "fa-droplet", color: "#0891B2",
      symptoms: ["burning_micturition","spotting_urination","yellow_urine","dark_urine","frequent_urination","bladder_discomfort","continuous_feel_of_urine","foul_smell_of_urine"] },
    { name: "General", icon: "fa-circle-dot", color: "#6B7280",
      symptoms: ["weight_loss","weight_gain","obesity","swollen_lymph_nodes","swelling_joints","stiff_neck","swollen_legs","swollen_blood_vessels","puffy_face_and_eyes","enlarged_thyroid","excessive_hunger","increased_appetite","polyuria","dehydration","muscle_wasting","history_of_alcohol_consumption","fluid_overload","family_history","receiving_blood_transfusion","receiving_unsterile_injections"] }
];

// Theme
const saved = localStorage.getItem('hc_theme') || 'light';
document.documentElement.setAttribute('data-theme', saved);
document.getElementById('theme-icon').className = saved === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';

function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme');
    const nxt = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nxt);
    localStorage.setItem('hc_theme', nxt);
    document.getElementById('theme-icon').className = nxt === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

// Load symptoms
async function loadSymptoms() {
    try {
        const res = await fetch('/symptoms');
        const data = await res.json();
        allSymptoms = data.symptoms;
        renderCategories();
    } catch(e) {
        document.getElementById('category-list').innerHTML =
            '<p style="padding:16px;font-size:12px;color:var(--text-faint);">Could not load symptoms. Is server running?</p>';
    }
}

function renderCategories() {
    const list = document.getElementById('category-list');
    list.innerHTML = CATEGORIES.map((cat, i) => {
        const valid = cat.symptoms.filter(s => allSymptoms.includes(s));
        if (!valid.length) return '';
        return `
        <div class="cat-group open" id="cg-${i}">
            <div class="cat-header" onclick="toggleCat(${i})">
                <i class="fa-solid ${cat.icon} cat-icon" style="color:${cat.color}"></i>
                <span class="cat-label">${cat.name}</span>
                <i class="fa-solid fa-chevron-down cat-arrow"></i>
            </div>
            <div class="cat-body">
                ${valid.map(s => symItem(s)).join('')}
            </div>
        </div>`;
    }).join('');
}

function symItem(s, extraClass = '') {
    const active = selectedSymptoms.includes(s);
    return `<div class="sym-item ${active ? 'active' : ''} ${extraClass}" 
                 data-sym="${s}" onclick="toggleSymptom('${s}')">
        <i class="fa-solid ${active ? 'fa-square-check' : 'fa-square'} sym-check"></i>
        ${s.replace(/_/g, ' ')}
    </div>`;
}

function toggleCat(i) {
    document.getElementById(`cg-${i}`).classList.toggle('open');
}

function toggleSymptom(s) {
    if (selectedSymptoms.includes(s)) {
        selectedSymptoms = selectedSymptoms.filter(x => x !== s);
    } else {
        selectedSymptoms.push(s);
    }
    updateUI();
}

function removeSymptom(s) {
    selectedSymptoms = selectedSymptoms.filter(x => x !== s);
    updateUI();
}

function clearAll() {
    selectedSymptoms = [];
    updateUI();
    document.getElementById('result').style.display = 'none';
    document.getElementById('empty-state').style.display = 'flex';
}

function updateUI() {
    // Count badge
    document.getElementById('selected-count').textContent =
        selectedSymptoms.length + ' selected';

    // Tags bar
    const tagsBar = document.getElementById('tags-bar');
    const tagsWrap = document.getElementById('tags-wrap');
    if (selectedSymptoms.length === 0) {
        tagsBar.style.display = 'none';
    } else {
        tagsBar.style.display = 'flex';
        tagsWrap.innerHTML = selectedSymptoms.map(s => `
            <div class="tag">
                ${s.replace(/_/g,' ')}
                <button onclick="removeSymptom('${s}')">×</button>
            </div>`).join('');
    }

    // Refresh sym-item states in sidebar
    document.querySelectorAll('.sym-item').forEach(el => {
        const s = el.getAttribute('data-sym');
        const active = selectedSymptoms.includes(s);
        el.classList.toggle('active', active);
        el.querySelector('.sym-check').className =
            `fa-solid ${active ? 'fa-square-check' : 'fa-square'} sym-check`;
    });
}

function filterSymptoms() {
    const q = document.getElementById('symptom-search').value.toLowerCase().trim();
    const searchDiv = document.getElementById('search-results');
    const catList = document.getElementById('category-list');
    const clearBtn = document.getElementById('clear-search');

    clearBtn.style.display = q ? 'flex' : 'none';

    if (!q) {
        searchDiv.style.display = 'none';
        catList.style.display = 'block';
        return;
    }

    const filtered = allSymptoms.filter(s => s.includes(q) || s.replace(/_/g,' ').includes(q));
    catList.style.display = 'none';
    searchDiv.style.display = 'block';

    if (!filtered.length) {
        searchDiv.innerHTML = '<p style="padding:12px;font-size:12px;color:var(--text-faint);">No symptoms found.</p>';
        return;
    }
    searchDiv.innerHTML = filtered.map(s => symItem(s)).join('');
}

function clearSearch() {
    document.getElementById('symptom-search').value = '';
    filterSymptoms();
}

async function predict() {
    if (!selectedSymptoms.length) {
        showError('Please select at least one symptom.');
        return;
    }
    hideError();
    showLoading(true);
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('result').style.display = 'none';

    try {
        const res = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptoms: selectedSymptoms })
        });
        const data = await res.json();
        showLoading(false);
        if (data.error) { showError(data.error); return; }
        displayResult(data);
    } catch(e) {
        showLoading(false);
        showError('Cannot connect to server — make sure server is running.');
    }
}

function displayResult(data) {
    const top = data.top_predictions || [];
    const prec = data.precautions || [];
    const used = data.used_symptoms || selectedSymptoms;
    const fills = ['fill-1','fill-2','fill-3'];

    document.getElementById('result').innerHTML = `
        <div class="primary-card">
            <div class="primary-card-header">
                <span class="label"><i class="fa-solid fa-stethoscope"></i> &nbsp;Primary Diagnosis</span>
                <span class="confidence-badge">${top[0]?.confidence ?? '—'}% confidence</span>
            </div>
            <div class="primary-card-body">
                <div class="disease-name">${data.primary_prediction}</div>
                <div class="description-text">${data.description || 'No description available.'}</div>
            </div>
        </div>

        <div class="cards-row">
            <div class="info-card">
                <div class="info-card-title"><i class="fa-solid fa-list-ol"></i> Top 3 Conditions</div>
                ${top.map((p,i) => `
                    <div class="pred-item">
                        <div class="pred-row">
                            <span class="pred-name">${i+1}. ${p.disease}</span>
                            <span class="pred-pct">${p.confidence}%</span>
                        </div>
                        <div class="pred-bar">
                            <div class="pred-fill ${fills[i]}" style="width:${Math.min(p.confidence,100)}%"></div>
                        </div>
                    </div>`).join('')}
            </div>

            <div class="info-card">
                <div class="info-card-title"><i class="fa-solid fa-shield-heart"></i> Precautions</div>
                ${prec.length ? prec.map(p => `
                    <div class="precaution-item">
                        <i class="fa-solid fa-circle-check"></i>
                        <span>${p}</span>
                    </div>`).join('') : '<p style="font-size:12px;color:var(--text-faint);">No precautions found.</p>'}
            </div>
        </div>

        <div class="info-card">
            <div class="info-card-title"><i class="fa-solid fa-virus"></i> Symptoms Analyzed</div>
            <div class="symptom-tags">
                ${used.map(s => `<span class="sym-tag">${s.replace(/_/g,' ')}</span>`).join('')}
            </div>
        </div>

        <div class="result-disclaimer">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span><strong>Disclaimer:</strong> This AI analysis is for educational purposes only and must not be used as a medical diagnosis. Always consult a qualified healthcare professional for proper evaluation and treatment.</span>
        </div>
    `;

    document.getElementById('result').style.display = 'flex';
    document.getElementById('content-panel')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
    document.getElementById('btn').disabled = show;
    document.getElementById('btn').innerHTML = show
        ? '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...'
        : '<i class="fa-solid fa-flask"></i> Run Analysis';
}

function showError(msg) {
    const e = document.getElementById('error');
    e.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${msg}`;
    e.style.display = 'flex';
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}

loadSymptoms();