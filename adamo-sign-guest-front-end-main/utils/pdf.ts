import { S3Client } from "@aws-sdk/client-s3";


export const toArrayBuffer = (input: ArrayBufferLike): ArrayBuffer => {
  if (input instanceof ArrayBuffer) {
    return input;
  }
  if (typeof SharedArrayBuffer !== "undefined" && input instanceof SharedArrayBuffer) {
    return new Uint8Array(input).slice().buffer;
  }
  if (ArrayBuffer.isView(input)) {
    const view = input as ArrayBufferView;
    return new Uint8Array(view.buffer, view.byteOffset, view.byteLength).slice().buffer;
  }
  throw new Error("Tipo no soportado para conversión a ArrayBuffer");
};    

export const streamToArrayBuffer = async (stream: ReadableStream<Uint8Array>): Promise<ArrayBuffer> => {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    let done = false;
    while (!done) {
      const result = await reader.read();
      if (result.done) {
        done = true;
      } else if (result.value) {
        chunks.push(result.value);
      }
    }
    const length = chunks.reduce((acc, c) => acc + c.length, 0);
    const merged = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    return merged.buffer;
  };


export const s3Client = new S3Client({
    region: process.env.NEXT_PUBLIC_AWS_REGION!,
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
    },
});

export const fontUrls = {
    "FF Market": "https://db.onlinewebfonts.com/t/cbf4e1e19572ee20b952fd42eca5d2bf.ttf",
    Helvetica: "https://fonts.cdnfonts.com/css/helvetica-neue-55",
    "MadreScript": "https://db.onlinewebfonts.com/t/078dccb5f3be0956233a6975ccbf4975.ttf",
    "Dancing Script": "https://db.onlinewebfonts.com/t/be7d00cc3e81bca7bd01f0924f5d5b73.ttf",
    "Great Vibes": "https://db.onlinewebfonts.com/t/5bf06596a053153248631d74f9fc4e28.ttf",
    "Pacifico": "https://db.onlinewebfonts.com/t/6b6170fe52fb23f505b4e056fefd2675.ttf",
    "Satisfy": "https://db.onlinewebfonts.com/t/4b6d03ce5461faeda7d8e785d1a2351.ttf"
};

export const fetchFontBytes = async (fontUrl: string) => {
  const response = await fetch(fontUrl);
  if (!response.ok) throw new Error(`Failed to load font from ${fontUrl}`);
  return response.arrayBuffer();
};