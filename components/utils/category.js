// Normaliser eldre lagrede verdier til nye enum-koder
export const normCategory = (v) => {
  const map = {
    Severdighet: "sight",
    Restaurant: "restaurant",
    Utflukt: "excursion",
    Transport: "transport",
    Annet: "other",
  };
  return map[v] || v; // hvis allerede kode, behold den
};

// Returner visningstekst basert på t-oversettelser
export const categoryLabel = (v, t) => {
  switch (normCategory(v)) {
    case "sight":
      return t.sight;
    case "restaurant":
      return t.restaurant;
    case "excursion":
      return t.excursion;
    case "transport":
      return t.transport;
    case "other":
      return t.other;
    default:
      return v || "";
  }
};
