// ✅ Ejecutar después de `npm ci`
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const LAYER_BASE = "layer-nodejs";
const MAX_LAYER_SIZE = 60 * 1024 * 1024; // ✅ Ajustado a 60MB

function getFolderSize(folderPath) {
  console.log(`Calculando tamaño de la carpeta: ${folderPath}`);
  return parseInt(execSync(`du -sb ${folderPath}`).toString().split("\t")[0]);
}

function getDependencyList() {
  console.log("Obteniendo lista de dependencias...");
  return Object.keys(
    JSON.parse(fs.readFileSync("package.json", "utf8")).dependencies || {}
  );
}

function createLayerFolders(groups) {
  console.log(`Creando carpetas de capas en base a ${groups.length} grupos...`);
  groups.forEach((deps, idx) => {
    console.log(
      `📦 Creando carpeta para el grupo ${idx + 1} con ${
        deps.length
      } dependencias: ${deps.join(", ")}`
    );
    const folder = `${LAYER_BASE}-${idx + 1}/nodejs`;
    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(
      `${folder}/package.json`,
      JSON.stringify(
        { dependencies: Object.fromEntries(deps.map((d) => [d, "*"])) },
        null,
        2
      )
    );
    console.log(`📦 Instalando ${deps.length} módulos en ${folder}`);
    execSync("npm install --omit=dev", { cwd: folder, stdio: "inherit" });

    console.log(`✅ Instalación completada en ${folder}`);
    // Verificación de tamaño final (opcional)
    const finalSize = getFolderSize(`${folder}/node_modules`);
    console.log(
      `📏 Tamaño de ${folder}/node_modules: ${(finalSize / 1024 / 1024).toFixed(
        2
      )} MB`
    );
    console.log(
      `📏 Tamaño final de ${folder}/node_modules: ${(
        finalSize /
        1024 /
        1024
      ).toFixed(2)} MB`
    );
  });
}

function splitIntoLayers() {
  const deps = getDependencyList();
  const groups = [];
  let currentGroup = [];

  for (const dep of deps) {
    currentGroup.push(dep);
    const testFolder = "__temp_layer/nodejs";
    fs.mkdirSync(testFolder, { recursive: true });
    fs.writeFileSync(
      `${testFolder}/package.json`,
      JSON.stringify({
        dependencies: Object.fromEntries(currentGroup.map((d) => [d, "*"])),
      })
    );

    try {
      execSync("npm install --omit=dev", { cwd: testFolder, stdio: "ignore" });
      const size = getFolderSize(`${testFolder}/node_modules`);
      if (size > MAX_LAYER_SIZE && currentGroup.length > 1) {
        currentGroup.pop();
        groups.push([...currentGroup]);
        currentGroup = [dep];
      }
    } catch {
      console.warn(
        `⚠️ Falló al instalar ${dep} en grupo actual. Forzando nueva capa.`
      );
      currentGroup.pop();
      groups.push([...currentGroup]);
      currentGroup = [dep];
    }

    fs.rmSync("__temp_layer", { recursive: true, force: true });
  }

  if (currentGroup.length) groups.push(currentGroup);
  createLayerFolders(groups);
}

splitIntoLayers();
