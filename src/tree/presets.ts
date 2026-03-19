import type { TreeState, TreeNode } from "./types";

import barChart from "../presets/bar_chart.json";
import overTime from "../presets/over_time.json";
import totalOverTime from "../presets/total_over_time.json";
import includeZero from "../presets/include_zero.json";
import lowerScaleLimit from "../presets/lower_scale_limit.json";
import mapType from "../presets/map_type.json";
import severalTotals from "../presets/several_totals.json";
import singleTotal from "../presets/single_total.json";

export type PresetStyle = "color" | "neutral";

export type TreePreset = {
  id:
    | "bar_chart"
    | "over_time"
    | "single_total"
    | "several_totals"
    | "total_over_time"
    | "include_zero"
    | "lower_scale_limit"
    | "map_type";
  name: string;
  locked: boolean;
  style: PresetStyle;
  nodes: TreeState;
};

function asTreeState(raw: unknown, name: string): TreeState {
  if (!raw || typeof raw !== "object") throw new Error(`Invalid preset "${name}": expected object`);

  const result: TreeState = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== "object") throw new Error(`Invalid preset "${name}": node "${key}" not object`);
    const node = value as Partial<TreeNode> & Record<string, unknown>;
    if (typeof node.id !== "string" || node.id !== key) throw new Error(`Invalid preset "${name}": node id mismatch "${key}"`);
    if (node.kind !== "decision" && node.kind !== "outcome") throw new Error(`Invalid preset "${name}": node "${key}" missing kind`);
    if (typeof node.label !== "string") throw new Error(`Invalid preset "${name}": node "${key}" missing label`);
    if (typeof node.x !== "number" || typeof node.y !== "number") throw new Error(`Invalid preset "${name}": node "${key}" missing position`);
    if (typeof node.colorIdx !== "number") throw new Error(`Invalid preset "${name}": node "${key}" missing colorIdx`);
    if (!("yes" in node) || !("no" in node)) throw new Error(`Invalid preset "${name}": node "${key}" missing yes/no`);
    result[key] = node as unknown as TreeNode;
  }

  if (!result.root) throw new Error(`Invalid preset "${name}": missing "root" node`);
  if (!result.start) throw new Error(`Invalid preset "${name}": missing "start" node`);
  return result;
}

export const PRESETS: TreePreset[] = [
  {
    id: "map_type",
    name: "Choosing a map type (locked)",
    locked: true,
    style: "neutral",
    nodes: asTreeState(mapType, "map_type"),
  },
  {
    id: "include_zero",
    name: "Does my scale need zero? (locked)",
    locked: true,
    style: "neutral",
    nodes: asTreeState(includeZero, "include_zero"),
  },
  {
    id: "lower_scale_limit",
    name: "Choose a lower scale limit (locked)",
    locked: true,
    style: "neutral",
    nodes: asTreeState(lowerScaleLimit, "lower_scale_limit"),
  },
  {
    id: "over_time",
    name: "Choosing a chart over time (locked)",
    locked: true,
    style: "neutral",
    nodes: asTreeState(overTime, "over_time"),
  },
  {
    id: "total_over_time",
    name: "Breakdown of a total over time (locked)",
    locked: true,
    style: "neutral",
    nodes: asTreeState(totalOverTime, "total_over_time"),
  },
  {
    id: "several_totals",
    name: "Breakdowns of several totals (locked)",
    locked: true,
    style: "neutral",
    nodes: asTreeState(severalTotals, "several_totals"),
  },
  {
    id: "single_total",
    name: "Breakdown of a single total (locked)",
    locked: true,
    style: "neutral",
    nodes: asTreeState(singleTotal, "single_total"),
  },
  {
    id: "bar_chart",
    name: "When to use a bar chart (locked)",
    locked: true,
    style: "neutral",
    nodes: asTreeState(barChart, "bar_chart"),
  },
];
