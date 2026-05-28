import { useMemo } from "react";

interface RadarChartProps {
  scores: Record<string, number>;
}

export default function RadarChart({ scores }: RadarChartProps) {
  const size = 420;
  const center = size / 2;
  const maxRadius = 140;

  // Map individual physical test scores (0-10) to the 8 axes from Page 2
  const axes = useMemo(() => {
    const s_flex = scores["flexibilidad"] || 0;
    const s_cooper = scores["cooper"] || 0;
    const s_balon = scores["lanzamiento_balon"] || 0;
    const s_flexiones = scores["flexiones"] || 0;
    const s_abd = scores["abdominales"] || 0;
    const s_vel = scores["velocidad"] || 0;

    // Averages for combined axes
    const s_sentadillas = scores["sentadillas"] || 0;
    const s_burpees = scores["burpees"] || 0;
    const s_sent_burp = (s_sentadillas + s_burpees) / 2;

    const s_vertical = scores["salto_vertical"] || 0;
    const s_horizontal = scores["salto_horizontal"] || 0;
    const s_saltos = (s_vertical + s_horizontal) / 2;

    return [
      { name: "Flexibilidad", score: s_flex, angle: -Math.PI / 2, labelOffset: { x: 0, y: -16 } },
      { name: "Test de Cooper", score: s_cooper, angle: -Math.PI / 4, labelOffset: { x: 45, y: -10 } },
      { name: "Lanzamiento de balón", score: s_balon, angle: 0, labelOffset: { x: 74, y: 0 } },
      { name: "Flexiones", score: s_flexiones, angle: Math.PI / 4, labelOffset: { x: 45, y: 14 } },
      { name: "Abdominales", score: s_abd, angle: Math.PI / 2, labelOffset: { x: 0, y: 22 } },
      { name: "Sentadillas y Burpees", score: s_sent_burp, angle: (3 * Math.PI) / 4, labelOffset: { x: -65, y: 14 } },
      { name: "Velocidad", score: s_vel, angle: Math.PI, labelOffset: { x: -62, y: 0 } },
      { name: "Salto horiz. y vert.", score: s_saltos, angle: (-3 * Math.PI) / 4, labelOffset: { x: -65, y: -10 } }
    ];
  }, [scores]);

  // Generate grid lines representing score zones (2, 4, 6, 8, 10)
  const gridRings = [2, 4, 6, 8, 10];

  const gridPolygons = gridRings.map((val) => {
    const r = (val / 10) * maxRadius;
    const pointsStr = axes
      .map((axis) => {
        const x = center + r * Math.cos(axis.angle);
        const y = center + r * Math.sin(axis.angle);
        return `${x},${y}`;
      })
      .join(" ");
    return { value: val, points: pointsStr, r };
  });

  // Calculate student score path vertices
  const studentPathPoints = useMemo(() => {
    return axes
      .map((axis) => {
        const r = (Math.max(0, Math.min(10, axis.score)) / 10) * maxRadius;
        const x = center + r * Math.cos(axis.angle);
        const y = center + r * Math.sin(axis.angle);
        return `${x},${y}`;
      })
      .join(" ");
  }, [axes, maxRadius, center]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border-2 border-slate-250 shadow-sm w-full" id="radar-card">
      <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">
        Ficha Gráfica
      </span>
      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight text-center font-display mb-1">
        Rendimiento General
      </h3>
      <p className="text-xs text-slate-500 text-center mb-6 font-medium">
        Representación de los 8 ejes de Educación Física
      </p>

      {/* SVG Container wrapping the radar chart */}
      <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full select-none"
          id="radar-svg"
        >
          {/* Concentric octagons for grid levels */}
          {gridPolygons.map((ring) => (
            <g key={ring.value}>
              <polygon
                points={ring.points}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray={ring.value === 10 ? "none" : "2,2"}
              />
              {/* Score indicators along the vertical Axis (bottom branch or customized) */}
              <text
                x={center}
                y={center - ring.r + 4}
                textAnchor="middle"
                className="text-[10px] font-semibold text-slate-400 fill-slate-400"
              >
                {ring.value}
              </text>
            </g>
          ))}

          {/* Draw axis dividing lines */}
          {axes.map((axis, i) => {
            const endX = center + maxRadius * Math.cos(axis.angle);
            const endY = center + maxRadius * Math.sin(axis.angle);
            return (
              <line
                key={`line-${i}`}
                x1={center}
                y1={center}
                x2={endX}
                y2={endY}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
            );
          })}

          {/* Draw student actual score polygon filled layer */}
          <polygon
            points={studentPathPoints}
            fill="rgba(30, 41, 59, 0.25)"
            stroke="#0f172a"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="transition-all duration-300 ease-out"
          />

          {/* Draw small circle points coordinates representing the scores */}
          {axes.map((axis, i) => {
            const r = (Math.max(0, Math.min(10, axis.score)) / 10) * maxRadius;
            const x = center + r * Math.cos(axis.angle);
            const y = center + r * Math.sin(axis.angle);
            return (
              <g key={`dot-${i}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="4.5"
                  fill="#ffffff"
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-all duration-300 ease-out"
                />
                
                {/* Floating score label text near the vertex */}
                {axis.score > 0 && (
                  <text
                    x={x}
                    y={y - 8}
                    textAnchor="middle"
                    className="text-[10px] font-bold text-[#0f172a] fill-[#0f172a]"
                  >
                    {axis.score.toFixed(1).replace(".0", "")}
                  </text>
                )}
              </g>
            );
          })}

          {/* External text Labels */}
          {axes.map((axis, i) => {
            const x = center + (maxRadius + 14) * Math.cos(axis.angle);
            const y = center + (maxRadius + 14) * Math.sin(axis.angle);
            
            // Adjust coordinates based on design labelOffset
            const textX = x + axis.labelOffset.x;
            const textY = y + axis.labelOffset.y;

            return (
              <text
                key={`label-${i}`}
                x={textX}
                y={textY}
                textAnchor="middle"
                className="text-[11px] font-medium text-slate-700 fill-slate-600 bg-white"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {axis.name}
              </text>
            );
          })}
        </svg>
      </div>
      
      {/* Legend and performance indicators */}
      <div className="mt-2 text-center flex gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-950 inline-block"></span>
          Tu Rendimiento
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="w-2.5 h-1 border-t-2 border-dashed border-slate-200 inline-block"></span>
          Escala de 2 a 10
        </div>
      </div>
    </div>
  );
}
