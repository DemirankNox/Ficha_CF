import React, { useState, useMemo } from "react";
import { PHYSICAL_TESTS, StudentInfo, MetricOption } from "./types";
import StudentProfileForm from "./components/StudentProfileForm";
import TestCard from "./components/TestCard";
import RadarChart from "./components/RadarChart";
import {
  Send,
  Printer,
  Copy,
  Check,
  AlertCircle,
  Activity,
  Award,
  BookOpen,
  Info,
  CheckCircle2,
  RefreshCw,
  Heart,
  ChevronDown,
  ChevronUp,
  PenTool
} from "lucide-react";

const TEACHER_EMAIL = (import.meta as any).env?.VITE_TEACHER_EMAIL || "alejandroac@educastur.org";

export default function App() {
  // Student Information State
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    nombre: "",
    apellidos: "",
    curso: "1 ESO",
    letra: "A",
    email: "",
    genero: "",
  });

  // Reflection and collapsed sections states
  const [reflection, setReflection] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    flex_saltos: true,
    fuerza: false,
    cardio: false,
    reflexion: false,
  });

  // Test Selection States
  const [scores, setScores] = useState<Record<string, number>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  
  // Validation Errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Submission Statuses
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [loadingStep, setLoadingStep] = useState("");
  const [copied, setCopied] = useState(false);

  // Raw Response from server
  const [reportResult, setReportResult] = useState<{
    success: boolean;
    emailSent: boolean;
    smtpConfigured: boolean;
    message: string;
    averageScore: number;
    aiFeedback: string;
    emailHtml: string;
  } | null>(null);

  // Completed tests counters by category for the accordions
  const completedFlexSaltos = useMemo(() => {
    return ['flexibilidad', 'salto_vertical', 'salto_horizontal', 'lanzamiento_balon'].filter(id => scores[id] !== undefined).length;
  }, [scores]);

  const completedFuerza = useMemo(() => {
    return ['flexiones', 'abdominales', 'sentadillas', 'burpees'].filter(id => scores[id] !== undefined).length;
  }, [scores]);

  const completedCardio = useMemo(() => {
    return ['cooper', 'velocidad'].filter(id => scores[id] !== undefined).length;
  }, [scores]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Overall calculations
  const totalCompleted = Object.keys(scores).length;
  const progressPercent = Math.min(100, Math.floor((totalCompleted / PHYSICAL_TESTS.length) * 100));

  const averageScore = useMemo(() => {
    if (totalCompleted === 0) return 0;
    const sum = (Object.values(scores) as number[]).reduce((a, b) => a + b, 0);
    return Number((sum / totalCompleted).toFixed(2));
  }, [scores, totalCompleted]);

  // Qualitative description representation
  const ratingDetails = useMemo(() => {
    if (totalCompleted === 0) {
      return { text: "Pendiente de completar los tests", color: "text-slate-400 bg-slate-50 border-slate-200" };
    }
    if (averageScore < 5) {
      return { text: "Necesita mejorar (Insuficiente)", color: "text-rose-700 bg-rose-50 border-rose-150" };
    }
    if (averageScore < 7) {
      return { text: "Rendimiento Aceptable (Suficiente / Bien)", color: "text-amber-700 bg-amber-50 border-amber-150" };
    }
    if (averageScore < 9) {
      return { text: "Rendimiento Notable", color: "text-sky-700 bg-sky-50 border-sky-150" };
    }
    return { text: "Rendimiento Excelente (Sobresaliente)", color: "text-emerald-700 bg-emerald-50 border-emerald-150" };
  }, [averageScore, totalCompleted]);

  // Individual selection handler
  const handleSelectOption = (testId: string, option: MetricOption) => {
    setScores((prev) => ({
      ...prev,
      [testId]: option.points,
    }));
    setValues((prev) => ({
      ...prev,
      [testId]: option.label,
    }));
  };

  // Profile forms validators
  const validateForm = () => {
    const errorList: Record<string, string> = {};
    if (!studentInfo.nombre.trim()) {
      errorList.nombre = "El nombre es obligatorio.";
    }
    if (!studentInfo.apellidos.trim()) {
      errorList.apellidos = "Los apellidos son obligatorios.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!studentInfo.email.trim()) {
      errorList.email = "El correo del estudiante es obligatorio.";
    } else if (!emailRegex.test(studentInfo.email)) {
      errorList.email = "Introduce un correo válido.";
    }

    if (!studentInfo.genero) {
      errorList.genero = "Debes seleccionar tu género (femenino o masculino).";
    }
    
    // Validate forced student reflection
    if (!reflection.trim()) {
      errorList.reflection = "La reflexión personal es obligatoria.";
      setOpenSections(prev => ({ ...prev, reflexion: true }));
    } else if (reflection.trim().length < 500) {
      errorList.reflection = `La reflexión es demasiado corta. Debes escribir al menos 500 caracteres para forzar tu autoevaluación (llevas ${reflection.trim().length}, te faltan ${500 - reflection.trim().length} más).`;
      setOpenSections(prev => ({ ...prev, reflexion: true }));
    }

    setFormErrors(errorList);
    return Object.keys(errorList).length === 0;
  };

  // Submit report triggering the API
  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check form validations first
    const isProfileValid = validateForm();
    if (!isProfileValid) {
      // Focus on profiles or reflection element
      const errorSectionId = formErrors.reflection ? "reflection-textarea" : "profile-form";
      document.getElementById(errorSectionId)?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const missingTests = PHYSICAL_TESTS.filter((t) => scores[t.id] === undefined);
    if (missingTests.length > 0) {
      alert(`No puedes enviar el informe porque faltan tests por responder. Debes seleccionar una respuesta o marcar 'No realizado' en todos los tests (te faltan responder ${missingTests.length} tests).`);
      
      const hasMissingFlex = missingTests.some(t => ['flexibilidad', 'salto_vertical', 'salto_horizontal', 'lanzamiento_balon'].includes(t.id));
      const hasMissingFuerza = missingTests.some(t => ['flexiones', 'abdominales', 'sentadillas', 'burpees'].includes(t.id));
      const hasMissingCardio = missingTests.some(t => ['cooper', 'velocidad'].includes(t.id));
      
      setOpenSections(prev => ({
        ...prev,
        flex_saltos: prev.flex_saltos || hasMissingFlex,
        fuerza: prev.fuerza || hasMissingFuerza,
        cardio: prev.cardio || hasMissingCardio,
      }));

      // Focus first missing card
      const firstMissingId = missingTests[0].id;
      document.getElementById(`test-card-${firstMissingId}`)?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(null);

    // Simulated multi-step loader for optimal feedback
    setLoadingStep("Analizando tus resultados de condición física...");
    setTimeout(() => {
      setLoadingStep("Consultando con el tutor virtual de IA Gemini...");
    }, 1200);
    setTimeout(() => {
      setLoadingStep("Preparando los correos electrónicos...");
    }, 2400);

    try {
      const response = await fetch("/api/submit-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student: studentInfo,
          scores: scores,
          values: values,
          reflection: reflection,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setReportResult(data);
        setSubmitSuccess(true);
      } else {
        throw new Error(data.error || "Ocurrió un error inesperado.");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error al guardar resultados: ${err.message}`);
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
      setLoadingStep("");
    }
  };

  const copyToClipboard = () => {
    if (!reportResult?.emailHtml) return;
    navigator.clipboard.writeText(reportResult.emailHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const resetForm = () => {
    if (window.confirm("¿Seguro que deseas volver a empezar y borrar los resultados actuales?")) {
      setScores({});
      setValues({});
      setReflection("");
      setSubmitSuccess(null);
      setReportResult(null);
      setStudentInfo({
        nombre: "",
        apellidos: "",
        curso: "1 ESO",
        letra: "A",
        email: "",
      });
      setOpenSections({
        flex_saltos: true,
        fuerza: false,
        cardio: false,
        reflexion: false,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative pb-16 font-sans antialiased overflow-x-hidden">
      {/* Immersive Physical Fitness & Athletics Background Wallpaper */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.06] pointer-events-none mix-blend-multiply z-0 print:hidden" 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1600')" 
        }}
      ></div>
      
      {/* Content wrapper ensuring readable interaction on top of background */}
      <div className="relative z-10">
        {/* HEADER SECTION */}
        <header className="max-w-6xl mx-auto px-4 pt-8 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 print:hidden">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 uppercase">
              Condición Física
            </h1>
            <p className="text-slate-500 font-medium mt-1 text-xs sm:text-sm">
              Departamento de Educación Física — IES Río Trubia
            </p>
          </div>
          <div className="text-left border-l-4 border-blue-600 pl-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profesor asignado</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-700 font-mono">{TEACHER_EMAIL}</p>
          </div>
        </header>

      {/* INFORMATIONAL BLOCK */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        
        {/* Printable section styles wrapper */}
        <div className="print-view hidden print:block bg-white p-8 font-sans">
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tight text-slate-900">
                Ficha de Condición Física
              </h2>
              <p className="text-sm text-slate-500">
                Departamento de Educación Física &bull; Colegio Nacional
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-700">Resultado Oficial</p>
              <p className="text-xs text-slate-400">Fecha de Registro: {new Date().toLocaleDateString("es-ES")}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-100 p-4 rounded-xl mb-6 text-sm">
            <div>
              <p><strong>Alumno:</strong> {studentInfo.nombre} {studentInfo.apellidos}</p>
              <p><strong>Curso y Letra:</strong> {studentInfo.curso} - {studentInfo.letra}</p>
            </div>
            <div className="text-right">
              <p><strong>Email del Estudiante:</strong> {studentInfo.email}</p>
              <p><strong>Profesor Responsable:</strong> {TEACHER_EMAIL}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
            <div className="border border-slate-200 rounded-xl p-4">
              <h3 className="font-bold text-slate-800 text-sm mb-4 border-b pb-2 uppercase tracking-wide">
                Puntuaciones por Test
              </h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-600 font-semibold">
                    <th className="py-2 text-left">Test</th>
                    <th className="py-2 text-left">Marca</th>
                    <th className="py-2 text-right">Puntos (0-10)</th>
                  </tr>
                </thead>
                <tbody>
                  {PHYSICAL_TESTS.map((test) => {
                    const sc = scores[test.id] || 0;
                    const val = values[test.id] || "No roncado";
                    return (
                      <tr key={test.id} className="border-b last:border-0 text-slate-700">
                        <td className="py-2 font-medium">{test.title}</td>
                        <td className="py-2">{val}</td>
                        <td className="py-2 text-right font-bold text-slate-900">{sc} / 10</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 pt-4 border-t flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                <span className="text-sm font-bold text-slate-800">Resultado Medio:</span>
                <span className="text-xl font-extrabold text-slate-900">{averageScore} / 10</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <RadarChart scores={scores} />
            </div>
          </div>

          {reportResult?.aiFeedback && (
            <div className="border-l-4 border-slate-800 bg-slate-50 p-4 rounded-r-lg">
              <h3 className="font-bold text-sm text-slate-900 mb-2">Evaluación Cualitativa del Tutor IA:</h3>
              <div className="text-xs leading-relaxed text-slate-750" dangerouslySetInnerHTML={{ __html: reportResult.aiFeedback }} />
            </div>
          )}
        </div>

        {/* NON-PRINTABLE (SCREEN) INTERFACE */}
        <div className="print:hidden">
          
          {submitSuccess === true && reportResult ? (
            /* SUCCESS CONFIRMATION MODAL STATE */
            <div className="space-y-6 animate-fade-in-down">
              
              {/* Alert Banner */}
              <div className="bg-emerald-900 text-white rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-white/20 rounded-lg text-emerald-300">
                      <CheckCircle2 className="w-6 h-6" />
                    </span>
                    <h2 className="text-xl font-bold font-display">
                      ¡Ficha Guardada Correctamente!
                    </h2>
                  </div>
                  <p className="text-sm text-emerald-100 max-w-xl">
                    Los resultados de {studentInfo.nombre} han sido procesados. El informe completo con el análisis de los 10 tests ya fue enviado.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <button
                    onClick={handlePrint}
                    className="flex-1 md:flex-initial bg-white text-emerald-950 font-semibold px-4 py-2.5 rounded-xl hover:bg-emerald-50 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir / Guardar PDF
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 md:flex-initial bg-emerald-800 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-emerald-700 border border-emerald-700 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Registrar nuevo Alumno
                  </button>
                </div>
              </div>

              {/* Information Status Bar on Mail configuration results */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                  <Info className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm">Estado del Envío de Correos</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {reportResult.smtpConfigured 
                      ? `Se ha realizado la entrega real del email al buzón del alumno y al del profesor (${TEACHER_EMAIL}).` 
                      : "Nota para el Profesor: El servidor SMTP no está configurado (consulta los Secretos de AI Studio en las pestañas técnicas). Se ha habilitado la simulación sin fallar por temas de credenciales."}
                  </p>
                </div>
              </div>

              {/* Main report block split layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Visual Chart Panel */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="sticky top-6">
                    <RadarChart scores={scores} />
                    
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 mt-4 text-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                        Calificación del Estudiante
                      </span>
                      <div className="text-3xl font-extrabold text-slate-900 mt-1">
                        {reportResult.averageScore} / 10
                      </div>
                      <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border mt-2 ${ratingDetails.color}`}>
                        {ratingDetails.text}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Technical dynamic review generated by Gemini */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-850 p-6 md:p-8 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
                      <span className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
                        <Award className="w-5 h-5" />
                      </span>
                      <h4 className="font-bold text-[16px] text-white font-display">
                        🎓 Evaluación Cualitativa del Profesor (AI)
                      </h4>
                    </div>

                    <div 
                      className="text-xs leading-relaxed text-slate-300 space-y-4 pt-1"
                      dangerouslySetInnerHTML={{ __html: reportResult.aiFeedback }} 
                    />

                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2 leading-relaxed">
                      <Info className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>
                        Este informe ha sido contrastado con las escalas de rendimiento escolar de flexiones, salto vertical, velocidad de 30 metros y equilibrio estipuladas por el plan educativo.
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          ) : (
            /* ACTIVE FORM STATE */
            <div className="space-y-8">
              
              {/* Form Content Panel */}
              <div className="space-y-6">
                
                {/* Introduction Note: Bento Instruction block with high quality sports illustration */}
                <div className="bg-slate-900 text-slate-150 rounded-3xl overflow-hidden shadow-xl relative grid grid-cols-1 md:grid-cols-12 items-stretch min-h-[220px]">
                  <div className="p-6 md:p-8 md:col-span-8 flex flex-col justify-center space-y-3 z-10">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Instrucciones
                      </span>
                      <span className="text-slate-400 font-mono text-[10px] font-bold uppercase tracking-wider">Ayuda Guía</span>
                    </div>
                    <h4 className="font-extrabold text-white text-xl leading-snug font-display uppercase tracking-tight">
                      Ficha de autoevaluación de la condición física
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      Registra tu rendimiento en cada uno de los 10 tests obligatorios de condición física. El sistema calcula automáticamente tu calificación de de <strong>2 a 10 puntos</strong> según las escalas oficiales de resistencia, fuerza, flexibilidad y saltos para Secundaria y Bachillerato.
                    </p>
                    <p className="text-[10px] text-slate-400 font-normal">
                      Nota: Al finalizar, el sistema generará un informe de progreso con retroalimentación cualitativa asistida por IA y enviará un reporte completo al buzón del alumno y profesor.
                    </p>
                  </div>
                  {/* High quality sports action image */}
                  <div className="md:col-span-4 relative min-h-[140px] md:min-h-full">
                    <img 
                      src="https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&q=80&w=800" 
                      alt="Estudiantes entrenando en atletismo" 
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-900 via-slate-900/10 to-transparent"></div>
                  </div>
                </div>

                {/* Profile form section - already redesigned in StudentProfileForm */}
                <StudentProfileForm
                  info={studentInfo}
                  onChange={(updated) => setStudentInfo(updated)}
                  errors={formErrors}
                />

                 {/* Tests layout structure with accordions (subapartados desplegables) */}
                <div className="space-y-4">
                  <div>
                    <span className="bg-slate-200 text-slate-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1.5 inline-block">
                      04. Medición
                    </span>
                    <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight font-display">
                      Ficha de Ejercicios
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* SECCIÓN 1: FLEXIBILIDAD Y SALTOS */}
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                      <button
                        type="button"
                        onClick={() => toggleSection('flex_saltos')}
                        className="w-full px-6 py-4 flex justify-between items-center bg-slate-50/20 hover:bg-slate-50 transition-all cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                            <Award className="w-5 h-5" />
                          </span>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm md:text-base">Flexibilidad y Saltos</h4>
                            <p className="text-[11px] text-slate-400 font-medium">Flexión profunda, potencia vertical, horizontal y medicinal</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            completedFlexSaltos === 4
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : completedFlexSaltos > 0
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-400 border-slate-200"
                          }`}>
                            {completedFlexSaltos} / 4 Tests
                          </span>
                          {openSections.flex_saltos ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                        </div>
                      </button>
                      
                      {openSections.flex_saltos && (
                        <div className="p-6 bg-white border-t border-slate-100 space-y-4">
                          {/* Banner de Categoría Flexibilidad y Saltos */}
                          <div className="h-28 rounded-2xl overflow-hidden relative mb-2">
                            <img 
                              src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=800" 
                              alt="Flexibilidad y Saltos" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/40 to-transparent flex items-center p-5">
                              <div>
                                <span className="bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1 inline-block">
                                  Bloque 01
                                </span>
                                <h5 className="text-white font-extrabold text-sm uppercase tracking-tight">Potencia y Elasticidad</h5>
                                <p className="text-slate-200 text-[11px] mt-0.5 max-w-md font-sans">Evaluación del rango articular óptimo, flexión del tronco y la fuerza explosiva en tus extremidades superiores e inferiores.</p>
                              </div>
                            </div>
                          </div>
                          {PHYSICAL_TESTS.filter(t => ['flexibilidad', 'salto_vertical', 'salto_horizontal', 'lanzamiento_balon'].includes(t.id)).map((test) => (
                            <TestCard
                              key={test.id}
                              test={test}
                              selectedOptionValue={
                                scores[test.id] !== undefined
                                  ? (values[test.id] === "No realizado"
                                      ? "no_realizado"
                                      : PHYSICAL_TESTS.find((p) => p.id === test.id)?.options.find(
                                          (o) => o.label === values[test.id]
                                        )?.value || undefined)
                                  : undefined
                              }
                              points={scores[test.id] || 0}
                              onSelectOption={(option) => handleSelectOption(test.id, option)}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* SECCIÓN 2: FUERZA */}
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                      <button
                        type="button"
                        onClick={() => toggleSection('fuerza')}
                        className="w-full px-6 py-4 flex justify-between items-center bg-slate-50/20 hover:bg-slate-50 transition-all cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                            <Activity className="w-5 h-5" />
                          </span>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm md:text-base">Fuerza</h4>
                            <p className="text-[11px] text-slate-400 font-medium">Flexiones de brazos, abdominales, sentadillas y burpees</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            completedFuerza === 4
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : completedFuerza > 0
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-400 border-slate-200"
                          }`}>
                            {completedFuerza} / 4 Tests
                          </span>
                          {openSections.fuerza ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                        </div>
                      </button>
                      
                      {openSections.fuerza && (
                        <div className="p-6 bg-white border-t border-slate-100 space-y-4">
                          {/* Banner de Categoría Fuerza */}
                          <div className="h-28 rounded-2xl overflow-hidden relative mb-2">
                            <img 
                              src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800" 
                              alt="Fuerza Resistencia" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/40 to-transparent flex items-center p-5">
                              <div>
                                <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1 inline-block">
                                  Bloque 02
                                </span>
                                <h5 className="text-white font-extrabold text-sm uppercase tracking-tight">Fuerza Muscular</h5>
                                <p className="text-slate-200 text-[11px] mt-0.5 max-w-md font-sans">Soporte y resistencia contra resistencia mecánica: flexiones de brazos, fuerza isométrica abdominal, piernas y coordinación general.</p>
                              </div>
                            </div>
                          </div>
                          {PHYSICAL_TESTS.filter(t => ['flexiones', 'abdominales', 'sentadillas', 'burpees'].includes(t.id)).map((test) => (
                            <TestCard
                              key={test.id}
                              test={test}
                              selectedOptionValue={
                                scores[test.id] !== undefined
                                  ? (values[test.id] === "No realizado"
                                      ? "no_realizado"
                                      : PHYSICAL_TESTS.find((p) => p.id === test.id)?.options.find(
                                          (o) => o.label === values[test.id]
                                        )?.value || undefined)
                                  : undefined
                              }
                              points={scores[test.id] || 0}
                              onSelectOption={(option) => handleSelectOption(test.id, option)}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* SECCIÓN 3: CARDIO */}
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                      <button
                        type="button"
                        onClick={() => toggleSection('cardio')}
                        className="w-full px-6 py-4 flex justify-between items-center bg-slate-50/20 hover:bg-slate-50 transition-all cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                            <Heart className="w-5 h-5" />
                          </span>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm md:text-base">Cardio</h4>
                            <p className="text-[11px] text-slate-400 font-medium font-sans">Test de Cooper de 12 minutos y velocidad lineal</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            completedCardio === 2
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : completedCardio > 0
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-400 border-slate-200"
                          }`}>
                            {completedCardio} / 2 Tests
                          </span>
                          {openSections.cardio ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                        </div>
                      </button>
                      
                      {openSections.cardio && (
                        <div className="p-6 bg-white border-t border-slate-100 space-y-4">
                          {/* Banner de Categoría Cardio */}
                          <div className="h-28 rounded-2xl overflow-hidden relative mb-2">
                            <img 
                              src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=800" 
                              alt="Resistencia y Velocidad" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/40 to-transparent flex items-center p-5">
                              <div>
                                <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1 inline-block">
                                  Bloque 03
                                </span>
                                <h5 className="text-white font-extrabold text-sm uppercase tracking-tight">Estamina y Potencia Aeróbica</h5>
                                <p className="text-slate-200 text-[11px] mt-0.5 max-w-md font-sans">Capacidad adaptativa del sistema respiratorio y cardiovascular: resistencia a ritmo sostenido y velocidad de reacción en carrera sprint.</p>
                              </div>
                            </div>
                          </div>
                          {PHYSICAL_TESTS.filter(t => ['cooper', 'velocidad'].includes(t.id)).map((test) => (
                            <TestCard
                              key={test.id}
                              test={test}
                              selectedOptionValue={
                                scores[test.id] !== undefined
                                  ? (values[test.id] === "No realizado"
                                      ? "no_realizado"
                                      : PHYSICAL_TESTS.find((p) => p.id === test.id)?.options.find(
                                          (o) => o.label === values[test.id]
                                        )?.value || undefined)
                                  : undefined
                              }
                              points={scores[test.id] || 0}
                              onSelectOption={(option) => handleSelectOption(test.id, option)}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* SECCIÓN 4: REFLEXIÓN PERSONAL */}
                    <div className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-sm" id="reflection-section">
                      <button
                        type="button"
                        onClick={() => toggleSection('reflexion')}
                        className="w-full px-6 py-4 flex justify-between items-center bg-slate-50/20 hover:bg-slate-50 transition-all cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                            <PenTool className="w-5 h-5" />
                          </span>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm md:text-base font-sans">Reflexión Personal</h4>
                            <p className="text-[11px] text-slate-400 font-medium font-sans">Autoevaluación obligatoria con respuestas guiadas</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            reflection.trim().length >= 500
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}>
                            {reflection.trim().length >= 500 ? "Completada ✅" : "Incompleta ⚠️"}
                          </span>
                          {openSections.reflexion ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                        </div>
                      </button>
                      
                      {openSections.reflexion && (
                        <div className="p-6 bg-white border-t border-slate-100 space-y-4">
                          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-xs text-slate-600 space-y-2 leading-relaxed">
                            <p className="font-extrabold text-slate-800 flex items-center gap-1 text-[13px] border-b pb-1.5 border-slate-200">
                              <BookOpen className="w-4 h-4 text-slate-700" /> PREGUNTAS DE REFLEXIÓN REQUERIDAS:
                            </p>
                            <ul className="list-disc leading-relaxed pl-4 space-y-1 text-slate-700 text-[11px] font-medium font-sans">
                              <li>¿Qué expectativas tenías respecto a tu condición física?</li>
                              <li>¿Lo has hecho mejor o peor de lo que esperabas?</li>
                              <li>¿Cuál crees que es el motivo de esto?</li>
                              <li>¿Qué opinas, de manera general, de tu condición física?</li>
                            </ul>
                            <p className="text-[10px] text-slate-500 font-semibold pt-1 italic">
                              *Puedes explayarte con total libertad. El profesor evaluará tu nivel de autocrítica.
                            </p>
                          </div>
                          
                          <div>
                            <label htmlFor="reflection-textarea" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                              Tu reflexión personal (Mínimo 500 caracteres):
                            </label>
                            <textarea
                              id="reflection-textarea"
                              rows={6}
                              value={reflection}
                              onChange={(e) => setReflection(e.target.value)}
                              placeholder="Escribe aquí tu reflexión detallada respondiendo a cada una de las preguntas de arriba... (Debes explayarte de manera amplia completando al menos 500 caracteres)"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-semibold font-sans focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400 transition-all resize-none leading-relaxed"
                            />
                            {formErrors.reflection && (
                              <p className="text-red-600 text-[11px] font-bold mt-1.5 flex items-center gap-1 animate-pulse">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {formErrors.reflection}
                              </p>
                            )}

                            <div className="flex justify-between items-center mt-2.5 text-[10px] font-bold">
                              <span className={`${reflection.trim().length >= 500 ? "text-emerald-600" : "text-slate-400"}`}>
                                {reflection.trim().length >= 500 ? "✓ Longitud suficiente" : "⚠️ Faltan " + Math.max(0, 500 - reflection.trim().length) + " caracteres"}
                              </span>
                              <span className="text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                                {reflection.trim().length} / 500 mín
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Visual results & Summary Panel - placed at the end below everything, side-by-side on large screens */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-slate-200">
                
                {/* Realtime Radar Chart display */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <span className="bg-slate-200 text-slate-800 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">
                    Gráfico de Aptitud
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm md:text-base uppercase tracking-tight mb-4 font-display">
                    Diana de Rendimiento Físico
                  </h4>
                  <RadarChart scores={scores} />
                </div>

                {/* Quick Dynamic Statistics Panel - styled with custom Blue Bento Submit theme */}
                <div className="bg-blue-600 text-white rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xl shadow-blue-100 relative overflow-hidden" id="stats-panel">
                  <div className="relative z-10">
                    <div className="flex justify-between items-center border-b pb-4 mb-5 border-blue-500/30">
                      <h3 className="font-extrabold text-white text-lg font-display uppercase tracking-tight">
                        Resumen General
                      </h3>
                      <span className="bg-blue-700/60 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Paso Final
                      </span>
                    </div>
                    
                    {/* Completion rate metrics */}
                    <div className="space-y-2 mb-5">
                      <div className="flex justify-between items-center text-xs text-blue-105">
                        <span className="font-semibold">Tests Completados:</span>
                        <span className="font-bold">
                          {totalCompleted} de {PHYSICAL_TESTS.length}
                        </span>
                      </div>
                      
                      <div className="w-full bg-blue-700/50 h-2.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${progressPercent}%` }}
                          className="bg-white h-full transition-all duration-300 rounded-full"
                        ></div>
                      </div>
                    </div>

                    {/* Numeric and average representation */}
                    <div className="grid grid-cols-2 gap-4 pb-6">
                      <div className="bg-blue-700/30 p-3 rounded-2xl border border-blue-500/20">
                        <span className="text-[10px] font-black uppercase text-blue-200 block tracking-widest">Media</span>
                        <span className="text-2xl font-black text-white font-mono leading-none mt-1 block">
                          {averageScore} <span className="text-xs font-normal">pts</span>
                        </span>
                      </div>
                      
                      <div className="bg-blue-700/30 p-3 rounded-2xl border border-blue-500/20">
                        <span className="text-[10px] font-black uppercase text-blue-200 block tracking-widest font-mono">Estado</span>
                        <span className="text-[11px] font-black text-white leading-tight uppercase tracking-wider block mt-1.5 truncate">
                          {ratingDetails.text.split(" (")[0]}
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-700/55 rounded-2xl p-4 mb-6 border border-white/5">
                      <p className="text-[9px] uppercase font-bold text-blue-200 tracking-wider">Destinatario del Informe</p>
                      <p className="text-white font-mono text-xs font-black mt-0.5 break-all">{TEACHER_EMAIL}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleFormSubmission}
                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                      isSubmitting
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-white text-blue-700 hover:bg-blue-50 shadow-blue-700/20"
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Guardando...</span>
                      </span>
                    ) : (
                      "Enviar Informe"
                    )}
                  </button>

                  {/* In-execution visual step indicators inside loaders */}
                  {isSubmitting && loadingStep && (
                    <div className="p-3 bg-blue-700/50 border border-blue-500/30 rounded-xl text-center mt-3 animate-pulse">
                      <p className="text-[9px] uppercase font-bold text-blue-200 tracking-wider">Procesador:</p>
                      <p className="text-xs font-semibold text-white mt-0.5">{loadingStep}</p>
                    </div>
                  )}

                  {submitSuccess === false && (
                    <div className="p-3 bg-rose-500 text-white border-rose-600/40 border rounded-xl text-xs flex items-center gap-2 mt-3 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Error al registrar la ficha. Por favor, revisa tus campos.</span>
                    </div>
                  )}
                  
                  {/* Decorative element */}
                  <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-white/10 rounded-full opacity-10 blur-2xl pointer-events-none"></div>
                </div>

              </div>

            </div>
          )}

        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-16 text-center text-xs text-slate-450 border-t border-slate-200/60 pt-6 print:hidden">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="flex items-center gap-1">
            <span>Ficha de Condición Física &copy; {new Date().getFullYear()}</span>
            <span>&bull;</span>
            <span className="flex items-center gap-0.5 text-rose-500">
              <Heart className="w-3.5 h-3.5 fill-current" />
              Educación Física Escolar
            </span>
          </p>
          <p className="text-[10px] text-slate-400 font-mono">
            Servicio de Evaluación con Inteligencia Artificial &bull; Gemini 3.5 Flash
          </p>
        </div>
      </footer>
      </div>
    </div>
  );
}
