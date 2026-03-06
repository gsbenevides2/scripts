/**
 * Este script copia os arquivos de um projeto Wake para outro projeto Wake
 * Ele não vai copiar os arquivos
 * - /node_modules
 * - package.json
 * - package-demo.json
 * - Configs/settings.json
 * - Configs/settings.json
 */

/** Roteiro de Execução
 * - Apagar todos os arquivos do projeto de destino menos os ignorados
 * - Copiar os arquivos do projeto de origem para o projeto de destino menos os ignorados
 */
import fs from "fs";
import readline from "readline";
import path from "path";

function ask(question: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise<string>((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
      rl.close();
    });
  });
}

const sourceFolder = await ask("Digite o caminho do projeto de origem: ");
console.log(`Caminho do projeto de origem: ${sourceFolder}`);
const destinationFolder = await ask("Digite o caminho do projeto de destino: ");
console.log(`Caminho do projeto de destino: ${destinationFolder}`);

const destinationPath = path.join(process.cwd(), destinationFolder);

const filesToIgnoreInDestination = [
  path.join(destinationPath, "package.json"),
  path.join(destinationPath, "package-demo.json"),
  path.join(destinationPath, "Configs/settings.json"),
];

const foldersToIgnoreInDestination = [
  path.join(destinationPath, "node_modules"),
  path.join(destinationPath, ".git"),
];

const sourcePath = path.join(process.cwd(), sourceFolder);

const filesInSourceToIgnore = [
  path.join(sourcePath, "package.json"),
  path.join(sourcePath, "package-demo.json"),
  path.join(sourcePath, "Configs/settings.json"),
];

const foldersInSourceToIgnore = [
  path.join(sourcePath, "node_modules"),
  path.join(sourcePath, ".git"),
];

function recursiveReadDir(itemPath: string): string[] {
  const files = fs.readdirSync(itemPath);
  return files
    .map((file) => {
      const filePath = path.join(itemPath, file);
      const stats = fs.statSync(filePath);
      return stats.isDirectory() ? recursiveReadDir(filePath) : [filePath];
    })
    .flat();
}

function listDestionationFilesToDelete() {
  const files = recursiveReadDir(destinationPath);
  const removedIgnoredFiles = files.filter(
    (file) =>
      !filesToIgnoreInDestination.includes(file) &&
      !foldersToIgnoreInDestination.some((folder) => file.startsWith(folder))
  );
  return removedIgnoredFiles;
}

function listFilesToCopyInSource() {
  const files = recursiveReadDir(sourcePath);
  const removedIgnoredFiles = files.filter(
    (file) =>
      !filesInSourceToIgnore.includes(file) &&
      !foldersInSourceToIgnore.some((folder) => file.startsWith(folder))
  );
  return removedIgnoredFiles;
}

function makeFilesCopyObject(files: string[]) {
  return files.map((file) => {
    return {
      source: file,
      destination: file.replace(sourcePath, destinationPath),
    };
  });
}

function deleteFiles(files: string[]) {
  files.forEach((file) => {
    fs.unlinkSync(file);
  });
}

function ensureFolderExists(filePath: string) {
  const folder = path.dirname(filePath);
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
}

function copyFiles(files: { source: string; destination: string }[]) {
  files.forEach((file) => {
    ensureFolderExists(file.destination);
    fs.copyFileSync(file.source, file.destination);
  });
}

const filesToDelete = await listDestionationFilesToDelete();
const filesToCopy = await listFilesToCopyInSource();
console.log(`Files to copy: ${filesToCopy.length}`);
console.log(`Files to delete: ${filesToDelete.length}`);
const filesToCopyObject = makeFilesCopyObject(filesToCopy);

deleteFiles(filesToDelete);
copyFiles(filesToCopyObject);
