/**
 * Demo auth: token format is operator_id:plant_id:role (e.g. op1:default_plant:supervisor).
 * In production this would come from a real login / session.
 */
const DEMO_TOKEN = "op1:default_plant:supervisor";

export function getAuthToken(): string {
  return DEMO_TOKEN;
}

export function getAuthHeaders(): HeadersInit {
  return { Authorization: `Bearer ${DEMO_TOKEN}` };
}

export type CurrentUser = {
  operator_id: string;
  plant_id: string;
  role: string;
};

export function getCurrentUser(): CurrentUser {
  const token = getAuthToken();
  const parts = token.split(":");
  const operator_id = parts[0]?.trim() || "operator";
  const plant_id = parts[1]?.trim() || "plant";
  const role = (parts[2]?.trim() || "operator").toLowerCase();
  return { operator_id, plant_id, role };
}

/** Display name for header: e.g. "op1" or "Operator 1" */
export function getDisplayName(): string {
  const { operator_id } = getCurrentUser();
  if (operator_id.startsWith("op")) return `Operator ${operator_id.replace("op", "")}`;
  return operator_id;
}

/** Initials for avatar: e.g. "O1" for op1 */
export function getInitials(): string {
  const { operator_id } = getCurrentUser();
  if (operator_id.startsWith("op")) return `O${operator_id.replace("op", "")}`;
  return operator_id.slice(0, 2).toUpperCase();
}
