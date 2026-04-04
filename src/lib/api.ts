const BASE_URL = import.meta.env.VITE_API_BASE_URL

function getToken() {
    if (typeof window === "undefined") return null
    return localStorage.getItem("token")
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    }
}

export async function register(email: string, password: string) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    })
    return res.json()
}

export async function login(email: string, password: string) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    })
    return res.json()
}

export async function confirmEmail(email: string, code: string) {
    const res = await fetch(`${BASE_URL}/auth/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
    })
    return res.json()
}

export async function resendCode(email: string) {
    const res = await fetch(`${BASE_URL}/auth/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    })
    return res.json()
}

export async function getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: authHeaders(),
    })
    return res.json()
}

export async function getSessions() {
    const res = await fetch(`${BASE_URL}/sessions`, {
        headers: authHeaders(),
    })
    return res.json()
}

export async function createSession(name: string, architecture: string, task: string, classes?: string) {
    const res = await fetch(`${BASE_URL}/sessions`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name, architecture, task, classes: classes || null }),
    })
    return res.json()
}

export async function getSession(id: string) {
    const res = await fetch(`${BASE_URL}/sessions/${id}`, {
        headers: authHeaders(),
    })
    return res.json()
}

export async function deleteSession(id: string) {
    const res = await fetch(`${BASE_URL}/sessions/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    })
    if (!res.ok) throw new Error("Failed to delete session")
}

export async function generateApiKey(sessionId: string) {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}/apikey`, {
        method: "POST",
        headers: authHeaders(),
    })
    return res.json()
}

export async function getInterventionSamples(sessionId: string) {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}/intervention`, {
        headers: authHeaders(),
    })
    return res.json()
}

export async function submitIntervention(
    sessionId: string,
    sampleId: string,
    decision: "approve" | "reject"
) {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}/intervention/${sampleId}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ decision }),
    })
    return res.json()
}

export async function updateSessionStatus(sessionId: string, status: string) {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}/status?status=${status}`, {
        method: "PATCH",
        headers: authHeaders(),
    })
    return res.json()
}

// export async function uploadDataset(sessionId: string, files: FileList) {
//     const formData = new FormData()
//     Array.from(files).forEach(file => formData.append("files", file))
//     const res = await fetch(`${BASE_URL}/sessions/${sessionId}/upload`, {
//         method: "POST",
//         headers: {
//             Authorization: `Bearer ${getToken()}`,
//         },
//         body: formData,
//     })
//     return res.json()
// }

export async function uploadDataset(sessionId: string, imageCount: number) {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}/upload?image_count=${imageCount}`, {
        method: "POST",
        headers: authHeaders(),
    })
    return res.json()
}

export async function getPresignedUrls(sessionId: string, files: { name: string; type: string }[]) {
    const res = await fetch(`${BASE_URL}/sessions/presigned-urls`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
            session_id: sessionId,
            filenames: files.map(f => f.name),
            content_types: files.map(f => f.type || "application/octet-stream"),
        }),
    })
    return res.json()
}

export async function uploadFileToS3(url: string, file: File) {
    const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
    })
    if (!res.ok) throw new Error(`S3 upload failed for ${file.name}: ${res.status}`)
}

export async function downloadModel(sessionId: string) {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}/model/download`, {
        headers: authHeaders(),
    })
    if (!res.ok) throw new Error("Model not ready")
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pentagon_model_${sessionId}.pt`
    a.click()
    window.URL.revokeObjectURL(url)
}

export async function suggestHyperparameters(imageCount: number, classes: string[]) {
    const res = await fetch(`${BASE_URL}/sessions/suggest-hyperparameters`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
            image_count: imageCount,
            image_size: 256,
            classes: classes,
        }),
    })
    return res.json()
}

const INFERENCE_ENDPOINT = "http://3.110.37.205:8000/segment-dataset"
const TRAINING_ENDPOINT = "http://3.110.37.205:8000/train"

export async function startInferencing(payload: { keys: string[]; modelType: string; userId: string; sessionId: string }) {
    const res = await fetch(INFERENCE_ENDPOINT, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    })
    return res.json()
}

export async function startTraining(payload: {
    image_keys: string[];
    label_keys: string[];
    val_split: number;
    num_epochs: number;
    batch_size: number;
    lr: number;
    momentum: number;
    weight_decay: number;
    aux_loss_weight: number;
    callback_url: string;
}) {
    const res = await fetch(TRAINING_ENDPOINT, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    })
    return res.json()
}

export async function createJob(sessionId: string, jobType: "training" | "inferencing") {
    const res = await fetch(`${BASE_URL}/jobs`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ session_id: sessionId, job_type: jobType }),
    })
    return res.json()
}

export async function getJob(jobId: string) {
    const res = await fetch(`${BASE_URL}/jobs/${jobId}`, {
        headers: authHeaders(),
    })
    return res.json()
}

export async function getLatestMetric(jobId: string) {
    const res = await fetch(`${BASE_URL}/jobs/${jobId}/metrics/latest`, {
        headers: authHeaders(),
    })
    return res.json()
}

// ── AgentCore Training API ──

export async function bootstrapSession(sessionId: string, params: Record<string, any>) {
    const res = await fetch(`${BASE_URL}/sessions/bootstrap`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ session_id: sessionId, current_params: params }),
    })
    return res.json()
}

export async function getEpochMetrics(sessionId: string, runId?: string) {
    const params = runId ? `?run_id=${runId}` : ""
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}/metrics${params}`, {
        headers: authHeaders(),
    })
    return res.json()
}

export async function updateAgentStatus(sessionId: string, status: string, stopReason?: string) {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}/agent-status`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status, stop_reason: stopReason }),
    })
    return res.json()
}

export async function getCurrentRun(sessionId: string) {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}/current-run`, {
        headers: authHeaders(),
    })
    return res.json()
}

export async function getOrchestratorLog(sessionId: string) {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}/orchestrator-log`, {
        headers: authHeaders(),
    })
    return res.json()
}

export async function getTrainingReport(sessionId: string) {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}/training-report`, {
        headers: authHeaders(),
    })
    return res.json()
}

export async function getSessionProposals(sessionId: string) {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}/hyperparameter-proposals`, {
        headers: authHeaders(),
    })
    return res.json()
}

export async function reviewProposal(sessionId: string, proposalId: string, body: { status: string; final_params?: Record<string, any>; rejection_reason?: string; reviewer_suggestion?: string; decided_by?: string }) {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}/hyperparameter-proposals/${proposalId}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(body),
    })
    return res.json()
}