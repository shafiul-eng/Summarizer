/**
 * js/app.js
 * Front-end logic — API key is NOT present here.
 * All requests go to /api/summarize on our own server.
 */

// ─── DOM References ────────────────────────────────────────────────────────────
const textInput       = document.getElementById("textInput");
const imageInput      = document.getElementById("imageInput");
const fileNameDisplay = document.getElementById("fileNameDisplay");
const summarizeBtn    = document.getElementById("summarizeBtn");
const spinner         = document.getElementById("spinner");
const btnText         = document.getElementById("btnText");
const outputContainer = document.getElementById("outputContainer");
const summaryOutput   = document.getElementById("summaryOutput");

// ─── File picker label update ──────────────────────────────────────────────────
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (file) {
    fileNameDisplay.textContent = file.name;
    fileNameDisplay.classList.add("has-file");
  } else {
    fileNameDisplay.textContent = "No file chosen";
    fileNameDisplay.classList.remove("has-file");
  }
});

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload  = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });
}

function setLoading(isLoading) {
  summarizeBtn.disabled = isLoading;
  spinner.classList.toggle("visible", isLoading);
  btnText.textContent = isLoading ? "Processing…" : "Summarize Now";
}

function showOutput(html, isError = false) {
  summaryOutput.innerHTML = isError
    ? `<span class="text-error">${html}</span>`
    : html;
  outputContainer.classList.add("visible");
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function generateSummary() {
  const text      = textInput.value.trim();
  const imageFile = imageInput.files[0];

  if (!text && !imageFile) {
    alert("Please enter some text or upload an image to summarize.");
    return;
  }

  setLoading(true);
  outputContainer.classList.remove("visible");
  summaryOutput.innerHTML = "";

  try {
    const body = {};
    if (text) body.text = text;
    if (imageFile) body.imageBase64 = await fileToBase64(imageFile);

    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unknown server error.");
    }

    showOutput(data.summary);
  } catch (err) {
    console.error("[app] Error:", err);
    showOutput(`Error: ${err.message}`, true);
  } finally {
    setLoading(false);
  }
}

// ─── Event Listeners ───────────────────────────────────────────────────────────
summarizeBtn.addEventListener("click", generateSummary);

// Allow Ctrl+Enter / Cmd+Enter in the textarea to submit
textInput.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    generateSummary();
  }
});
