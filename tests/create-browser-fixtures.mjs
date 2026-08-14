import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const fixtureDirectory = join(tmpdir(), "unity-hope-form-fixtures");
await mkdir(fixtureDirectory, { recursive: true });

const fixtures = [
  ["controlled-resume.pdf", Buffer.from("%PDF-1.7\nControlled Unity & Hope form test\n%%EOF")],
  ["controlled-resume.doc", Buffer.concat([
    Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
    Buffer.from("Controlled Unity & Hope DOC form test"),
  ])],
  ["controlled-resume.docx", Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x03, 0x04]),
    Buffer.from("[Content_Types].xml word/document.xml Controlled Unity & Hope DOCX form test"),
  ])],
  ["invalid-resume.exe", Buffer.from("MZ Controlled executable rejection test")],
];

for (const [filename, content] of fixtures) {
  await writeFile(join(fixtureDirectory, filename), content);
}

const oversizedPdf = Buffer.alloc((3 * 1024 * 1024) + 1, 0x20);
oversizedPdf.write("%PDF-", 0, "ascii");
await writeFile(join(fixtureDirectory, "oversized-resume.pdf"), oversizedPdf);

console.log(fixtureDirectory);
