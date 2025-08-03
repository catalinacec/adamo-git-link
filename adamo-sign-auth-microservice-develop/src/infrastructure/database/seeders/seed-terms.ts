import mongoose from "mongoose";
import dotenv from "dotenv";
import { TermModel } from "../../repositories/terms.repository";

dotenv.config(); // si usas .env para conectar Mongo

async function seedTerms() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);

    const exists = await TermModel.findOne({ version: 1 });
    if (exists) {
      console.log("Términos ya existen, saltando...");
      return;
    }

    const result = await TermModel.create({
      name: "Términos y Condiciones Generales",
      description:
        "Al usar esta aplicación, aceptas cumplir con todos los términos establecidos en este documento. Esto incluye pero no se limita a: uso adecuado, confidencialidad, y políticas de privacidad.",
      version: 1,
      status: "active",
    });

    console.log("Términos insertados:", result);
  } catch (err) {
    console.error("Error al insertar términos:", err);
  } finally {
    mongoose.disconnect();
  }
}

seedTerms();
