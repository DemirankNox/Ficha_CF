import React from "react";
import { StudentInfo } from "../types";
import { User, Mail, GraduationCap, Mars, Venus } from "lucide-react";

interface StudentProfileFormProps {
  info: StudentInfo;
  onChange: (updated: StudentInfo) => void;
  errors: Record<string, string>;
}

export default function StudentProfileForm({
  info,
  onChange,
  errors,
}: StudentProfileFormProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    onChange({
      ...info,
      [name]: value,
    });
  };

  const setCourse = (curso: StudentInfo["curso"]) => {
    onChange({ ...info, curso });
  };

  const setLetra = (letra: StudentInfo["letra"]) => {
    onChange({ ...info, letra });
  };

  const setGenero = (genero: StudentInfo["genero"]) => {
    onChange({ ...info, genero });
  };

  const cursos: StudentInfo["curso"][] = ["1 ESO", "2 ESO", "3 ESO", "4 ESO", "1 BACH"];
  const letras: StudentInfo["letra"][] = ["A", "B", "C", "D"];

  return (
    <div className="space-y-6" id="profile-form">
      {/* Container 1: Datos Personales (01. Identidad en el Bento) */}
      <div className="bg-white rounded-3xl border-2 border-slate-250 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            01. Identidad
          </span>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">
            Registro Académico
          </span>
        </div>
        
        <h3 className="text-2xl font-black text-slate-900 uppercase font-display mb-6">
          Datos del Alumno
        </h3>

        <div className="space-y-6">
          {/* Name Input */}
          <div className="group">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={info.nombre}
              onChange={handleInputChange}
              placeholder="Ej. Alejandro"
              className={`w-full text-sm border-b-2 py-2.5 outline-none transition-colors duration-200 bg-transparent ${
                errors.nombre
                  ? "border-rose-300 focus:border-rose-500"
                  : "border-slate-100 focus:border-slate-900 text-slate-900 font-medium"
              }`}
            />
            {errors.nombre && (
              <span className="text-[10px] font-medium text-rose-600 block mt-1">
                {errors.nombre}
              </span>
            )}
          </div>

          {/* Surnames Input */}
          <div className="group">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
              Apellidos
            </label>
            <input
              type="text"
              name="apellidos"
              value={info.apellidos}
              onChange={handleInputChange}
              placeholder="Ej. García Pérez"
              className={`w-full text-sm border-b-2 py-2.5 outline-none transition-colors duration-200 bg-transparent ${
                errors.apellidos
                  ? "border-rose-300 focus:border-rose-500"
                  : "border-slate-100 focus:border-slate-900 text-slate-900 font-medium"
              }`}
            />
            {errors.apellidos && (
              <span className="text-[10px] font-medium text-rose-600 block mt-1">
                {errors.apellidos}
              </span>
            )}
          </div>

          {/* Email Input */}
          <div className="group">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              value={info.email}
              onChange={handleInputChange}
              placeholder="alumno@colegio.com"
              className={`w-full text-sm border-b-2 py-2.5 outline-none transition-colors duration-200 bg-transparent ${
                errors.email
                  ? "border-rose-300 focus:border-rose-500"
                  : "border-slate-100 focus:border-slate-900 text-slate-900 font-medium"
              }`}
            />
            <p className="text-[10px] text-slate-450 mt-1.5 leading-relaxed">
              Recibirás una copia completa con las rúbricas detalladas por el profesor.
            </p>
            {errors.email && (
              <span className="text-[10px] font-medium text-rose-600 block mt-1">
                {errors.email}
              </span>
            )}
          </div>

          {/* Gender (Género) Input */}
          <div className="group pt-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">
              Género del Alumno / Alumna
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setGenero("masculino")}
                className={`border-2 py-3 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  info.genero === "masculino"
                    ? "border-sky-500 bg-sky-50 text-sky-950 shadow-sm font-black scale-[1.01]"
                    : "border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200"
                }`}
              >
                <Mars className={`w-4 h-4 ${info.genero === "masculino" ? "text-sky-600" : "text-slate-400"}`} />
                <span>Masculino</span>
              </button>

              <button
                type="button"
                onClick={() => setGenero("femenino")}
                className={`border-2 py-3 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  info.genero === "femenino"
                    ? "border-rose-400 bg-rose-50 text-rose-950 shadow-sm font-black scale-[1.01]"
                    : "border-slate-100 text-slate-650 hover:bg-slate-50 hover:border-slate-200"
                }`}
              >
                <Venus className={`w-4 h-4 ${info.genero === "femenino" ? "text-rose-500" : "text-slate-400"}`} />
                <span>Femenino</span>
              </button>
            </div>
            {errors.genero && (
              <span className="text-[10px] font-medium text-rose-600 block mt-2">
                {errors.genero}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid horizontal para Curso (02) y Letra (03) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Course Card Selection */}
        <div className="bg-white rounded-3xl border-2 border-slate-250 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              02. Curso
            </span>
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-widest font-mono">Nivel Escolar</span>
          </div>
          
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">
            Selecciona tu Curso actual
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {cursos.map((c) => {
              const isActive = info.curso === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCourse(c)}
                  className={`border-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm font-black scale-[1.01]"
                      : "border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Selection Card */}
        <div className="bg-white rounded-3xl border-2 border-slate-250 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              03. Grupo
            </span>
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-widest font-mono">Sección</span>
          </div>

          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">
            Selecciona tu letra / línea
          </label>

          <div className="flex gap-2.5">
            {letras.map((l) => {
              const isActive = info.letra === l;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLetra(l)}
                  className={`flex-1 border-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                    isActive
                      ? "border-blue-600 bg-blue-50 text-blue-800 shadow-sm font-black scale-[1.01]"
                      : "border-slate-100 text-slate-600 hover:bg-slate-100/50 hover:border-slate-200"
                  }`}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
