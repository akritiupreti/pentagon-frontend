export type User = {
  id: string;
  email: string;
};

export type Session = {
  id: string;
  name: string;
  architecture: "deeplabv3+" | "unet_attention";
  task: "medical" | "realtime";
  status: "pending" | "running" | "completed" | "failed";
  classes?: string;
  apiKey?: string;
  createdAt: string;
};

export type Metric = {
  epoch: number;
  loss: number;
  accuracy: number;
};

export type AgentDecision = {
  message: string;
  timestamp: string;
};

export type InterventionSample = {
  id: string;
  imageUrl: string;
  maskUrl: string;
  sessionId: string;
};

export type WebSocketMessage =
  | { type: "metric"; data: Metric }
  | { type: "agent_decision"; data: { message: string } }
  | { type: "intervention_request"; data: { sampleId: string } };

export interface ImageState {
  data: number[][]; // annotation grid in IMAGE-native pixels
  imgW: number; // native image width
  imgH: number; // native image height
  zoom: number;
  panX: number;
  panY: number;
}

export interface ViewTransform {
  zoom: number; // scale factor (1 = 100 %)
  panX: number; // canvas-space offset X
  panY: number; // canvas-space offset Y
}
