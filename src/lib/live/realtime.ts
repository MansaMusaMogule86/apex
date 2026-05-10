import type { LiveDomain } from "@/stores/live-intelligence-store";

export function recommendationChannel(organizationId: string, workspaceId?: string) {
  if (workspaceId) {
    return `org:${organizationId}:ws:${workspaceId}:recommendations`;
  }
  return `org:${organizationId}:recommendations`;
}

export function alertChannel(organizationId: string) {
  return `org:${organizationId}:alerts`;
}

export function domainSignalChannel(
  organizationId: string,
  domain: LiveDomain,
  workspaceId?: string,
) {
  if (workspaceId) {
    return `org:${organizationId}:ws:${workspaceId}:domain:${domain}:signals`;
  }
  return `org:${organizationId}:domain:${domain}:signals`;
}

export function executiveSyncChannel(organizationId: string, workspaceId?: string) {
  if (workspaceId) {
    return `org:${organizationId}:ws:${workspaceId}:executive-sync`;
  }
  return `org:${organizationId}:executive-sync`;
}

export function presenceChannel(organizationId: string, workspaceId: string) {
  return `org:${organizationId}:ws:${workspaceId}:presence`;
}

export function broadcastChannel(organizationId: string, workspaceId?: string) {
  if (workspaceId) {
    return `org:${organizationId}:ws:${workspaceId}:broadcast`;
  }
  return `org:${organizationId}:broadcast`;
}

export function sseEncode(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function heartbeatPayload() {
  return {
    ts: new Date().toISOString(),
    type: "heartbeat",
  };
}
