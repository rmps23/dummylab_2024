import { create } from "zustand";

export const regionStore = create(() => ({
  regions: [
    { code: "EUW1", name: "Europe West" },
    { code: "EUN1", name: "Europe Nordic & East" },
    { code: "NA1", name: "North America" },
    { code: "BR1", name: "Brazil" },
    { code: "LA1", name: "Latin America North" },
    { code: "LA2", name: "Latin America South" },
    { code: "TR1", name: "Turkey" },
    { code: "RU", name: "Russia" },
    { code: "KR", name: "Korea" },
    { code: "JP1", name: "Japan" },
    { code: "OC1", name: "Oceania" },
    { code: "PH2", name: "Philippines" },
    { code: "SG2", name: "Singapore" },
    { code: "TH2", name: "Thailand" },
    { code: "TW2", name: "Taiwan" },
    { code: "VN2", name: "Vietnam" },
  ],
}));
