/**
 * Carrega o .env da RAIZ (.env.local ou .env.prod) e executa o comando filho
 * com as variáveis injetadas no process.env.
 *
 * Uso:
 *   node scripts/with-env.js <comando> [args...]
 *   node scripts/with-env.js --dir sanity -- npx sanity dev
 *   node scripts/with-env.js --env prod -- turbo build
 *
 * Seleção do arquivo (precedência):
 *   1. --env <local|prod>
 *   2. APP_ENV=prod  -> .env.prod
 *   3. NODE_ENV=production -> .env.prod
 *   4. padrão -> .env.local
 *
 * Variáveis já definidas no ambiente (ex: Vercel) NÃO são sobrescritas.
 * Se o arquivo não existir, segue apenas com o ambiente atual (útil no CI/deploy).
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function parseArgs(argv) {
  const out = { dir: null, env: null, command: [] };
  const rest = [...argv];
  while (rest.length) {
    const token = rest.shift();
    if (token === "--") {
      out.command.push(...rest);
      break;
    }
    if (token === "--dir") {
      out.dir = rest.shift();
      continue;
    }
    if (token === "--env") {
      out.env = rest.shift();
      continue;
    }
    out.command.push(token, ...rest);
    break;
  }
  return out;
}

const { dir, env, command } = parseArgs(process.argv.slice(2));

if (command.length === 0) {
  console.error("Uso: node scripts/with-env.js [--dir <pasta>] [--env <local|prod>] -- <comando> [args...]");
  process.exit(1);
}

let which = env || null;
if (!which) {
  if (process.env.APP_ENV === "prod") which = "prod";
  else if (process.env.NODE_ENV === "production") which = "prod";
  else which = "local";
}
if (!["local", "prod"].includes(which)) {
  console.error(`❌ --env inválido: "${which}". Use "local" ou "prod".`);
  process.exit(1);
}

const rootDir = path.resolve(__dirname, "..");
const envFile = path.join(rootDir, which === "prod" ? ".env.prod" : ".env.local");

if (fs.existsSync(envFile)) {
  const dotenv = require("dotenv");
  const result = dotenv.config({ path: envFile, override: false });
  if (result.error) {
    console.error(`❌ Falha ao carregar ${envFile}:`, result.error.message);
    process.exit(1);
  }
  console.log(`✅ env: ${path.basename(envFile)}`);
} else {
  console.warn(`⚠️  ${path.basename(envFile)} não encontrado — usando variáveis do ambiente.`);
}

const cwd = dir ? path.resolve(rootDir, dir) : rootDir;
const [cmd, ...args] = command;
const res = spawnSync(cmd, args, {
  cwd,
  stdio: "inherit",
  shell: process.platform === "win32",
  env: process.env,
});

process.exit(res.status ?? 1);
