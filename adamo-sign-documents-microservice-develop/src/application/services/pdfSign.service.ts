import { createReader, PDFRStreamForBuffer, Recipe } from "muhammara";
import * as fs from "fs";
import path from "path";
import * as os from "os";
import { S3Service } from "./s3.service";
import { Document } from "../../domain/models/document.entity";
import * as crypto from "crypto";
import QRCode from "qrcode";
import {
  degrees,
  PDFDocument,
  PDFFont,
  PDFPage,
  rgb,
  StandardFonts,
} from "pdf-lib";
import { createCanvas } from "@napi-rs/canvas";
import fontkit from "@pdf-lib/fontkit";

export class PdfSignService {
  constructor(private s3: S3Service) {}

  async parseRgbString(colorString: string): Promise<ReturnType<typeof rgb>> {
    console.log(`Parsing RGB string: ${colorString}`);
    const [r, g, b] = colorString
      .split(",")
      .map((val) => parseInt(val.trim()) / 255);

    console.log(`Parsed RGB values: r=${r}, g=${g}, b=${b}`);
    if ([r, g, b].some((val) => isNaN(val))) {
      throw new Error("Invalid RGB string");
    }

    return rgb(r, g, b);
  }

  /**
   * Aplica las firmas sobre un PDF existente.
   * @param originalKey — S3 key del PDF original.
   * @param signatureItems — Array con datos de posición y recurso de cada firma, incluyendo token.
   * @returns la nueva S3 key del PDF firmado.
   */
  async signPdf(
    document: Document,
    originalKey: string,
    signatureItems: Array<{
      id: string;
      left: number;
      top: number;
      width: number;
      height: number;
      imageKey?: string;
      text?: string;
      font?: string;
      token: string;
      slideElement: string;
      slideIndex: number;
      signatureFontFamily?: string;
      signatureType: "image" | "text";
      signatureText: string;
      signatureColor: string;
      canvasHeight: number;
      canvasWidth: number;
      rotation: number;
      color: string;
    }>
  ): Promise<any> {
    try {
      // 1) Preparar directorio temporal
      console.log("Preparando directorio temporal para firmas PDF...");
      const tmpBase = os.tmpdir();
      if (!fs.existsSync(tmpBase)) fs.mkdirSync(tmpBase, { recursive: true });

      const tmpIn = path.resolve(tmpBase, `${Date.now()}-in.pdf`);
      const tmpOut = path.resolve(tmpBase, `${Date.now()}-out.pdf`);

      console.log(`Descargando PDF original desde S3: ${originalKey}`);
      // 2) Descargar PDF original y cargar en memoria
      await this.s3.downloadToFile(originalKey, tmpIn);
      const pdfBytes = fs.readFileSync(tmpIn);
      // fs.unlinkSync(tmpIn);

      console.log("Iniciando proceso de firma PDF...");

      const pdfDoc = await PDFDocument.load(pdfBytes);
      pdfDoc.registerFontkit(fontkit);

      //Open Sans Regular
      const opensansFontBytes = fs.readFileSync(
        path.resolve(__dirname, "../../assets/fonts/OpenSans-Regular.ttf")
      );
      const opensansFont = await pdfDoc.embedFont(opensansFontBytes);

      for (let i = 0; i < signatureItems.length; i++) {
        const sig = signatureItems[i];
        // Buscar metadata y validar existencia antes de usar
        const sigMeta = signatureItems.find((s: any) => s.id === sig.id);
        console.log(`Procesando firma #${i} con id: ${sig.id}`);
        if (!sigMeta) {
          console.warn(`No se encontró metadata para id: ${sig.id}`);
          continue;
        }

        // Determinar página
        const page = pdfDoc.getPages()[sigMeta.slideIndex || 0];
        if (!page) {
          console.warn(
            `No se encontró la página para slideIndex: ${sigMeta.slideIndex}`
          );
          continue;
        }

        // Prioridad: si la data de la firma (sig) trae left/top/width/height/canvasWidth/canvasHeight, usar esa; si no, usar la de signatureData
        console.log(
          "CanvasHeight y CanvasWidth:",
          sig.canvasHeight,
          sig.canvasWidth
        );
        const left =
          typeof sig.left === "number"
            ? sig.left
            : typeof sigMeta.left === "number"
            ? sigMeta.left
            : 0;
        const top =
          typeof sig.top === "number"
            ? sig.top
            : typeof sigMeta.top === "number"
            ? sigMeta.top
            : 0;
        const width =
          typeof sig.width === "number"
            ? sig.width
            : typeof sigMeta.width === "number"
            ? sigMeta.width
            : 100;
        const height =
          typeof sig.height === "number"
            ? sig.height
            : typeof sigMeta.height === "number"
            ? sigMeta.height
            : 40;
        const rotation =
          typeof sig.rotation === "number"
            ? sig.rotation
            : typeof sigMeta.rotation === "number"
            ? sigMeta.rotation
            : 0;
        const color = sig.color || sigMeta.color || "#000";
        const signatureFontFamily =
          sig.signatureFontFamily || sigMeta.signatureFontFamily || "Arial";
        const canvasWidth =
          typeof sig.canvasWidth === "number"
            ? sig.canvasWidth
            : typeof sigMeta.canvasWidth === "number"
            ? sigMeta.canvasWidth
            : typeof sig.canvasWidth === "string"
            ? parseFloat(sig.canvasWidth)
            : typeof sigMeta.canvasWidth === "string"
            ? parseFloat(sigMeta.canvasWidth)
            : 1000;
        const canvasHeight =
          typeof sig.canvasHeight === "number"
            ? sig.canvasHeight
            : typeof sigMeta.canvasHeight === "number"
            ? sigMeta.canvasHeight
            : typeof sig.canvasHeight === "string"
            ? parseFloat(sig.canvasHeight)
            : typeof sigMeta.canvasHeight === "string"
            ? parseFloat(sigMeta.canvasHeight)
            : 1000;
        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();
        // left/top son proporcionales (0-1), width/height son pixeles canvas
        const x = left * pageWidth;
        const y = top * pageHeight;
        // Escalar width/height del canvas al PDF y reducir un 20%
        let scaledWidth = (width / canvasWidth) * pageWidth;
        let scaledHeight = (height / canvasHeight) * pageHeight;
        // Reducir tamaño un 20%
        scaledWidth = scaledWidth * 0.8;
        scaledHeight = scaledHeight * 0.8;
        // Ajuste: el front posiciona el centro del contenedor en (left, top), así que restamos la mitad del ancho/alto
        const drawX = x - scaledWidth / 2;
        const drawY = y - scaledHeight / 2;
        console.log(
          `Posición y tamaño (robusto, reducido 20%): left=${drawX}, top=${drawY}, width=${scaledWidth}, height=${scaledHeight}, rotation=${rotation}, pageWidth=${pageWidth}, pageHeight=${pageHeight}, canvasWidth=${canvasWidth}, canvasHeight=${canvasHeight}`
        );

        // Padding y dimensiones extendidas
        const padding = 4;
        const tokenText = `Token: ${sig.token}`;
        const fontSize = 3;
        const textColor = rgb(0.44, 0.47, 0.52);

        // Medir ancho mínimo para el token
        const tokenTextWidth = opensansFont.widthOfTextAtSize(
          tokenText,
          fontSize
        );

        // El rectángulo debe cubrir al menos el ancho del token
        const minRectWidth = Math.max(
          scaledWidth + 2 * padding,
          tokenTextWidth + 2 * padding
        );

        const rectX = drawX - padding;
        const rectY = pageHeight - drawY - scaledHeight - padding * 3;
        const rectWidth = minRectWidth;
        const rectHeight = scaledHeight + 2 * padding + 12;

        if (sig.signatureType === "image" && sig.imageKey) {
          const imgTmp = path.resolve(
            tmpBase,
            `${Date.now()}-${path.basename(sig.imageKey)}`
          );
          await this.s3.downloadToFile(sig.imageKey, imgTmp);

          console.log("Insertando firma como imagen desde:", imgTmp);
          const buffer = fs.readFileSync(imgTmp);
          const image = await pdfDoc.embedPng(buffer);
          console.log("Imagen insertada correctamente");

          // Centrar la imagen dentro del rectángulo
          const centerX = rectX + (rectWidth - scaledWidth) / 2;
          const centerY = rectY + (rectHeight - scaledHeight) / 2;

          page.drawImage(image, {
            x: centerX,
            y: centerY,
            width: scaledWidth,
            height: scaledHeight,
            ...(rotation ? { rotate: degrees(rotation) } : {}),
          });
        } else if (sig.signatureType === "text" && sig.signatureText) {
          //FF Market
          const ffmarketFontBytes = fs.readFileSync(
            path.resolve(__dirname, "../../assets/fonts/ffmarket.ttf")
          );
          const ffMarketFont = await pdfDoc.embedFont(ffmarketFontBytes);
          //MadreScript
          const madreScriptFontBytes = fs.readFileSync(
            path.resolve(__dirname, "../../assets/fonts/madrescript.ttf")
          );
          const madreScriptFont = await pdfDoc.embedFont(madreScriptFontBytes);
          //Dancing Script
          const dancingScriptFontBytes = fs.readFileSync(
            path.resolve(__dirname, "../../assets/fonts/dancingscript.ttf")
          );
          const dancingScriptFont = await pdfDoc.embedFont(
            dancingScriptFontBytes
          );
          //Great Vibes
          const greatVibesFontBytes = fs.readFileSync(
            path.resolve(__dirname, "../../assets/fonts/greatvibes.ttf")
          );
          const greatVibesFont = await pdfDoc.embedFont(greatVibesFontBytes);
          // Pacifico
          const pacificoFontBytes = fs.readFileSync(
            path.resolve(__dirname, "../../assets/fonts/pacifico.ttf")
          );
          const pacificoFont = await pdfDoc.embedFont(pacificoFontBytes);
          // Satisfy
          const satisfyFontBytes = fs.readFileSync(
            path.resolve(__dirname, "../../assets/fonts/satisfy.ttf")
          );
          const satisfyFont = await pdfDoc.embedFont(satisfyFontBytes);

          let fontTextSignature: any = opensansFont; // Por defecto Open Sans Regular

          if (signatureFontFamily === "FF Market") {
            fontTextSignature = ffMarketFont;
          }
          if (signatureFontFamily === "Great Vibes") {
            fontTextSignature = greatVibesFont;
          }
          if (signatureFontFamily === "MadreScript") {
            fontTextSignature = madreScriptFont;
          }
          if (signatureFontFamily === "Dancing Script") {
            fontTextSignature = dancingScriptFont;
          }
          if (signatureFontFamily === "Pacifico") {
            fontTextSignature = pacificoFont;
          }
          if (signatureFontFamily === "Satisfy") {
            fontTextSignature = satisfyFont;
          }
          console.log(
            "Insertando firma como texto con fuente:",
            signatureFontFamily
          );

          console.log("Insertando firma como texto");
          // Calcular el tamaño de fuente para que el texto quepa en el área disponible
          const signatureText = sig.signatureText ?? sig.text ?? "";
          let fontSize = scaledHeight * 0.8; // tamaño inicial máximo

          // Función para medir el ancho del texto en la fuente embebida
          function measureTextWidth(text: string, font: PDFFont, size: number) {
            return font.widthOfTextAtSize(text, size);
          }

          // Reducir el fontSize hasta que el texto quepa en el ancho disponible
          while (
            fontSize > 4 &&
            measureTextWidth(signatureText, fontTextSignature, fontSize) >
              scaledWidth
          ) {
            fontSize -= 0.5;
          }

          // Centrar el texto horizontalmente en el área
          const textWidth = measureTextWidth(
            signatureText,
            fontTextSignature,
            fontSize
          );
          const textX = drawX + (scaledWidth - textWidth) / 2;
          const textY =
            pageHeight - drawY - scaledHeight + (scaledHeight - fontSize) / 2;

          console.log(
            `Dibujando texto de firma: "${signatureText}" en posición (${textX}, ${textY}), fontSize: ${fontSize}, font: ${signatureFontFamily}`
          );

          console.log(`Color de firma: ${sig.signatureColor}`);
          const rgbColor = await this.parseRgbString(
            sig.signatureColor ?? "0,0,0"
          );
          // Centrar el texto en el rectángulo (horizontalmente)
          const rectCenterX = drawX + scaledWidth / 2;
          const centeredTextX = rectCenterX - textWidth / 2;

          page.drawText(signatureText, {
            x: centeredTextX,
            y: textY,
            size: fontSize,
            font: fontTextSignature,
            color: rgbColor,
          });

          console.log(`Texto de firma "${sig.text}" dibujado correctamente`);
        } else {
          console.warn(
            `Tipo de firma no soportado o datos faltantes para signId: ${sig.id}`
          );
        }

        const optionsRect = {
          x: rectX,
          y: rectY,
          width: rectWidth,
          height: rectHeight,
          borderColor: rgb(0.8, 0.85, 0.9),
          borderWidth: 0.3,
          color: undefined,
          radius: 10.0,
          rx: 10.0,
          ry: 10.0,
        };

        page.drawRectangle(optionsRect);

        //  Dibujar Imagen By AdamoSign

        const pathAdamoSignBy = path.resolve(
          __dirname,
          "../../assets/img/adamosigned_by.png"
        );
        const buffer = fs.readFileSync(pathAdamoSignBy);
        const image = await pdfDoc.embedPng(buffer);
        console.log("AdamoSignBy insertada correctamente");

        // Insertar AdamoSignBy pequeño, arriba dentro del rectángulo
        const adamoSignWidth = 38; // ancho pequeño
        const adamoSignHeight = 7; // alto pequeño
        const adamoSignX = rectX + 4; // margen izquierdo dentro del rectángulo
        const adamoSignY = rectY + rectHeight - adamoSignHeight - 2; // parte superior dentro del rectángulo

        page.drawImage(image, {
          x: adamoSignX,
          y: adamoSignY,
          width: adamoSignWidth,
          height: adamoSignHeight,
        });

        // Dibujar texto del token
        const textX = drawX;
        const textY =
          pageHeight - drawY - scaledHeight - padding - fontSize - 2;

        page.drawText(tokenText, {
          x: textX,
          y: textY,
          size: fontSize,
          font: opensansFont,
          color: textColor,
        });
      }

      // 6) Subir PDF firmado a S3
      // 1) Guardar el PDF firmado en disco temporal
      console.log("Guardando PDF firmado en:", tmpOut);
      const signedPdfBytes = await pdfDoc.save();
      fs.writeFileSync(tmpOut, signedPdfBytes);
      console.log("PDF firmado guardado correctamente");

      const buffer = fs.readFileSync(tmpOut);
      const file: Express.Multer.File = {
        fieldname: "file",
        originalname: `${document.metadata.filename}_signed.pdf`,
        encoding: "7bit",
        mimetype: "application/pdf",
        size: buffer.length,
        buffer,
        destination: "",
        filename: "",
        path: tmpOut,
        stream: fs.createReadStream(tmpOut),
      };

      const {
        signedUrl,
        key: s3FinalKey,
        documentName,
      } = await this.s3.uploadAndGetPublicUrl(file, "documents");
      console.log(
        `PDF firmado y subido a S3: ${signedUrl} (key: ${document.metadata.s3Key})`
      );

      // 7) Limpiar archivo de salida
      fs.unlinkSync(tmpOut);

      return { signedUrl, s3FinalKey, documentName };
    } catch (err: any) {
      console.error(
        "error al firmar el pdf ",
        err.code ? `${err.code} - ${err.message}` : err.message
      );
      throw err;
    }
  }

  /**
   * Descarga el PDF firmado, calcula su hash y lo inyecta en cada página arriba a la izquierda.
   */
  async signHashPdf(document: Document, s3FinalKey: string): Promise<any> {
    // 01. Preparar directorio temporal
    const tmpBase = os.tmpdir();
    if (!fs.existsSync(tmpBase)) fs.mkdirSync(tmpBase, { recursive: true });

    // 02. Crear archivos temporales
    const tmpIn = path.join(tmpBase, `${Date.now()}-hash-in.pdf`);
    const tmpOut = path.join(tmpBase, `${Date.now()}-hash-out.pdf`);

    // 03. Descargar PDF firmado desde S3
    await this.s3.downloadToFile(s3FinalKey, tmpIn);

    // 2) Leer buffer y liberar el archivo
    const inputBuffer = fs.readFileSync(tmpIn);
    fs.unlinkSync(tmpIn);

    // 3) Calcular hash SHA256
    const hash = crypto.createHash("sha256").update(inputBuffer).digest("hex");

    // 4) Crear stream en memoria para conteo de páginas
    const inStream = new PDFRStreamForBuffer(inputBuffer);
    const reader = createReader(inStream);
    const pageCount = reader.getPagesCount();

    // 5) Iniciar Recipe e inyectar hash
    const pdfDoc = new Recipe(inputBuffer, tmpOut);
    for (let p = 1; p <= pageCount; p++) {
      const editor = pdfDoc.editPage(p);
      editor.text(`AdamoSign Envelope ID: ${hash}`, 10, 10, {
        font: "OpenSans-Regular",
        size: 8,
        color: "#0F0B0C",
      });
      editor.endPage();
    }

    // 6) Cerrar PDF con hash
    await new Promise<void>((resolve, reject) => {
      try {
        pdfDoc.endPDF(resolve);
      } catch (e) {
        reject(e);
      }
    });

    // 7) Subir a S3
    const outBuf = fs.readFileSync(tmpOut);
    const hashFile: Express.Multer.File = {
      fieldname: "file",
      originalname: `${document.metadata.filename}_hashed.pdf`,
      encoding: "7bit",
      mimetype: "application/pdf",
      size: outBuf.length,
      buffer: outBuf,
      destination: "",
      filename: "",
      path: tmpOut,
      stream: fs.createReadStream(tmpOut),
    };
    const {
      signedUrl: hashUrl,
      key: hashKey,
      documentName: hashDocName,
    } = await this.s3.uploadAndGetPublicUrl(hashFile, "documents");
    fs.unlinkSync(tmpOut);

    return {
      hashSignedUrl: hashUrl,
      hashS3Key: hashKey,
      hashDocName: hashDocName,
      hashDocument: hash,
    };
  }

  async addSignatureRecordPDf(
    document: Document,
    s3FinalKey: string,
    hash: string
  ): Promise<any> {
    // 01. Preparar directorio temporal
    const tmpBase = os.tmpdir();
    if (!fs.existsSync(tmpBase)) fs.mkdirSync(tmpBase, { recursive: true });

    // 02. Crear archivos temporales
    const tmpIn = path.join(tmpBase, `${Date.now()}-hash-in.pdf`);
    const tmpOut = path.join(tmpBase, `${Date.now()}-hash-out.pdf`);

    // 03. Descargar PDF firmado desde S3
    await this.s3.downloadToFile(s3FinalKey, tmpIn);

    // 2) Leer buffer y liberar el archivo
    const inputBuffer = fs.readFileSync(tmpIn);
    fs.unlinkSync(tmpIn);

    // 4) Crear stream en memoria para conteo de páginas
    const inStream = new PDFRStreamForBuffer(inputBuffer);
    const reader = createReader(inStream);
    const pageCount = reader.getPagesCount();

    // 5) Iniciar Recipe e inyectar hash
    const pdfDoc = new Recipe(inputBuffer, tmpOut);

    const creationDate = new Date().toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "America/Lima",
    });
    const fileName = document.filename; // por ejemplo
    const documentId = document.documentId; // UUID
    const hashFinal = hash; // Hash SHA256

    // Creacion del QR del documento firmado
    const qrCodeURI = await QRCode.toDataURL(
      document.metadata.versions[document.metadata.versions.length - 1].url,
      {
        margin: 1,
        color: {
          dark: "#000000", // Color del QR
          light: "#FFFFFFFF", // Color de fondo del QR
        },
        width: 40, // Ancho del QR
        // errorCorrectionLevel: "H", // Nivel de corrección de errores
        type: "image/png", // Tipo de imagen
      }
    );
    // End QR

    // ************** BODY TEXT **************
    // ——— 7) AÑADIR páginas NUEVAS con los participantes ———
    const blankPath = path.resolve(__dirname, "../../assets/pdf/blank.pdf");
    const participants = document.participants || [];
    const participantsPerPage = 2;
    let pageIndex = pageCount;
    const colorNeutralBlack = "#111927";
    const rectangleOptions = {
      stroke: "#E5E7EB",
      lineWidth: 0.5,
      borderRadius: 5,
    };

    const regularFontPath = path.resolve(
      __dirname,
      "../../assets/fonts/OpenSans-Regular.ttf"
    );

    const boldFontPath = path.resolve(
      __dirname,
      "../../assets/fonts/OpenSans-Bold.ttf"
    );

    const extraboldFontPath = path.resolve(
      __dirname,
      "../../assets/fonts/OpenSans-ExtraBold.ttf"
    );

    //FF Market
    const ffmarketFontPath = path.resolve(
      __dirname,
      "../../assets/fonts/ffmarket.ttf"
    );
    //MadreScript
    const madreScriptFontPath = path.resolve(
      __dirname,
      "../../assets/fonts/madrescript.ttf"
    );
    //Dancing Script
    const dancingScriptFontPath = path.resolve(
      __dirname,
      "../../assets/fonts/dancingscript.ttf"
    );
    //Great Vibes
    const greatVibesFontPath = path.resolve(
      __dirname,
      "../../assets/fonts/greatvibes.ttf"
    );
    // Pacifico
    const pacificoFontPath = path.resolve(
      __dirname,
      "../../assets/fonts/pacifico.ttf"
    );
    // Satisfy
    const satisfyFontPath = path.resolve(
      __dirname,
      "../../assets/fonts/satisfy.ttf"
    );

    // *************** PARTICIPANTS **************
    // Aplana las firmas para agruparlas por hoja
    const allSignatureBlocks = participants.flatMap((participant) =>
      participant.signatures.map((signature, sigIdx) => ({
        participant,
        signature,
        signatureIndex: sigIdx,
        participantBlockIndex: participants.indexOf(participant), // útil si deseas orden
      }))
    );

    for (let i = 0; i < allSignatureBlocks.length; i += participantsPerPage) {
      const chunk = allSignatureBlocks.slice(i, i + participantsPerPage);
      const pagePath = path.join(tmpBase, `chunk-${i}.pdf`);

      // a) duplica blank.pdf
      fs.copyFileSync(blankPath, pagePath);
      // b) escribe en esa copia
      const temporalDoc = new Recipe(pagePath, pagePath);

      temporalDoc.registerFont("OpenSans-Regular", regularFontPath);
      temporalDoc.registerFont("OpenSans-Bold", boldFontPath);
      temporalDoc.registerFont("OpenSans-ExtraBold", extraboldFontPath);

      const pageEd = temporalDoc.editPage(1);

      // ********** ADAMO SIGN RECORD LOGO **********
      // Ruta de la imagen del logo en assets
      const logoPathLogo = path.resolve(
        __dirname,
        "../../assets/img/adamosign_record.png"
      );
      if (fs.existsSync(logoPathLogo)) {
        pageEd.image(logoPathLogo, 50, 40, {
          width: 80,
          keepAspectRatio: true,
        });
      }
      /**
       * ***************************************************************
       * ******************* CABECERA ACTA DE FIRMAS *******************
       * ***************************************************************
       */
      // ********** END ADAMO SIGN RECORD LOGO **********
      // Título principal
      const textOptions = {
        font: "OpenSans-Regular",
        size: 20,
        color: "#000000",
      };

      pageEd.text("Acta de firmas", 140, 105, {
        font: "OpenSans-ExtraBold",
        size: 12,
        color: "#111927",
      });

      // Fecha
      pageEd.text(`Fecha de creación: ${creationDate} GMT-5`, 140, 125, {
        font: "OpenSans-Regular",
        size: 11,
        color: colorNeutralBlack,
      });

      // 2) Extraes la parte Base64 y creas un Buffer
      const base64Data = qrCodeURI.replace(/^data:image\/png;base64,/, "");
      const qrBuffer = Buffer.from(base64Data, "base64");

      // usa el tmp dir
      const tmpDir = os.tmpdir();
      const qrPath = path.join(tmpDir, `qr-${Date.now()}.png`);
      fs.writeFileSync(qrPath, qrBuffer);

      pageEd.image(qrPath, 50, 80, {
        width: 70,
        keepAspectRatio: true,
      });
      // Línea separadora
      pageEd.rectangle(50, 166, 500, 0.5, rectangleOptions);

      // Documento
      pageEd.text(`Documento: `, 66, 182, {
        font: "OpenSans-Bold",
        size: 8,
        color: "#6C737F",
      });
      const sanitizedFileName = `${fileName}`.replace(/\s+/g, "_") + ".pdf";
      pageEd.text(sanitizedFileName, 120, 182, {
        font: "OpenSans-Regular",
        size: 8,
        color: "#6C737F",
      });

      // Número
      pageEd.text(`Número:`, 66, 200, {
        font: "OpenSans-Bold",
        size: 8,
        color: "#6C737F",
      });
      pageEd.text(`${documentId}`, 105, 200, {
        font: "OpenSans-Regular",
        size: 8,
        color: "#6C737F",
      });

      // Hash
      pageEd.text(`Hash del documento original (SHA256):`, 66, 218, {
        font: "OpenSans-Bold",
        size: 8,
        color: "#6C737F",
      });

      pageEd.text(`${hash}`, 225, 218, {
        font: "OpenSans-Regular",
        size: 8,
        color: "#6C737F",
      });

      pageEd.rectangle(50, 242, 500, 0.5, rectangleOptions);

      // Footer "Powered by"
      pageEd.text(`Powered by:`, 410, 40, {
        font: "OpenSans-Regular",
        size: 8,
        color: "#9DA4AE",
      });

      pageEd.text(`www.adamoservices.co`, 460, 40, {
        font: "OpenSans",
        size: 8,
        color: "#111927",
      });

      // *************** PARTICIPANTS INFO **************
      // Base Y para los participantes
      // 250 es el header, 100 es el espacio entre el header y el primer participante
      // 250 es el espacio entre cada participante
      // Se multiplica por el índice del participante para posicionarlos verticalmente
      const baseHeader = 242;

      /**
       * ***************************************************************
       * ******************* LISTADO PARTICIPANTES  ********************
       * ***************************************************************
       */

      const iconParticipant = path.resolve(
        __dirname,
        "../../assets/img/participants_icon.png"
      );

      if (fs.existsSync(iconParticipant)) {
        pageEd.image(iconParticipant, 62, baseHeader + 43, {
          width: 12,
          keepAspectRatio: true,
        });
      }

      pageEd.text("Participantes del documento", 82, baseHeader + 45, {
        font: "OpenSans-Bold",
        size: 9,
        color: colorNeutralBlack,
      });

      pageEd.text(
        `${participants.length}/${participants.length} firmas`,
        500,
        baseHeader + 45,
        {
          font: "OpenSans-Regular",
          size: 8,
          color: colorNeutralBlack,
        }
      );

      let renderedSignatures = 0;
      let renderedParticipantsOnPage = new Set<string>();

      for (let idx = 0; idx < chunk.length; idx++) {
        const participant = chunk[idx];
        // }

        // chunk.forEach(async (participant, idx) => {
        const baseY = baseHeader + 90 + idx * 250;

        // participant.signatures.forEach((signature, sigIdx) => {
        // Se agregan todas las firmas de los participantes
        /**
         * ******************************************************************
         * ********************** ESPACIO PARA FIRMAS ***********************
         * ******************************************************************
         */
        let renderedSignatures = 0;
        let renderedParticipantsOnPage = new Set<string>();

        for (let idx = 0; idx < chunk.length; idx++) {
          const { participant, signature, signatureIndex } = chunk[idx];
          const baseY = baseHeader + 90 + renderedSignatures * 200;
          console.log(
            `Firma ${signatureIndex + 1} de ${participant.signatures.length}`
          );

          // if(signature.sign)

          // // if (!renderedParticipantsOnPage.has(participantKey)) {
          // //   pageEd.text(`Participante: ${participantKey}`, 60, baseY - 30, {
          // //     font: "OpenSans-Bold",
          // //     size: 12,
          // //     color: "#000000",
          // //   });
          // //   renderedParticipantsOnPage.add(participantKey);
          // // }

          // const signature = participant.signatures?.[i];
          // const signatureVersion = signature?.metadata_versions?.slice(-1)?.[i];
          const signatureVersion = signature?.metadata_versions?.slice(-1)?.[0];
          const s3Key = signatureVersion?.signatureS3Key;
          let signatureFontFamily = "";

          if (signatureFontFamily === "FF Market") {
            signatureFontFamily = "FFMarket";
          }
          if (signatureFontFamily === "Great Vibes") {
            signatureFontFamily = "GreatVibes";
          }
          if (signatureFontFamily === "MadreScript") {
            signatureFontFamily = "MadreScript";
          }
          if (signatureFontFamily === "Dancing Script") {
            signatureFontFamily = "DancingScript";
          }
          if (signatureFontFamily === "Pacifico") {
            signatureFontFamily = "Pacifico";
          }
          if (signatureFontFamily === "Satisfy") {
            signatureFontFamily = "Satisfy";
          }

          if (signatureFontFamily) {
            // temporalDoc.registerFont("FFMarket", ffmarketFontPath);
            // temporalDoc.registerFont("MadreScript", madreScriptFontPath);
            // temporalDoc.registerFont("DancingScript", dancingScriptFontPath);
            // temporalDoc.registerFont("GreatVibes", greatVibesFontPath);
            // temporalDoc.registerFont("Pacifico", pacificoFontPath);
            // temporalDoc.registerFont("Satisfy", satisfyFontPath);

            temporalDoc.registerFont(
              signatureFontFamily,
              path.join(tmpBase, `${signatureFontFamily}.ttf`)
            );

            // Área disponible
            const boxX = 80;
            const boxY = baseHeader + 90 + renderedSignatures * 200;
            const boxWidth = 160;
            const boxHeight = 60;
            const padding = 15;

            const maxImageWidth = boxWidth - padding * 2; // 130
            const maxImageHeight = boxHeight - padding * 2; // 30

            if (signature.signatureText) {
              pageEd.text(
                signature.signatureText,
                boxX + padding,
                boxY + padding + 10,
                {
                  font: signatureFontFamily,
                  size: 18,
                  color: "#111927",
                }
              );
            }
          }

          if (s3Key) {
            const signatureTmpPath = path.join(
              tmpBase,
              `${Date.now()}-${idx}-${
                participant.first_name
              }-${signatureIndex}.png`
            );

            await this.s3.downloadToFile(s3Key, signatureTmpPath);

            // Obtener dimensiones reales del PNG descargado
            const { width: realWidth, height: realHeight } =
              this.getPngDimensions(signatureTmpPath);

            // Área disponible
            const boxX = 80;
            const boxY = baseHeader + 90 + renderedSignatures * 200;
            const boxWidth = 160;
            const boxHeight = 60;
            const padding = 15;

            const maxImageWidth = boxWidth - padding * 2; // 130
            const maxImageHeight = boxHeight - padding * 2; // 30

            // Calcular el escalado proporcional
            const widthRatio = maxImageWidth / realWidth;
            const heightRatio = maxImageHeight / realHeight;
            const scaleRatio = Math.min(widthRatio, heightRatio);

            const finalWidth = realWidth * scaleRatio;
            const finalHeight = realHeight * scaleRatio;

            // Centrar la imagen dentro del área
            const centeredX = boxX + (boxWidth - finalWidth) / 2;
            const centeredY = boxY + (boxHeight - finalHeight) / 2;

            // Dibujar imagen escalada y centrada
            pageEd.image(signatureTmpPath, centeredX, centeredY, {
              width: finalWidth,
              height: finalHeight,
              keepAspectRatio: true,
            });

            fs.unlinkSync(signatureTmpPath);
          } else {
            console.warn(
              `No se encontró firma válida para ${participant.email}`
            );
          }

          const participantKey = `${participant.first_name} ${participant.last_name}`;
          const fontSizeName = 9;
          const rectX = 80;
          const rectWidth = 160;
          const rectCenterX = rectX + rectWidth / 2;
          const estimatedTextWidth = this.estimateTextWidth(
            participantKey,
            fontSizeName
          );
          const textX = rectCenterX - estimatedTextWidth / 2;

          const textY = baseHeader + 90 + renderedSignatures * 200 + 80;

          pageEd.text(participantKey, textX, textY, {
            font: "OpenSans-Bold",
            size: fontSizeName,
            color: "#111927",
          });

          const leftX = 260;
          const labelColor = "#6C737F";
          const valueColor = "#6C737F";
          const fontSize = 8;

          pageEd.text(`Email: ${participant.email}`, leftX, baseY, {
            font: "OpenSans-Regular",
            size: fontSize,
            color: labelColor,
          });

          const signedAtValue = participant.historySignatures?.signedAt
            ? typeof participant.historySignatures.signedAt === "string"
              ? participant.historySignatures.signedAt
              : new Date(participant.historySignatures.signedAt).toLocaleString(
                  "es-PE",
                  {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                    timeZone: "America/Lima",
                  }
                )
            : "-";

          pageEd.text(
            `Fecha y hora de firma: ${signedAtValue}`,
            leftX,
            baseY + 20,
            {
              font: "OpenSans-Regular",
              size: fontSize,
              color: labelColor,
            }
          );

          pageEd.text(`Token: ${participant.uuid || "-"}`, leftX, baseY + 40, {
            font: "OpenSans-Regular",
            size: fontSize,
            color: labelColor,
          });

          pageEd.text(
            `IP: ${participant.historySignatures.ip || "-"}`,
            leftX,
            baseY + 60,
            {
              font: "OpenSans-Regular",
              size: fontSize,
              color: labelColor,
            }
          );

          // Divide el userAgent en líneas de máximo 50 caracteres
          const userAgent = participant.historySignatures.userAgent || "-";
          const maxLineLength = 50;
          const lines = [];
          for (let i = 0; i < userAgent.length; i += maxLineLength) {
            lines.push(userAgent.slice(i, i + maxLineLength));
          }
          for (let i = 0; i < lines.length; i++) {
            pageEd.text(
              `Dispositivo: ${i === 0 ? lines[i] : lines[i]}`,
              leftX,
              baseY + 80 + i * 12, // 12 puntos de separación entre líneas
              {
                font: "OpenSans-Regular",
                size: fontSize,
                color: labelColor,
              }
            );
          }

          // pageEd.text(
          //   `Dispositivo: ${participant.historySignatures.userAgent || "-"}`,
          //   leftX,
          //   baseY + 80,
          //   {
          //     font: "OpenSans-Regular",
          //     size: fontSize,
          //     color: labelColor,
          //   }
          // );

          pageEd.rectangle(leftX - 20, baseY - 5, 0.5, 105, rectangleOptions);

          // Autenticación
          pageEd.text("Tipos de Autenticación:", 80, baseY + 122, {
            font: "OpenSans-Regular",
            size: fontSize,
            color: labelColor,
          });

          /**
           * **********************************************************
           * ************** VALIDACIONES DE PARTICIPANTE **************
           * **********************************************************
           */
          const iconMap: Record<string, string> = {
            facial: "../../assets/img/selfie_icon.png", // icono carita
            document: "../../assets/img/document_icon.png", // icono documento
            email: "../../assets/img/email_icon.png", // icono sobre
            phone: "../../assets/img/phone_icon.png", // icono teléfono
            identity: "../../assets/img/indentity_icon.png", // icono identity
          };

          // rectángulo del chip sin ícono
          const chiptRectOptions = {
            stroke: "#F9FAFB",
            fill: "#F9FAFB",
            thickness: 0.5,
            borderRadius: 5,
          };

          const validAuthTypes =
            participant.typeValidation?.filter(
              (type: string) => type && type.toLowerCase() !== "none"
            ) || [];

          let chipX = 78;
          const chipY = baseY + 135;
          if (validAuthTypes.length === 0) {
            const label = "Sin autenticaciones solicitadas";
            const chipPaddingX = 4;
            const chipPaddingY = 6;
            const textWidth = label.length * 4;
            const chipHeight = 20;
            const chipWidth = textWidth + chipPaddingX * 2;

            pageEd.rectangle(
              chipX,
              chipY,
              chipWidth,
              chipHeight,
              chiptRectOptions
            );

            pageEd.text(label, chipX + chipPaddingX + 4, chipY + 7, {
              font: "OpenSans-Regular",
              size: 7,
              color: "#374151",
            });
          } else {
            for (let i = 0; i < validAuthTypes.length; i++) {
              const type = validAuthTypes[i].toLowerCase();
              const label =
                {
                  facial: "Selfie",
                  document: "Foto documento de identidad",
                  email: "Verificación de email",
                  phone: "Verificación de teléfono",
                }[type] || type;

              const iconPath = path.resolve(__dirname, iconMap[type]);
              const chipPaddingX = 4;
              const chipPaddingY = 6;

              const textWidth = label.length * 4.5;
              const chipHeight = 20;
              const chipWidth = 18 + chipPaddingX + textWidth;

              // rectángulo del chip
              pageEd.rectangle(
                chipX,
                chipY,
                chipWidth,
                chipHeight,
                chiptRectOptions
              );

              // ícono (si existe)
              if (iconPath && fs.existsSync(iconPath)) {
                pageEd.image(iconPath, chipX + 5, chipY + 4, {
                  width: 12,
                  keepAspectRatio: true,
                });
              }

              // texto
              pageEd.text(label, chipX + 23, chipY + 7, {
                font: "OpenSans-Regular",
                size: 7,
                color: "#374151",
              });

              chipX += chipWidth + 8;
            }
          }

          // Cuadro envolvente de la firma
          pageEd.rectangle(70, baseY + 110, 460, 50, rectangleOptions);
          // Cuadro envolvente del participant
          pageEd.rectangle(60, baseY - 20, 480, 190, rectangleOptions);

          renderedSignatures++;
        }

        // Cuadro envolvente general
        // Al final del chunk
        pageEd.rectangle(
          50,
          baseHeader + 20,
          500,
          20 + renderedSignatures * 220,
          rectangleOptions
        );

        pageEd.endPage();
      }

      await new Promise<void>((res) => temporalDoc.endPDF(res));

      pdfDoc.appendPage(pagePath, 1);
      // fs.unlinkSync(pagePath); // limpia temp
    }

    /**
     * ******************************************************************
     * ********************** END PARA PARTICIPANTS ***********************
     * ******************************************************************
     */

    /**
     * ******************************************************************
     * ********************** ESPACIO PARA ANEXOS ***********************
     * ******************************************************************
     */
    const heightMaxPerPage = 500;
    let currentHeight = 0;
    let validAnexoItems: {
      participant: any;
      type: string;
      signedAt: string;
    }[] = [];

    for (let p = 0; p < participants.length; p++) {
      const participant = participants[p];
      if (!participant.requireValidation) continue;

      const types = participant.typeValidation ?? [];
      const signedAt =
        typeof participant.historySignatures?.signedAt === "string"
          ? participant.historySignatures.signedAt
          : new Date(
              participant.historySignatures?.signedAt || ""
            ).toLocaleString("es-PE", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
              timeZone: "America/Lima",
            });

      console.log(
        "Validaciones de participante:",
        participant.first_name,
        types
      );
      for (let t = 0; t < types.length; t++) {
        console.log("Tipo de validación:", types[t]);
        const type = types[t]?.toLowerCase() || "";
        const height = ["phone", "email"].includes(type) ? 80 : 160;

        if (currentHeight + height > heightMaxPerPage) {
          currentHeight = 0;
        }

        validAnexoItems.push({ participant, type, signedAt });
        console.log(
          `[ANEXO] Agregado: ${participant.first_name} ${participant.last_name} - ${type}`
        );
        currentHeight += height;
      }
    }

    const groupedPages: Array<typeof validAnexoItems> = [];
    let currentGroup: typeof validAnexoItems = [];
    let accumulatedHeight = 0;

    const maxHeightPerPage = 500;

    for (let i = 0; i < validAnexoItems.length; i++) {
      console.log(`Procesando anexo item ${i + 1}/${validAnexoItems.length}`);
      const item = validAnexoItems[i];
      console.log(
        `Anexo item: ${item.participant.first_name} ${item.participant.last_name}, tipo: ${item.type}, firmado: ${item.signedAt}`
      );
      const height = ["phone", "email"].includes(item.type) ? 125 : 250;
      console.log("Altura del anexo:", height);

      if (accumulatedHeight + height > heightMaxPerPage) {
        groupedPages.push(currentGroup);
        currentGroup = [];
        accumulatedHeight = 0;
      }

      currentGroup.push(item);
      accumulatedHeight += height;
      console.log(
        "Grouped pages:",
        groupedPages.map((g) =>
          g.map((item) => `${item.participant.first_name} - ${item.type}`)
        )
      );
    }

    if (currentGroup.length > 0) {
      groupedPages.push(currentGroup);
    }

    for (let pageIdx = 0; pageIdx < groupedPages.length; pageIdx++) {
      const chunk = groupedPages[pageIdx];
      const pagePath = path.join(tmpBase, `chunk-anexo-${pageIdx}.pdf`);

      // a) duplica blank.pdf
      fs.copyFileSync(blankPath, pagePath);

      // b) escribe en esa copia
      const temporalDoc = new Recipe(pagePath, pagePath);

      temporalDoc.registerFont("OpenSans-Regular", regularFontPath);
      temporalDoc.registerFont("OpenSans-Bold", boldFontPath);
      temporalDoc.registerFont("OpenSans-ExtraBold", extraboldFontPath);

      const pageEd = temporalDoc.editPage(1);

      // ********** ADAMO SIGN RECORD LOGO **********
      // Ruta de la imagen del logo en assets
      const logoPathLogo = path.resolve(
        __dirname,
        "../../assets/img/adamosign_record.png"
      );
      if (fs.existsSync(logoPathLogo)) {
        pageEd.image(logoPathLogo, 50, 40, {
          width: 80,
          keepAspectRatio: true,
        });
      }
      // ********** END ADAMO SIGN RECORD LOGO **********
      // Título principal
      const textOptions = {
        font: "OpenSans-Regular",
        size: 20,
        color: "#000000",
      };

      pageEd.text("Acta de firmas", 140, 105, {
        font: "OpenSans-ExtraBold",
        size: 12,
        color: "#111927",
      });

      // Fecha
      pageEd.text(`Fecha de creación: ${creationDate} GMT-5`, 140, 125, {
        font: "OpenSans-Regular",
        size: 11,
        color: colorNeutralBlack,
      });

      // 2) Extraes la parte Base64 y creas un Buffer
      const base64Data = qrCodeURI.replace(/^data:image\/png;base64,/, "");
      const qrBuffer = Buffer.from(base64Data, "base64");

      // usa el tmp dir
      const tmpDir = os.tmpdir();
      const qrPath = path.join(tmpDir, `qr-${Date.now()}.png`);
      fs.writeFileSync(qrPath, qrBuffer);

      pageEd.image(qrPath, 50, 80, {
        width: 70,
        keepAspectRatio: true,
      });
      // Línea separadora
      pageEd.rectangle(50, 166, 500, 0.5, rectangleOptions);

      // Documento
      pageEd.text(`Documento: `, 66, 182, {
        font: "OpenSans-Bold",
        size: 8,
        color: "#6C737F",
      });
      const sanitizedFileName = `${fileName}`.replace(/\s+/g, "_") + ".pdf";
      pageEd.text(sanitizedFileName, 120, 182, {
        font: "OpenSans-Regular",
        size: 8,
        color: "#6C737F",
      });

      // Número
      pageEd.text(`Número:`, 66, 200, {
        font: "OpenSans-Bold",
        size: 8,
        color: "#6C737F",
      });
      pageEd.text(`${documentId}`, 105, 200, {
        font: "OpenSans-Regular",
        size: 8,
        color: "#6C737F",
      });

      // Hash
      pageEd.text(`Hash del documento original (SHA256):`, 66, 218, {
        font: "OpenSans-Bold",
        size: 8,
        color: "#6C737F",
      });

      pageEd.text(`${hash}`, 225, 218, {
        font: "OpenSans-Regular",
        size: 8,
        color: "#6C737F",
      });

      pageEd.rectangle(50, 242, 500, 0.5, rectangleOptions);

      // Footer "Powered by"
      pageEd.text(`Powered by:`, 410, 40, {
        font: "OpenSans-Regular",
        size: 8,
        color: "#9DA4AE",
      });

      pageEd.text(`www.adamoservices.co`, 460, 40, {
        font: "OpenSans",
        size: 8,
        color: "#111927",
      });

      // *************** ANEXOS INFO **************
      const baseHeader = 242;

      const iconParticipant = path.resolve(
        __dirname,
        "../../assets/img/clip_anexos.png"
      );

      if (fs.existsSync(iconParticipant)) {
        pageEd.image(iconParticipant, 62, baseHeader + 43, {
          width: 8,
          keepAspectRatio: true,
        });
      }

      pageEd.text("Anexos", 82, baseHeader + 45, {
        font: "OpenSans-Bold",
        size: 9,
        color: colorNeutralBlack,
      });

      let offsetY = 0;

      for (let idx = 0; idx < chunk.length; idx++) {
        const item = chunk[idx];
        const { participant, type, signedAt } = item;

        const heightAnexo = ["phone", "email"].includes(type.toLowerCase())
          ? 80
          : 160;

        const baseY = baseHeader + 80 + offsetY;

        console.log(
          `📄 Página ${pageIdx + 1}, contiene:`,
          chunk.map((x) => `${x.participant.first_name} - ${x.type}`)
        );

        offsetY += heightAnexo + 40; // margen entre bloques

        // Nombre del firmante
        pageEd.text(
          `${participant.first_name} ${participant.last_name}`,
          62,
          baseY - 10,
          {
            font: "OpenSans-Bold",
            size: 9,
            color: colorNeutralBlack,
          }
        );

        const labelColor = "#6C737F";
        const valueColor = "#6C737F";
        const fontSize = 10;

        const chipPaddingX = 6;
        const chipPaddingY = 6;
        const chipHeight = 20;
        const marginBetweenChipAndDate = 10;

        // Traducir tipo a label legible
        const typeKey = type.toLowerCase();
        const label =
          {
            facial: "Selfie",
            document: "Foto documento de identidad",
            email: "Verificación de email",
            phone: "Verificación de teléfono",
          }[typeKey] || type;

        // Calcular ancho estimado del texto
        const textWidth = label.length * 4.5; // Aproximado para fontSize 10
        const chipWidth = textWidth + chipPaddingX * 2;

        // Posiciones base
        const chipX = 70;
        const chipY = baseY + 30;

        const chiptRectOptions = {
          stroke: "#F9FAFB",
          fill: "#F9FAFB",
          thickness: 0.5,
          borderRadius: 5,
        };

        if (typeKey === "document" || typeKey === "facial") {
          const chiptRectValidationFake = {
            stroke: "#E5E7EB",
            fill: "#E5E7EB",
            thickness: 0.5,
            borderRadius: 5,
          };
          pageEd.rectangle(70, baseY + 60, 140, 100, chiptRectValidationFake);
        }
        pageEd.rectangle(chipX, chipY, chipWidth, chipHeight, chiptRectOptions);

        // Autenticación
        pageEd.text("Tipo de Autenticación:", 70, baseY + 20, {
          font: "OpenSans-Regular",
          size: 8,
          color: "#384250",
        });

        // Texto del chip, centrado verticalmente
        pageEd.text(label, chipX + chipPaddingX, chipY + 6, {
          font: "OpenSans-Regular",
          size: 8,
          color: "#384250",
        });

        // Texto: "Fecha y hora de firma:"
        const labelDateX = chipX + chipWidth + marginBetweenChipAndDate;
        // Fecha y hora
        pageEd.text(
          `Fecha y hora de firma: ${signedAt}`,
          labelDateX,
          chipY + 6,
          {
            font: "OpenSans-Regular",
            size: 8,
            color: "#9DA4AE",
          }
        );

        // Cuadro interno
        pageEd.rectangle(62, baseY + 10, 460, heightAnexo, rectangleOptions);
      }

      // Cuadro envolvente general (cierra todos los bloques en esa hoja)
      // Al final del bucle que recorre chunk
      pageEd.rectangle(
        50,
        baseHeader + 30,
        500,
        offsetY + 70, // 90 puede ajustarse si quieres un margen inferior
        rectangleOptions
      );

      pageEd.endPage();

      /**
       * ******************************************************************
       * ************************ END PARA ANEXOS *************************
       * ******************************************************************
       */
      // );

      await new Promise<void>((res) => temporalDoc.endPDF(res));

      pdfDoc.appendPage(pagePath, 1);
      // fs.unlinkSync(pagePath); // limpia temp
    }

    // *************** END ANEXOS **************
    // 6) Guardar PDF con hash
    await new Promise<void>((resolve, reject) => {
      try {
        pdfDoc.endPDF(resolve);
      } catch (e) {
        reject(e);
      }
    });

    // 7) Subir a S3
    const outBuf = fs.readFileSync(tmpOut);
    const hashFile: Express.Multer.File = {
      fieldname: "file",
      originalname: `${document.metadata.filename}_hashed.pdf`,
      encoding: "7bit",
      mimetype: "application/pdf",
      size: outBuf.length,
      buffer: outBuf,
      destination: "",
      filename: "",
      path: tmpOut,
      stream: fs.createReadStream(tmpOut),
    };
    const {
      signedUrl: hashUrl,
      key: hashKey,
      documentName: hashDocName,
    } = await this.s3.uploadAndGetPublicUrl(hashFile, "documents");
    fs.unlinkSync(tmpOut);

    return {
      fSignedUrl: hashUrl,
      fS3Key: hashKey,
      fDocName: hashDocName,
      hash: hash,
    };
  }

  getPngDimensions(filePath: string): { width: number; height: number } {
    const buffer = fs.readFileSync(filePath);

    // PNG signature: 8 bytes
    // IHDR chunk starts at byte 8, width: bytes 16-19, height: 20-23
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);

    return { width, height };
  }

  estimateTextWidth(text: string, fontSize: number): number {
    const averageCharWidth = fontSize * 0.6; // Aproximación para Boldns
    return text.length * averageCharWidth;
  }
}
