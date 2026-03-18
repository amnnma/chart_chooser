# Decision Tree Builder (Vite + React + Tailwind)

Interactive decision tree visualization focused on binary (Yes/No) decisions:

- Click any node to open the edit panel on the right
- Drag nodes to rearrange the layout
- Edit question/label and switch between **Decision** (diamond) and **Outcome** (pill) types
- Add branches from any decision node (Yes = solid line, No = dashed line)
- Delete any non-root node from the edit panel
- Use **+ New node** to add a free-floating node

## Run

```bash
npm install
npm run dev
```

## Notes

- Branching is restricted to at most one Yes and one No branch per decision node.
- Each newly created node gets its own color (rotating palette) to help visually trace paths.
# chart_chooser
