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

  // Generate grid lines representing score zones (2, 4, 6, 8, 10) in reverse order (10 down to 2) to draw outside-in
  const gridRings = [10, 8, 6, 4, 2];

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

  // Helper inside RadarChart to color each level
  const getRingColor = (val: number) => {
    switch (val) {
      case 10: return { fill: "rgba(16, 185, 129, 0.08)", stroke: "#10b981", name: "Sobresaliente" };
      case 8:  return { fill: "rgba(14, 165, 233, 0.08)", stroke: "#0284c7", name: "Notable" };
      case 6:  return { fill: "rgba(245, 158, 11, 0.06)", stroke: "#f59e0b", name: "Bien / Aprobado" };
      case 4:  return { fill: "rgba(249, 115, 22, 0.06)", stroke: "#f97316", name: "Suficiente" };
      case 2:  return { fill: "rgba(239, 68, 68, 0.07)", stroke: "#ef4444", name: "Insuficiente" };
      default: return { fill: "none", stroke: "#e2e8f0", name: "" };
    }
  };

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
        Diana de Rendimiento
      </h3>
      <p className="text-xs text-slate-500 text-center mb-6 font-medium">
        Representación visual por zonas de condición física
      </p>

      {/* SVG Container wrapping the radar chart */}
      <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full select-none"
          id="radar-svg"
        >
          {/* Concentric octagons for grid levels with respective zone colors */}
          {gridPolygons.map((ring) => {
            const style = getRingColor(ring.value);
            return (
              <g key={ring.value}>
                <polygon
                  points={ring.points}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth="1.5"
                  className="transition-all duration-300"
                />
                {/* Score indicators along the vertical Axis */}
                <text
                  x={center}
                  y={center - ring.r + 4}
                  textAnchor="middle"
                  className="text-[10px] font-extrabold fill-slate-700"
                >
                  {ring.value}
                </text>
              </g>
            );
          })}

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
                stroke="#94a3b8"
                strokeWidth="0.75"
                strokeDasharray="2,2"
              />
            );
          })}

          {/* Draw student actual score polygon filled layer (Indigo / Purple Glowing) */}
          <polygon
            points={studentPathPoints}
            fill="rgba(79, 70, 229, 0.3)"
            stroke="#4f46e5"
            strokeWidth="3"
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
                  r="5"
                  fill="#ffffff"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                  className="transition-all duration-300 ease-out"
                />
                
                {/* Floating score label text near the vertex */}
                {axis.score > 0 && (
                  <text
                    x={x}
                    y={y - 8}
                    textAnchor="middle"
                    className="text-[10px] font-black text-indigo-950 fill-indigo-950"
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
                className="text-[11px] font-extrabold text-slate-800 fill-slate-800 bg-white"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {axis.name}
              </text>
            );
          })}
        </svg>
      </div>
      
      {/* Legend and performance indicators */}
      <div className="mt-4 w-full border-t border-slate-100 pt-4">
        <div className="flex justify-center items-center gap-2 mb-3 text-xs">
          <span className="w-3 h-3 rounded-full bg-indigo-600/35 border border-indigo-600 inline-block"></span>
          <span className="text-slate-800 font-extrabold">Tu Rendimiento Registrado</span>
        </div>
        
        {/* Colorful target zones explanation */}
        <div className="grid grid-cols-5 gap-1.5 text-[9px] font-bold text-center">
          <div className="bg-emerald-50 text-emerald-800 border-2 border-emerald-100 py-1 px-1 rounded-lg">
            <span>[9-10] Exc</span>
          </div>
          <div className="bg-sky-50 text-sky-800 border-2 border-sky-100 py-1 px-1 rounded-lg">
            <span>[7-8] Not</span>
          </div>
          <div className="bg-amber-50 text-amber-800 border-2 border-amber-100 py-1 px-1 rounded-lg">
            <span>[5-6] Bien</span>
          </div>
          <div className="bg-orange-50 text-orange-850 border-2 border-orange-100 py-1 px-1 rounded-lg">
            <span>[3-4] Suf</span>
          </div>
          <div className="bg-rose-50 text-rose-800 border-2 border-rose-100 py-1 px-1 rounded-lg">
            <span>[0-2] Ins</span>
          </div>
        </div>
      </div>
    </div>
  );
}
