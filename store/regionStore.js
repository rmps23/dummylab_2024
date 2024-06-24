import { create } from "zustand";

export const regionStore = create((set) => ({
  regions: [
    { code: "EUW1", name: "Europe West", zone: "EUROPE" },
    { code: "NA1", name: "North America", zone: "AMERICAS" },
    { code: "KR", name: "Korea", zone: "ASIA" },
    { code: "EUN1", name: "Europe Nordic & East", zone: "EUROPE" },
    { code: "BR1", name: "Brazil", zone: "AMERICAS" },
    { code: "JP1", name: "Japan", zone: "ASIA" },
    { code: "LA1", name: "Latin America North", zone: "AMERICAS" },
    { code: "LA2", name: "Latin America South", zone: "AMERICAS" },
    { code: "OC1", name: "Oceania", zone: "AMERICAS" },
    { code: "RU", name: "Russia", zone: "EUROPE" },
    { code: "TR1", name: "Turkey", zone: "EUROPE" },
    { code: "PH2", name: "Philippines", zone: "ASIA" },
    { code: "SG2", name: "Singapore", zone: "ASIA" },
    { code: "TH2", name: "Thailand", zone: "ASIA" },
    { code: "TW2", name: "Taiwan", zone: "ASIA" },
    { code: "VN2", name: "Vietnam", zone: "ASIA" },
  ],
}));
