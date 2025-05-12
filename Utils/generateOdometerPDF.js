const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

async function generateMV103FromImage(data) {
  const pdfDoc = await PDFDocument.create();

  // Load MV103 background image
  const imgPath = path.join(__dirname, '../assets/mv103-1.png'); // Make sure file exists
  const imageBytes = fs.readFileSync(imgPath);
  const img = await pdfDoc.embedPng(imageBytes);

  // Create new page with image size
  const page = pdfDoc.addPage([img.width, img.height]);
  page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 10;

  const safe = (val) => (val !== undefined && val !== null ? val.toString() : '');

  // Draw text fields – update X/Y as needed
page.drawText(safe(data.miles),       { x: 90,  y: 662, size: fontSize, font });
page.drawText(safe(data.year),        { x: 37,  y: 208, size: fontSize, font });
page.drawText(safe(data.make),        { x: 108, y: 208, size: fontSize, font });
page.drawText(safe(data.model),       { x: 180, y: 208, size: fontSize, font });
page.drawText(safe(data.bodyStyle),   { x: 270, y: 208, size: fontSize, font });
page.drawText(safe(data.vin),         { x: 360, y: 208, size: fontSize, font });

page.drawText(safe(data.customerName), { x: 110, y: 190, size: fontSize, font });
page.drawText(safe(data.address),      { x: 40,  y: 175, size: fontSize, font });
page.drawText(safe(data.city),         { x: 40,  y: 160, size: fontSize, font });
page.drawText(safe(data.state),        { x: 210, y: 160, size: fontSize, font });
page.drawText(safe(data.zip),          { x: 260, y: 160, size: fontSize, font });
page.drawText(safe(data.date),         { x: 370, y: 160, size: fontSize, font });


// Signature
if (data.signatureBase64) {
  const signatureImage = await pdfDoc.embedPng(data.signatureBase64);
  page.drawImage(signatureImage, {
    x: 40,
    y: 192, // slightly above seller name
    width: 60,
    height: 20
  });
}

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

module.exports = generateMV103FromImage;
