export const BASIC_GARDEN_MAINTENANCE_ERROR = "BASIC_GARDEN_MAINTENANCE";
export const BASIC_GARDEN_MAINTENANCE_MESSAGE = "Garden updates are temporarily unavailable.";
const basicGardenWritesPausedEnvironmentKey = ["BASIC", "GARDEN", "WRITES", "PAUSED"].join("_");

export function isBasicGardenWritesPaused() {
  const value = Reflect.get(process.env, basicGardenWritesPausedEnvironmentKey);

  return typeof value === "string" && value.trim().toLowerCase() === "true";
}

export function getBasicGardenMaintenanceHeaders() {
  return {
    "Retry-After": "120",
    "Cache-Control": "no-store"
  };
}
