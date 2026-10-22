/** Each treatment is named after a season; its dot uses that season's colour. */
const SEASON_COLOURS: Record<string, string> = {
    haru: "var(--haru)",
    natsu: "var(--natsu)",
    aki: "var(--aki)",
    fuyu: "var(--fuyu)",
    shiki: "var(--shiki)",
};

const SEASON_NAMES: Record<string, string> = {
    haru: "Spring",
    natsu: "Summer",
    aki: "Autumn",
    fuyu: "Winter",
    shiki: "Four seasons",
};

export const seasonColour = (name: string) => SEASON_COLOURS[name.toLowerCase()] ?? "var(--accent)";
export const seasonName = (name: string) => SEASON_NAMES[name.toLowerCase()] ?? null;
