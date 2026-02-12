const { readFile } = require('node:fs/promises');
const path = require('node:path');
const { PDFParse } = require('pdf-parse');

async function run() {
  const args = process.argv.slice(2);
  const fileArg = args.find((arg) => !arg.startsWith('--'));
  const limitArg = args.find((arg) => arg.startsWith('--limit='));
  const limit = limitArg ? Number.parseInt(limitArg.split('=')[1], 10) : null;

  if (!fileArg) {
    // eslint-disable-next-line no-console
    console.log('Usage: node scripts/parse-pdf.js <path-to-pdf> [--limit=2000]');
    process.exit(1);
  }

  const resolvedPath = path.isAbsolute(fileArg)
    ? fileArg
    : path.resolve(process.cwd(), fileArg);

  const buffer = await readFile(resolvedPath);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();

  const text =
    Number.isFinite(limit) && limit > 0 ? result.text.slice(0, limit) : result.text;

  // eslint-disable-next-line no-console
  console.log(text);
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error?.message ?? error);
  process.exit(1);
});
