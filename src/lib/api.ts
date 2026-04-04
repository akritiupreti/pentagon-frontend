const BASE_URL = "http://localhost:8000"

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