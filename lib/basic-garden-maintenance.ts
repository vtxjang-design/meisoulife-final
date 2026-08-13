export const BASIC_GARDEN_MAINTENANCE_ERROR = "BASIC_GARDEN_MAINTENANCE";
export const BASIC_GARDEN_MAINTENANCE_MESSAGE = "Garden updates are temporarily unavailable.";

export function isBasicGardenWritesPaused() {
  return process.env.BASIC_GARDEN_WRITES_PAUSED === "true";
}

export function getBasicGardenMaintenanceHeaders() {
  return {
    "Retry-After": "120",
    "Cache-Control": "no-store"
  };
}
