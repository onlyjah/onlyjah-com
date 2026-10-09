import type { PublicSnapshot } from './model'
// Optional small public graph. The main index stays usable before this chunk
// loads. This is bounded to 100 nodes; a large graph needs a measured layout/
// worker strategy rather than silently drawing an unlimited force simulation.
export default function GraphView({ snapshot }: { snapshot: PublicSnapshot }) {
  const nodes = snapshot.projects.slice(0, 100)
  const positions = new Map(
    nodes.map((node, index) => [
      node.id,
      { x: 105 + (index % 3) * 210, y: 70 + Math.floor(index / 3) * 140 },
    ]),
  )
  const edges = snapshot.relationships.filter(
    (e) => positions.has(e.source) && positions.has(e.target),
  )
  return (
    <div className="space-y-4">
      <div className="overflow-auto rounded-xl border bg-card p-3">
        <svg
          role="img"
          aria-labelledby="constellation-graph-title"
          viewBox={`0 0 630 ${Math.max(1, Math.ceil(nodes.length / 3)) * 140}`}
          className="min-w-[560px] w-full text-foreground"
        >
          <title id="constellation-graph-title">
            Published project relationships
          </title>
          {edges.map((edge) => {
            const a = positions.get(edge.source)
            const b = positions.get(edge.target)
            if (!a || !b) return null
            return (
              <line
                key={`${edge.source}:${edge.target}:${edge.type}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className="stroke-primary/40"
                strokeWidth="2"
              />
            )
          })}
          {nodes.map((node) => {
            const p = positions.get(node.id)
            if (!p) return null
            return (
              <a
                key={node.id}
                href={`/realm/constellation/${node.id}`}
                aria-label={node.name}
              >
                <rect
                  x={p.x - 88}
                  y={p.y - 30}
                  width="176"
                  height="60"
                  rx="16"
                  className="fill-card stroke-primary"
                />
                <text
                  x={p.x}
                  y={p.y + 5}
                  textAnchor="middle"
                  className="fill-foreground text-sm"
                >
                  {node.name}
                </text>
              </a>
            )
          })}
        </svg>
      </div>
      <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        {edges.map((edge) => (
          <li key={`${edge.source}:${edge.target}:${edge.type}`}>
            {edge.source} · {edge.type} · {edge.target}
          </li>
        ))}
      </ul>
    </div>
  )
}
