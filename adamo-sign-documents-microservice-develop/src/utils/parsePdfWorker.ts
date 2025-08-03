// src/utils/parsePdfWorker.util.ts
import { Worker } from "worker_threads";
import path from "path";
import fs from "fs";

export function parsePdfInWorker(
  buf: Buffer
): Promise<{ numpages: number; encrypted: boolean }> {
  return new Promise((resolve, reject) => {
    // 1) Resolvemos rutas para TS y JS
    const tsPath = path.resolve(__dirname, "pdfWorker.ts");
    const jsPath = path.resolve(__dirname, "pdfWorker.js");

    // 2) Elegimos el archivo y los execArgv correspondientes
    let workerFile: string;
    let execArgv: string[];
    if (fs.existsSync(jsPath)) {
      // Si ya tienes el .js (build), lo levantamos sin ts-node
      workerFile = jsPath;
      execArgv = [];
    } else if (fs.existsSync(tsPath)) {
      // En desarrollo, si solo existe el .ts, seguimos usando ts-node
      workerFile = tsPath;
      execArgv = ["-r", "ts-node/register"];
    } else {
      return reject(
        new Error(
          "No encuentro ni pdfWorker.js ni pdfWorker.ts en " + __dirname
        )
      );
    }

    // 3) Creamos el worker
    const worker = new Worker(workerFile, { execArgv });

    worker.once("message", (msg) => {
      worker.terminate();
      if (msg.error) return reject(new Error(msg.error));
      resolve(msg);
    });

    worker.once("error", (err) => {
      worker.terminate();
      reject(err);
    });

    // 4) Enviamos el buffer al worker
    worker.postMessage(buf);
  });
}
