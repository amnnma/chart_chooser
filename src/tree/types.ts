export type NodeKind = "decision" | "outcome";
export type BranchKind = "yes" | "no";

export type TreeNode = {
  id: string;
  label: string;
  kind: NodeKind;
  x: number;
  y: number;
  yes: string | null;
  no: string | null;
  colorIdx: number;
  isRoot?: boolean;
  variant?: "start" | "chart";
};

export type TreeState = Record<string, TreeNode>;
