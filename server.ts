import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON
  app.use(express.json());

  // Dynamic Teacher Email from environment, falling back to your professional email
  const TEACHER_EMAIL = process.env.TEACHER_EMAIL || "alejandroac@educastur.org";

  // POST endpoint to handle test submissions, generate report, and send emails
  app.post("/api/submit-report", async (req, res) => {
    try {
      const { student, scores, values, reflection } = req.body;

      if (!student || !scores || !values) {
        return res.status(400).json({
          error: "Faltan datos requeridos (student, scores, values)",
        });
      }

      const { nombre, apellidos, curso, letra, email: studentEmail } = student;

      if (!nombre || !apellidos || !curso || !letra || !studentEmail) {
        return res.status(400).json({
          error: "Faltan datos del alumno (nombre, apellidos, curso, letra, email)",
        });
      }

      // 1. Calculate average score and performance details
      const scoreKeyValues = Object.entries(scores) as [string, number][];
      const totalPoints = scoreKeyValues.reduce((sum, [_, pts]) => sum + pts, 0);
      const averageScore = Number((totalPoints / scoreKeyValues.length).toFixed(2));

      // Construct a summary list for Gemini analysis
      const scoreSummaries = scoreKeyValues
        .map(([id, score]) => {
          const rawValue = values[id] || "No roncado";
          const label = id.toUpperCase().replace("_", " ");
          return `- ${label}: ${rawValue} (Puntuación: ${score}/10)`;
        })
        .join("\n");

      // 2. Generate personalized feedback with Gemini 3.5 Flash
      let aiFeedback = "¡Excelente esfuerzo! Sigue entrenando para mantener tu condición física en óptimo estado.";
      let aiSuccess = false;

      if (process.env.GEMINI_API_KEY) {
        try {
          const prompt = `
            Eres un Profesor de Educación Física motivador y profesional de Educación Secundaria en España.
            Analiza los resultados de rendimiento físico del siguiente alumno e integra su reflexión personal para generar un informe personalizado en español.
            
            DATOS DEL ALUMNO:
            - Nombre: ${nombre} ${apellidos}
            - Curso: ${curso} - Grupo: ${letra}
            - Nota media de aptitud: ${averageScore} / 10
            
            RESULTADOS DE LOS TEST REALIZADOS:
            ${scoreSummaries}

            REFLEXIÓN Y AUTOEVALUACIÓN DEL ALUMNO:
            "${reflection || "El alumno no proporcionó reflexión."}"
            
            INSTRUCCIONES PARA LA RESPUESTA:
            1. Saluda cordialmente al estudiante llamándole por su nombre (${nombre}).
            2. Destaca cuál o cuáles han sido sus mayores fortalezas de forma positiva y técnica (fuerza de piernas, resistencia aeróbica, velocidad, flexibilidad, etc.).
            3. Identifica con tacto y optimismo de 1 a 2 áreas débiles en las que puede mejorar, ofreciendo un consejo práctico escolar simple para cada una.
            4. Revisa la reflexión personal del alumno. Valora si sus expectativas se ajustan a su desempeño real, y dale un comentario técnico constructivo felicitando o reconduciendo su autocrítica.
            5. Concluye con un mensaje cercano y motivador, recordándole que esta ficha de condición física es informativa y sirve para conocerse y progresar a su propio ritmo.
            6. Retorna la respuesta utilizando formato HTML limpio (con párrafos <p> o viñetas <ul>/<li> sencillas, sin estilos internos complejos o clases extrañas, solo etiquetas semánticas para que sea compatible con correos y navegación web).
          `;

          const aiResponse = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
          });

          if (aiResponse && aiResponse.text) {
            aiFeedback = aiResponse.text.trim();
            aiSuccess = true;
          }
        } catch (aiErr: any) {
          console.error("Error al generar feedback con Gemini:", aiErr);
          // Fallback feedback will be used
        }
      }

      // 3. Create beautiful HTML email body
      const listHtml = scoreKeyValues
        .map(([id, score]) => {
          const rawValue = values[id] || "N/A";
          const labelName = id.charAt(0).toUpperCase() + id.slice(1).replace("_", " ");
          
          let scoreColor = "#dc2626"; // red
          if (score >= 8) scoreColor = "#16a34a"; // green
          else if (score >= 5) scoreColor = "#d97706"; // orange

          return `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 8px; font-weight: 500; color: #1f2937;">${labelName}</td>
              <td style="padding: 12px 8px; color: #4b5563;">${rawValue}</td>
              <td style="padding: 12px 8px; font-weight: bold; text-align: right; color: ${scoreColor};">${score} / 10</td>
            </tr>
          `;
        })
        .join("");

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
            .container { max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); overflow: hidden; margin: 0 auto; border: 1px solid #e5e7eb; }
            .header { background-color: #0f172a; padding: 24px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 20px; letter-spacing: -0.025em; font-weight: 700; text-transform: uppercase; }
            .header p { margin: 4px 0 0 0; font-size: 14px; opacity: 0.8; }
            .content { padding: 24px; }
            .meta-card { background-color: #f1f5f9; border-radius: 6px; padding: 16px; margin-bottom: 24px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
            .meta-item { font-size: 14px; color: #334155; }
            .meta-item strong { color: #0f172a; }
            .summary-box { background-color: #e2e8f0; border-radius: 6px; padding: 16px; margin-bottom: 24px; text-align: center; }
            .average-val { font-size: 32px; font-weight: bold; color: #0f172a; margin: 0; }
            .average-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin-top: 2px; }
            .table-container { margin-bottom: 24px; width: 100%; border-collapse: collapse; }
            .ai-section { border-left: 4px solid #3b82f6; background-color: #eff6ff; padding: 16px; border-radius: 0 6px 6px 0; margin-bottom: 24px; }
            .ai-section h2 { margin: 0 0 10px 0; font-size: 16px; color: #1d4ed8; display: flex; align-items: center; }
            .ai-text { font-size: 14px; color: #1e3a8a; line-height: 1.5; }
            .footer { background-color: #f8fafc; text-align: center; padding: 16px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Iniciación a la Condición Física</h1>
              <p>Departamento de Educación Física &bull; Informe de Resultados</p>
            </div>
            
            <div class="content">
              <div class="meta-card">
                <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">Alumno:</td>
                    <td style="padding: 4px 0; font-weight: 600; color: #0f172a;">${nombre} ${apellidos}</td>
                    <td style="padding: 4px 0; color: #64748b; text-align: right;">Curso:</td>
                    <td style="padding: 4px 0; font-weight: 600; color: #0f172a; text-align: right;">${curso} (${letra})</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">Email Alumno:</td>
                    <td style="padding: 4px 0; font-weight: 500; color: #0f172a;" colspan="3">${studentEmail}</td>
                  </tr>
                </table>
              </div>

              <div class="summary-box">
                <div class="average-val">${averageScore}</div>
                <div class="average-label">Puntuación Media Obtenida</div>
              </div>
              
              <div class="ai-section">
                <h2>🎓 Evaluación Formativa del Profesor (AI)</h2>
                <div class="ai-text">${aiFeedback}</div>
              </div>
              
              ${reflection ? `
              <div style="border-left: 4px solid #78716c; background-color: #fafaf9; padding: 16px; border-radius: 0 6px 6px 0; margin-bottom: 24px;">
                <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #44403c; text-transform: uppercase; letter-spacing: 0.05em;">💭 Reflexión Personal del Alumno</h3>
                <div style="font-size: 13px; color: #57534e; font-style: italic; line-height: 1.5; white-space: pre-wrap;">"${reflection}"</div>
              </div>
              ` : ""}

              <h2 style="font-size: 15px; margin-bottom: 12px; text-transform: uppercase; color: #475569; letter-spacing: 0.05em;">Resultados de los Tests</h2>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                  <tr style="border-bottom: 2px solid #cbd5e1; text-align: left; color: #475569; font-weight: 600;">
                    <th style="padding: 8px 4px;">Ejercicio</th>
                    <th style="padding: 8px 4px;">Marca / Ejecución</th>
                    <th style="padding: 8px 4px; text-align: right;">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  ${listHtml}
                </tbody>
              </table>
            </div>
            
            <div class="footer">
              Este informe ha sido generado automáticamente por la aplicación de Condición Física del Alumnado.<br>
              Educación Física - Fomento de Hábitos Saludables y Deporte.
            </div>
          </div>
        </body>
        </html>
      `;

      // 4. Send actual email with Nodemailer
      let emailSuccess = false;
      let emailStatusMessage = "";

      const hasSmtpConfig = !!(
        process.env.SMTP_HOST &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS
      );

      if (hasSmtpConfig) {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 465,
            secure: Number(process.env.SMTP_PORT) === 465, // True for 465, false for other ports
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          // Send to student and teacher
          const mailOptions = {
            from: process.env.SMTP_FROM || `"Educación Física" <${process.env.SMTP_USER}>`,
            to: [studentEmail, TEACHER_EMAIL], // Multi-recipient
            subject: `Ficha de Condición Física - ${nombre} ${apellidos} - ${curso}`,
            html: emailHtml,
          };

          const info = await transporter.sendMail(mailOptions);
          emailSuccess = true;
          emailStatusMessage = `Informes enviados con éxito a ${studentEmail} y ${TEACHER_EMAIL}. ID: ${info.messageId}`;
        } catch (emailErr: any) {
          console.error("Error al enviar el correo:", emailErr);
          emailStatusMessage = `No se pudo enviar el correo real debido a un fallo en el servidor SMTP: ${emailErr.message}.`;
        }
      } else {
        emailStatusMessage = "Envío simulado. El servidor SMTP no está configurado en los Secretos. El informe se generó perfectamente para su descarga.";
      }

      // 5. Send successful response
      return res.status(200).json({
        success: true,
        emailSent: emailSuccess,
        smtpConfigured: hasSmtpConfig,
        message: emailStatusMessage,
        averageScore,
        aiFeedback,
        emailHtml, // Give client the HTML for downloading or previewing
      });

    } catch (err: any) {
      console.error("Error general en submit-report:", err);
      return res.status(500).json({
        error: "Ocurrió un error en el servidor al consolidar el informe: " + err.message,
      });
    }
  });

  // Vite development vs production server static serving middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
