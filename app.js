// Replace with the exact base URL from the Coalition API docs:
const API_BASE = "https://fedskillstest.coalitiontechnologies.workers.dev";
const PATIENTS_URL = `${API_BASE}/patients`;

async function getPatients() {
  const res = await fetch(PATIENTS_URL);
  if (!res.ok) throw new Error("API fetch failed");
  return res.json();
}

function findJessica(patients) {
  return patients.find(
    (p) =>
      p.first_name.toLowerCase() === "jessica" &&
      p.last_name.toLowerCase() === "taylor"
  );
}

function setPatientInfo(p) {
  document.getElementById("name").textContent = `${p.first_name} ${p.last_name}`;
  document.getElementById("meta").textContent = `${p.gender}, ${p.age} years • ${p.date_of_birth}`;
  document.getElementById("notes").textContent = p.notes || "No notes available";
  document.getElementById("contact").textContent = `${p.phone_number || "N/A"} • ${p.email || "N/A"}`;
}

function setVitals(p) {
  const list = document.getElementById("vitals-list");
  list.innerHTML = "";
  const vitals = p.diagnosis_history?.slice(-5) || [];
  vitals.forEach((v) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${v.blood_pressure.systolic}/${v.blood_pressure.diastolic} mmHg</strong> — ${v.date}`;
    list.appendChild(li);
  });
}

function drawChart(p) {
  const ctx = document.getElementById("bpChart").getContext("2d");
  const labels = p.diagnosis_history.map((v) => v.date);
  const systolic = p.diagnosis_history.map((v) => v.blood_pressure.systolic);
  const diastolic = p.diagnosis_history.map((v) => v.blood_pressure.diastolic);

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Systolic",
          data: systolic,
          borderWidth: 2,
          borderColor: "#3b82f6",
          tension: 0.3,
        },
        {
          label: "Diastolic",
          data: diastolic,
          borderWidth: 2,
          borderColor: "#a855f7",
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "top" } },
      scales: {
        y: { beginAtZero: false },
      },
    },
  });
}

async function init() {
  try {
    const data = await getPatients();
    const jessica = findJessica(data);
    if (!jessica) throw new Error("Jessica Taylor not found");
    setPatientInfo(jessica);
    setVitals(jessica);
    drawChart(jessica);
  } catch (err) {
    console.error(err);
    document.getElementById("meta").textContent = "Error loading patient data";
  }
}

init();
