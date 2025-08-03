import yauzl from "yauzl";
import { parsePdfInWorker } from "./parsePdfWorker";
import { Express } from "express";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function validateFileExtended(
  file: Express.Multer.File
): Promise<void> {
  const buf = file.buffer;
  const name = file.originalname.toLowerCase();
  const ext = name.split(".").pop();

  // 1) Tamaño máximo
  if (buf.length > MAX_FILE_SIZE) {
    throw new Error(`El archivo supera ${MAX_FILE_SIZE / 1024 / 1024} MB.`);
  }

  // 2) Validar extensión + firma interna
  if (ext === "pdf") {
    // 2.a) Cabecera PDF
    if (buf.slice(0, 5).toString("utf8") !== "%PDF-") {
      throw new Error("No es un PDF válido (cabecera).");
    }
  } else if (ext === "docx") {
    // 2.b) Cabecera ZIP para DOCX (PK\003\004)
    const sig = buf.slice(0, 4);
    if (
      !(
        sig[0] === 0x50 &&
        sig[1] === 0x4b &&
        sig[2] === 0x03 &&
        sig[3] === 0x04
      )
    ) {
      throw new Error("No es un DOCX válido (firma ZIP).");
    }
  } else {
    throw new Error("Solo se permiten archivos PDF o DOCX.");
  }

  // 3) Si es PDF, validación profunda
  if (ext === "pdf") {
    // 3.a) EOF
    if (!/%%EOF\s*$/.test(buf.slice(-1024).toString("utf8"))) {
      throw new Error("PDF corrupto (EOF faltante).");
    }
    // 3.b) Parse en Worker Thread
    const { numpages, encrypted } = await parsePdfInWorker(buf);
    if (encrypted) throw new Error("PDF cifrado no permitido.");
    if (numpages < 1) throw new Error("PDF sin páginas válidas.");
  }

  // 4) Si es DOCX, validación de ZIP seguro
  if (ext === "docx") {
    await new Promise<void>((resolve, reject) => {
      yauzl.fromBuffer(buf, { lazyEntries: true }, (err, zip) => {
        if (err) return reject(new Error("DOCX corrupto o no ZIP."));
        zip.readEntry();
        zip.on("entry", (entry) => {
          const fileName = entry.fileName;
          // Zip-Slip
          if (fileName.includes("..")) {
            zip.close();
            return reject(new Error("DOCX sospechoso (path traversal)."));
          }
          // Solo rutas estándar de .docx
          if (
            !fileName.startsWith("word/") &&
            !fileName.startsWith("[Content_Types].xml") &&
            !fileName.startsWith("_rels/")
          ) {
            zip.close();
            return reject(new Error(`DOCX inesperado: ${fileName}`));
          }
          zip.readEntry();
        });
        zip.on("end", () => resolve());
      });
    });
  }
}

export function quickValidateFile(file: Express.Multer.File): void {
  const buf = file.buffer;
  if (buf.length > MAX_FILE_SIZE) {
    throw new Error(`El archivo supera ${MAX_FILE_SIZE / 1024 / 1024} MB.`);
  }

  const name = file.originalname.toLowerCase();
  const ext = name.split(".").pop();

  if (ext === "pdf") {
    // Cabecera y EOF
    if (!buf.slice(0, 5).equals(Buffer.from("%PDF-"))) {
      throw new Error("No es un PDF válido (cabecera).");
    }
    const eofChunk = buf.slice(-1024).toString("latin1");
    if (!/%%EOF\s*$/.test(eofChunk)) {
      throw new Error("PDF corrupto (EOF faltante).");
    }

    // Sólo miramos el trailer para cifrado, no todo el contenido
    const tail = buf.slice(Math.max(buf.length - 4096, 0)).toString("latin1");
    const trailerPos = tail.lastIndexOf("trailer");
    if (trailerPos !== -1) {
      const afterTrailer = tail.substring(trailerPos);
      const dictStart = afterTrailer.indexOf("<<");
      const dictEnd = afterTrailer.indexOf(">>", dictStart + 2);
      if (dictStart >= 0 && dictEnd > dictStart) {
        const trailerDict = afterTrailer.substring(dictStart, dictEnd + 2);
        if (trailerDict.includes("/Encrypt")) {
          throw new Error("PDF cifrado no permitido.");
        }
      }
    }

    // Detectar JavaScript básico en cabecera
    const headerFirstKb = buf.slice(0, 1024).toString("latin1");
    if (
      headerFirstKb.includes("/JavaScript") ||
      headerFirstKb.includes("/JS")
    ) {
      throw new Error("PDF con scripts no permitido.");
    }
  } else if (ext === "docx") {
    // ZIP signature
    if (
      buf[0] !== 0x50 ||
      buf[1] !== 0x4b ||
      buf[2] !== 0x03 ||
      buf[3] !== 0x04
    ) {
      throw new Error("No es un DOCX válido (firma ZIP).");
    }
    // Evitar path traversal en el nombre de archivo
    if (file.originalname.includes("..") || /[\/\\]/.test(file.originalname)) {
      throw new Error("Nombre de DOCX sospechoso (path traversal).");
    }
    // Comprobar presencia mínima de componente DOCX
    const asLatin = buf.toString("latin1");
    if (!asLatin.includes("[Content_Types].xml")) {
      throw new Error("DOCX inválido (falta [Content_Types].xml).");
    }
  } else {
    throw new Error("Solo se permiten archivos PDF o DOCX.");
  }
}
