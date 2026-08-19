export const serviceAreas = [
  { name: "Darke County", gridArea: "darke", availability: "confirm" },
  { name: "Miami County", gridArea: "miami", availability: "confirm" },
  { name: "Champaign County", gridArea: "champaign", availability: "confirm" },
  { name: "Preble County", gridArea: "preble", availability: "confirm" },
  { name: "Montgomery County", gridArea: "montgomery", primary: true, detail: "Dayton", availability: "primary" },
  { name: "Clark County", gridArea: "clark", availability: "confirm" },
  { name: "Butler County", gridArea: "butler", availability: "confirm" },
  { name: "Warren County", gridArea: "warren", availability: "confirm" },
  { name: "Greene County", gridArea: "greene", availability: "confirm" },
];

export const serviceAreaContent = {
  verifiedStatement: "Montgomery County and surrounding areas",
  primaryArea: "Montgomery County",
  locationConfirmation: "Availability outside Montgomery County depends on the exact address, requested schedule and current caregiver coverage. Please call before relying on the map.",
  verifiedCities: [],
};
