export const COLORS = ["#7F77DD", "#1D9E75", "#D85A30", "#D4537E", "#378ADD", "#639922", "#BA7517", "#E24B4A"] as const;
export const LIGHT_COLORS = ["#EEEDFE", "#E1F5EE", "#FAECE7", "#FBEAF0", "#E6F1FB", "#EAF3DE", "#FAEEDA", "#FCEBEB"] as const;
export const DARK_TEXT = ["#3C3489", "#085041", "#712B13", "#72243E", "#0C447C", "#27500A", "#633806", "#791F1F"] as const;

export function paletteIndex(colorIdx: number) {
  const len = COLORS.length;
  return ((colorIdx % len) + len) % len;
}

