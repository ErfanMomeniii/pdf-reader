// Script to generate a 50+ page PDF for testing
// Run with: node generate-large-pdf.js

const fs = require('fs');

function generateLargePdf(pageCount = 55) {
  let pdf = '%PDF-1.4\n';
  let objNum = 1;
  const objects = [];

  // Catalog
  objects.push({ num: objNum++, content: '<< /Type /Catalog /Pages 2 0 R >>' });

  // Pages object - will be updated with kids
  const pagesObjNum = objNum++;
  const pageObjNums = [];
  const contentObjNums = [];

  // Font object number (will be last)
  const fontObjNum = objNum + pageCount * 2;

  // Create page and content objects
  for (let i = 0; i < pageCount; i++) {
    const pageObj = objNum++;
    const contentObj = objNum++;
    pageObjNums.push(pageObj);
    contentObjNums.push(contentObj);

    objects.push({
      num: pageObj,
      content: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentObj} 0 R /Resources << /Font << /F1 ${fontObjNum} 0 R >> >> >>`
    });

    const text = `Page ${i + 1}`;
    const stream = `BT /F1 24 Tf 100 700 Td (${text}) Tj ET`;
    objects.push({
      num: contentObj,
      content: `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
    });
  }

  // Font object
  objects.push({
    num: fontObjNum,
    content: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  });

  // Insert pages object
  const kidsStr = pageObjNums.map(n => `${n} 0 R`).join(' ');
  objects.splice(1, 0, {
    num: pagesObjNum,
    content: `<< /Type /Pages /Kids [${kidsStr}] /Count ${pageCount} >>`
  });

  // Sort by object number
  objects.sort((a, b) => a.num - b.num);

  // Build PDF
  const offsets = [];
  let pos = pdf.length;

  for (const obj of objects) {
    offsets[obj.num] = pos;
    const objStr = `${obj.num} 0 obj\n${obj.content}\nendobj\n`;
    pdf += objStr;
    pos += objStr.length;
  }

  // xref
  const xrefPos = pos;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    const offset = offsets[i] || 0;
    pdf += offset.toString().padStart(10, '0') + ' 00000 n \n';
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefPos}\n%%EOF\n`;

  return pdf;
}

const largePdf = generateLargePdf(55);
fs.writeFileSync('large-document.pdf', largePdf);
console.log('Generated large-document.pdf with 55 pages');
