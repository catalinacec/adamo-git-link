import { createReader, PDFRStreamForBuffer, Recipe } from "muhammara";
import * as fs from "fs";
import path from "path";
import * as os from "os";
import { S3Service } from "./s3.service";
import { Document } from "../../domain/models/document.entity";
import * as crypto from "crypto";
import QRCode from "qrcode";

export class PdfSignService {
  constructor(private s3: S3Service) {}

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
    const hashFile: any = {
      // Deberia ser Express.Multer.File
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
          const signatureFontFamily = signatureVersion?.signatureFontFamily;
          const signatureText = signatureVersion?.signatureText;

          console.log("Font Family INIT: ", signatureFontFamily);
          if (signatureFontFamily) {
            let fontFamilyText = "";

            if (signatureFontFamily === "FF Market") {
              fontFamilyText = "FFMarket";
              temporalDoc.registerFont("FFMarket", ffmarketFontPath);
            }
            if (signatureFontFamily === "Great Vibes") {
              fontFamilyText = "GreatVibes";
              temporalDoc.registerFont("GreatVibes", greatVibesFontPath);
            }
            if (signatureFontFamily === "MadreScript") {
              fontFamilyText = "MadreScript";
              temporalDoc.registerFont("MadreScript", madreScriptFontPath);
            }
            if (signatureFontFamily === "Dancing Script") {
              fontFamilyText = "DancingScript";
              temporalDoc.registerFont("DancingScript", dancingScriptFontPath);
            }
            if (signatureFontFamily === "Pacifico") {
              fontFamilyText = "Pacifico";
              temporalDoc.registerFont("Pacifico", pacificoFontPath);
            }
            if (signatureFontFamily === "Satisfy") {
              fontFamilyText = "Satisfy";
              temporalDoc.registerFont("Satisfy", satisfyFontPath);
            }

            // Área disponible
            const boxX = 80;
            const boxY = baseHeader + 90 + renderedSignatures * 200;
            const boxWidth = 160;
            const boxHeight = 60;
            const padding = 15;

            const maxImageWidth = boxWidth - padding * 2; // 130
            const maxImageHeight = boxHeight - padding * 2; // 30

            if (signatureText) {
              const fontSizeSignature = 18;
              // Estimar ancho del texto
              const estimatedTextWidth = this.estimateTextWidth(
                signatureText,
                fontSizeSignature
              );
              const rectCenterX = boxX + boxWidth / 2;
              const textX = rectCenterX - estimatedTextWidth / 2;
              const textY = boxY + boxHeight / 2 + fontSizeSignature / 2; // Centrado vertical aproximado

              pageEd.text(signatureText, textX, textY, {
                font: signatureFontFamily,
                size: fontSizeSignature,
                color: "#111927",
              });
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
            baseY + 18,
            {
              font: "OpenSans-Regular",
              size: fontSize,
              color: labelColor,
            }
          );

          pageEd.text(`Token: ${participant.uuid || "-"}`, leftX, baseY + 36, {
            font: "OpenSans-Regular",
            size: fontSize,
            color: labelColor,
          });

          pageEd.text(
            `IP: ${participant.historySignatures.ip || "-"}`,
            leftX,
            baseY + 54,
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
              i === 0 ? `Dispositivo: ${lines[i]}` : lines[i],
              leftX,
              baseY + 72 + i * 12, // 12 puntos de separación entre líneas
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
    const hashFile: any = {
      // Deberia ser Express.Multer.File
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
