export type User = {
    id: string
    email: string
}

export type Session = {
    id: string
    name: string
    architecture: "deeplabv3+" | "unet_attention"
    task: "medical" | "realtime"
    status: "pending" | "running" | "completed" | "failed"
    apiKey?: string
    createdAt: string
}

export type Metric = {
    epoch: number
    loss: number
    accuracy: number
}

export type AgentDecision = {
    message: string
    timestamp: string
}

export type InterventionSample = {
    id: string
    imageUrl: string
    maskUrl: string
    sessionId: string
}

export type WebSocketMessage =
    | { type: "metric"; data: Metric }
    | { type: "agent_decision"; data: { message: string } }
    | { type: "intervention_request"; data: { sampleId: string } }