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

// --- Theme Management ---
const savedTheme = localStorage.getItem('hc_theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme');
    const nxt = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nxt);
    localStorage.setItem('hc_theme', nxt);
    const icon = document.getElementById('theme-icon');
    if (icon) icon.className = nxt === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

// --- Navigation Tab Switching ---
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    const activeTab = document.getElementById(`tab-${tabName}`);
    if (activeTab) activeTab.classList.add('active');

    const clickedNav = Array.from(document.querySelectorAll('.nav-item')).find(el => el.getAttribute('onclick')?.includes(tabName));
    if (clickedNav) clickedNav.classList.add('active');

    if (tabName === 'categories') {
        renderCatGridTab();
    }
}

// --- Data Fetching & Dynamic Setup ---
async function loadSymptoms() {
    try {
        const res = await fetch('/symptoms');
        const data = await res.json();
        allSymptoms = Array.isArray(data) ? data : (data.symptoms || []);
    } catch(e) {
        console.warn('Backend /symptoms unavailable. Falling back to local category data.', e);
        allSymptoms = CATEGORIES.flatMap(c => c.symptoms);
    } finally {
        populateCatDropdown();
        renderCatSymptoms();
    }
}

function populateCatDropdown() {
    const select = document.getElementById('cat-select');
    if (!select) return;

    select.innerHTML = '<option value="all">All Categories</option>' + 
        CATEGORIES.map((cat, i) => `<option value="${i}">${cat.name}</option>`).join('');
    
    select.value = 'all';
}

function renderCatSymptoms() {
    const container = document.getElementById('sym-list');
    const catVal = document.getElementById('cat-select')?.value;
    if (!container) return;

    let categoriesToRender = CATEGORIES;

    if (catVal && catVal !== 'all') {
        const index = parseInt(catVal, 10);
        if (!isNaN(index) && CATEGORIES[index]) {
            categoriesToRender = [CATEGORIES[index]];
        }
    }

    container.innerHTML = categoriesToRender.map((cat, i) => {
        const valid = cat.symptoms.filter(s => allSymptoms.length === 0 || allSymptoms.includes(s));
        if (!valid.length) return '';

      return `
<div class="cat-group open" id="cg-${i}">
    <div class="cat-header" onclick="toggleCat('${i}')">
        <i class="fa-solid ${cat.icon} cat-icon" style="color:${cat.color}"></i>
        <span class="cat-label">${cat.name}</span>
        <span class="cat-count" style="color:${cat.color}">${valid.length}</span>
        <i class="fa-solid fa-chevron-down cat-arrow"></i>
    </div>
    <div class="cat-body">
        ${valid.map(s => `
        <div class="sym-item ${selectedSymptoms.includes(s) ? 'active' : ''}"
             data-sym="${s}" data-cat="${cat.id || i}"
             onclick="toggleSymptom('${s}')"
             style="${selectedSymptoms.includes(s) ? `border-left: 2px solid ${cat.color}` : ''}">
            <i class="fa-solid ${selectedSymptoms.includes(s) ? 'fa-square-check' : 'fa-square'} sym-check"
               style="color:${cat.color}"></i>
            <span>${s.replace(/_/g, ' ')}</span>
        </div>`).join('')}
    </div>
</div>`;
    }).join('');
}

function symItem(s, extraClass = '') {
    const active = selectedSymptoms.includes(s);
    return `<div class="sym-item ${active ? 'active' : ''} ${extraClass}" 
                 data-sym="${s}" onclick="toggleSymptom('${s}')">
        <i class="fa-solid ${active ? 'fa-square-check' : 'fa-square'} sym-check"></i>
        <span>${s.replace(/_/g, ' ')}</span>
    </div>`;
}

function toggleCat(i) {
    const group = document.getElementById(`cg-${i}`);
    if (group) group.classList.toggle('open');
}

// --- Symptom Selection Logic ---
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
    const resultContent = document.getElementById('result-content');
    const resultEmpty = document.getElementById('result-empty');
    if (resultContent) resultContent.style.display = 'none';
    if (resultEmpty) resultEmpty.style.display = 'flex';
}

function updateUI() {
    // 1. Update Count Badge
    const badge = document.getElementById('count-badge');
    if (badge) badge.textContent = selectedSymptoms.length;

    // 2. Render Selected Chips in Column 2
    const chipsContainer = document.getElementById('selected-chips');
    if (chipsContainer) {
        if (selectedSymptoms.length === 0) {
            chipsContainer.innerHTML = `<div class="empty-chips"><i class="fa-solid fa-hand-pointer"></i><br>Select symptoms from the left panel</div>`;
        } else {
           chipsContainer.innerHTML = selectedSymptoms.map(s => `
    <div class="chip-item">
        <i class="fa-solid fa-circle-check chip-icon"></i>
        <span>${s.replace(/_/g,' ')}</span>
        <button class="chip-remove" onclick="removeSymptom('${s}')">
            <i class="fa-solid fa-xmark"></i>
        </button>
    </div>`).join('');
        }
    }

    // 3. Update Checkbox Icons across the page
    document.querySelectorAll('.sym-item').forEach(el => {
        const s = el.getAttribute('data-sym');
        const active = selectedSymptoms.includes(s);
        el.classList.toggle('active', active);
        const checkIcon = el.querySelector('.sym-check');
        if (checkIcon) {
            checkIcon.className = `fa-solid ${active ? 'fa-square-check' : 'fa-square'} sym-check`;
        }
    });
}

// --- Search Filter Logic ---
function filterSymptoms() {
    const q = document.getElementById('symptom-search')?.value.toLowerCase().trim() || '';
    const searchDiv = document.getElementById('search-results');
    const symList = document.getElementById('sym-list');
    const catSelectWrap = document.querySelector('.cat-dropdown-wrap');
    const clearBtn = document.getElementById('clear-search');

    if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';

    if (!q) {
        if (searchDiv) searchDiv.style.display = 'none';
        if (symList) symList.style.display = 'block';
        if (catSelectWrap) catSelectWrap.style.display = 'block';
        return;
    }

    const sourceList = allSymptoms.length > 0 ? allSymptoms : CATEGORIES.flatMap(c => c.symptoms);
    const filtered = sourceList.filter(s => s.includes(q) || s.replace(/_/g,' ').includes(q));

    if (symList) symList.style.display = 'none';
    if (catSelectWrap) catSelectWrap.style.display = 'none';
    if (searchDiv) searchDiv.style.display = 'block';

    if (searchDiv) {
        if (!filtered.length) {
            searchDiv.innerHTML = '<p style="padding:12px;font-size:12px;color:var(--text-faint);">No symptoms found.</p>';
        } else {
            searchDiv.innerHTML = filtered.map(s => symItem(s)).join('');
        }
    }
}

function clearSearch() {
    const input = document.getElementById('symptom-search');
    if (input) input.value = '';
    filterSymptoms();
}

// --- Categories Tab Grid View ---
function renderCatGridTab() {
    const grid = document.getElementById('cat-grid-tab');
    if (!grid) return;

    grid.innerHTML = CATEGORIES.map((cat) => `
        <div class="cat-grid-card">
            <div class="cat-grid-header">
                <i class="fa-solid ${cat.icon}" style="color:${cat.color}"></i>
                <h3>${cat.name}</h3>
            </div>
            <div class="cat-grid-symptoms">
                ${cat.symptoms.map(s => `
                    <span class="chip ${selectedSymptoms.includes(s) ? 'active' : ''}" onclick="toggleSymptom('${s}')">
                        ${s.replace(/_/g, ' ')}
                    </span>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// --- Predict API Call ---
// --- Predict API Call ---
async function predict() {
    if (!selectedSymptoms.length) {
        showError('Please select at least one symptom.');
        return;
    }
    hideError();
    showLoading(true);

    try {
        const res = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptoms: selectedSymptoms })
        });
        const data = await res.json();
        showLoading(false);
        
        if (data.error) { 
            showError(data.error); 
            return; 
        }
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

    const resultContent = document.getElementById('result-content');
    const resultEmpty = document.getElementById('result-empty');
    
    if (resultEmpty) resultEmpty.style.display = 'none';

    if (resultContent) {
        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateString = new Date().toLocaleDateString();

        resultContent.innerHTML = `
            <!-- ACTION / EXPORT BAR -->
            <div class="results-action-bar">
                <div class="result-timestamp">
                    <i class="fa-regular fa-clock"></i> Generated on: ${dateString} at ${timeString}
                </div>
                <button class="btn-export" onclick="window.print()">
                    <i class="fa-solid fa-file-pdf"></i> Export / Print Report
                </button>
            </div>

            <!-- PRIMARY DIAGNOSIS CARD -->
            <div class="primary-card">
                <div class="primary-card-header">
                    <span class="label"><i class="fa-solid fa-stethoscope"></i> &nbsp;Primary Diagnosis</span>
                    <span class="confidence-badge">${top[0]?.confidence ?? '—'}% confidence</span>
                </div>
                <div class="primary-card-body">
                    <div class="disease-name">${data.primary_prediction || 'Unknown'}</div>
                    <div class="description-text">${data.description || 'No description available.'}</div>
                </div>
            </div>

            <!-- TOP 3 & PRECAUTIONS ROW -->
            <div class="cards-row">
                <div class="info-card">
                    <div class="info-card-title"><i class="fa-solid fa-list-ol"></i> Top 3 Conditions</div>
                    ${top.map((p, i) => `
                        <div class="pred-item">
                            <div class="pred-row">
                                <span class="pred-name">${i + 1}. ${p.disease}</span>
                                <span class="pred-pct">${p.confidence}%</span>
                            </div>
                            <div class="pred-bar">
                                <div class="pred-fill fill-${i + 1}" style="width:${Math.min(p.confidence, 100)}%"></div>
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

            <!-- SYMPTOMS ANALYZED -->
            <div class="info-card">
                <div class="info-card-title"><i class="fa-solid fa-virus"></i> Symptoms Analyzed</div>
                <div class="symptom-tags">
                    ${used.map(s => `<span class="sym-tag">${s.replace(/_/g, ' ')}</span>`).join('')}
                </div>
            </div>
        `;

        resultContent.style.display = 'block';
    }
}

function showLoading(show) {
    const loading = document.getElementById('result-loading');
    const empty = document.getElementById('result-empty');
    const content = document.getElementById('result-content');

    if (loading) loading.style.display = show ? 'flex' : 'none';
    if (empty) empty.style.display = show ? 'none' : (selectedSymptoms.length ? 'none' : 'flex');
    if (content && show) content.style.display = 'none';
}

function showError(msg) {
    const e = document.getElementById('result-error');
    if (e) {
        e.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${msg}`;
        e.style.display = 'flex';
    }
}

function hideError() {
    const e = document.getElementById('result-error');
    if (e) e.style.display = 'none';
}

// Initial Launch
document.addEventListener('DOMContentLoaded', loadSymptoms);