import { parentPort } from "worker_threads";
import * as pdfParse from "pdf-parse";

parentPort!.on("message", async (buffer: Buffer) => {
  try {
    const data = await pdfParse.default(buffer);
    parentPort!.postMessage({
      numpages: data.numpages,
      encrypted: data.info?.IsEncrypted ?? false,
    });
  } catch (err: any) {
    parentPort!.postMessage({ error: err.message });
  }
});
