import React, { useState } from "react";
import { PhysicalTestDef, MetricOption } from "../types";
import { HelpCircle, ChevronDown, ChevronUp, CheckCircle, Dumbbell } from "lucide-react";

interface TestCardProps {
  key?: string;
  test: PhysicalTestDef;
  selectedOptionValue: string | undefined;
  points: number;
  onSelectOption: (option: MetricOption) => void;
}

export default function TestCard({
  test,
  selectedOptionValue,
  points,
  onSelectOption,
}: TestCardProps) {
  const [showInstructions, setShowInstructions] = useState(false);

  // Return a visual feedback background color based on points scored
  const getBadgeColor = (pts: number) => {
    if (pts >= 9) return "bg-emerald-50 text-emerald-800 border-emerald-150";
    if (pts >= 7) return "bg-sky-50 text-sky-800 border-sky-150";
    if (pts >= 5) return "bg-amber-50 text-amber-800 border-amber-150";
    return "bg-rose-50 text-rose-800 border-rose-150";
  };

  return (
    <div
      id={`test-card-${test.id}`}
      className={`bg-white rounded-3xl border-2 transition-all duration-300 overflow-hidden ${
        selectedOptionValue
          ? "border-slate-400 shadow-sm"
          : "border-slate-200 hover:border-slate-350 hover:shadow-sm"
      }`}
    >
      {/* Card Header section */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-slate-100 text-slate-800 rounded-lg inline-block">
                <Dumbbell className="w-4 h-4" />
              </span>
              <h4 className="font-extrabold text-slate-900 text-[15px] font-display uppercase tracking-tight">
                {test.title}
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">
              {test.description}
            </p>
          </div>
          
          {selectedOptionValue ? (
            <div className={`px-2.5 py-1.5 rounded-full text-xs font-black border-2 bg-emerald-50 text-emerald-800 border-emerald-150 flex items-center gap-1 shrink-0`}>
              <CheckCircle className="w-3.5 h-3.5" />
              {selectedOptionValue === "no_realizado" ? "No realizado" : "Registrado"}
            </div>
          ) : (
            <div className="px-2.5 py-1.5 bg-slate-50 text-slate-400 border-2 border-slate-100 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0">
              Pendiente
            </div>
          )}
        </div>

        {/* Technical instructions toggle banner */}
        <div className="mt-4 flex justify-between items-center bg-slate-55 rounded-xl px-3 py-2">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>¿Instrucciones de ejecución?</span>
            {showInstructions ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
          
          <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border-2 border-slate-100">
            {test.metricType}
          </span>
        </div>

        {/* Foldout Instructions */}
        {showInstructions && (
          <div className="mt-3 p-3 bg-blue-50/70 border border-blue-150 rounded-xl text-xs text-blue-950 leading-relaxed font-medium">
            <strong className="block mb-1 font-bold text-blue-900">Pasos oficiales:</strong>
            {test.instructions}
          </div>
        )}
      </div>

      {/* Options clickable grid */}
      <div className="p-4 bg-slate-50/50">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">
          Marca Obtenida (Haz clic para registrar)
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {test.options.map((option) => {
            const isSelected = selectedOptionValue === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelectOption(option)}
                className={`text-center py-2 px-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                  isSelected
                    ? "bg-slate-900 border-slate-950 text-white shadow-sm font-extrabold"
                    : "bg-white border-slate-150 text-slate-700 hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold"
                }`}
              >
                <span className="text-xs leading-tight">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
          <span className="text-[10px] text-slate-500 font-medium">¿Falta este ejercicio? Márcalo aquí:</span>
          <button
            type="button"
            onClick={() => onSelectOption({ value: "no_realizado", points: 0, label: "No realizado" })}
            className={`w-full sm:w-auto px-2.5 py-1 rounded-lg border transition-all flex items-center justify-center gap-1.5 text-[11px] font-bold cursor-pointer ${
              selectedOptionValue === "no_realizado"
                ? "bg-rose-600 border-rose-700 text-white shadow-sm"
                : "bg-rose-50/50 border-rose-100 text-rose-700 hover:border-rose-200 hover:bg-rose-50"
            }`}
          >
            <span>No realizado</span>
            {selectedOptionValue === "no_realizado" && <span className="text-[10px]">✓</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
