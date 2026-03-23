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

export async function getSessions() {
    const res = await fetch(`${BASE_URL}/sessions`, {
        headers: authHeaders(),
    })
    return res.json()
}

export async function createSession(name: string, architecture: string, task: string) {
    const res = await fetch(`${BASE_URL}/sessions`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name, architecture, task }),
    })
    return res.json()
}

export async function getSession(id: string) {
    const res = await fetch(`${BASE_URL}/sessions/${id}`, {
        headers: authHeaders(),
    })
    return res.json()
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