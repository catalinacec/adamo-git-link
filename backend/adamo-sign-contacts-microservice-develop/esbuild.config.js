const { build } = require("esbuild");

build({
  entryPoints: ["src/lambda.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  outfile: "dist/lambda.js",
  external: ["aws-sdk"],
  sourcemap: true,
  minify: false,
}).catch(() => process.exit(1));
