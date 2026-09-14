import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';

export const generateEventPass = async (registration, eventTitle) => {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
  const { width, height } = page.getSize();
  const margin = 50;
  const contentWidth = width - margin * 2;
  
  let cursorY = height - margin;

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const checkPageBreak = (neededSpace) => {
    if (cursorY < neededSpace + margin) {
      page = pdfDoc.addPage([595.28, 841.89]);
      cursorY = height - margin;
    }
  };

  const drawDivider = () => {
    cursorY -= 5;
    checkPageBreak(10);
    page.drawLine({
      start: { x: margin, y: cursorY },
      end: { x: width - margin, y: cursorY },
      thickness: 1,
      color: rgb(0.85, 0.85, 0.85)
    });
    cursorY -= 15;
  };

  const drawWrappedText = (text, size, x, y, maxWidth, fontType, color = rgb(0, 0, 0)) => {
    if (text === undefined || text === null) return y;
    const words = String(text).split(' ');
    let line = '';
    let currentY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = fontType.widthOfTextAtSize(testLine, size);
      if (metrics > maxWidth && n > 0) {
        page.drawText(line.trim(), { x, y: currentY, size, font: fontType, color });
        line = words[n] + ' ';
        currentY -= (size + 5);
      } else {
        line = testLine;
      }
    }
    page.drawText(line.trim(), { x, y: currentY, size, font: fontType, color });
    return currentY - (size + 5);
  };

  const drawDataRow = (label, value) => {
    if (value === undefined || value === null || value === '') return;
    checkPageBreak(25);
    const labelWidth = 140;
    const valueMaxWidth = contentWidth - labelWidth - 10;
    
    page.drawText(String(label), { x: margin, y: cursorY, size: 10, font: boldFont, color: rgb(0.4, 0.4, 0.4) });
    
    const nextY = drawWrappedText(value, 10, margin + labelWidth, cursorY, valueMaxWidth, font, rgb(0, 0, 0));
    cursorY = nextY - 4; // Extra row spacing
  };

  const drawSectionHeader = (title) => {
    checkPageBreak(40);
    cursorY -= 5;
    page.drawText(title, { x: margin, y: cursorY, size: 11, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
    cursorY -= 16;
  };

  // --- HEADER SECTION ---
  let qrCodeDims = null;
  let qrCodeImage = null;

  try {
    const qrDataUrl = await QRCode.toDataURL(registration.qrToken, {
      width: 110, 
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
    qrCodeImage = await pdfDoc.embedPng(qrDataUrl);
    qrCodeDims = qrCodeImage.scale(1);
  } catch (err) {
    console.error('QR Generation failed', err);
  }

  // Draw QR on top right
  if (qrCodeImage && qrCodeDims) {
    page.drawImage(qrCodeImage, {
      x: width - margin - qrCodeDims.width,
      y: cursorY - qrCodeDims.height,
      width: qrCodeDims.width,
      height: qrCodeDims.height
    });
    
    const qrText = `ID: ${registration.qrToken}`;
    const textWidth = font.widthOfTextAtSize(qrText, 9);
    page.drawText(qrText, {
      x: width - margin - qrCodeDims.width + (qrCodeDims.width - textWidth) / 2,
      y: cursorY - qrCodeDims.height - 12,
      size: 9,
      font,
      color: rgb(0.3, 0.3, 0.3)
    });
  }

  // Draw Logo and Club Info on left
  let leftHeaderY = cursorY;
  try {
    const logoUrl = '/logo.png'; 
    const logoRes = await fetch(logoUrl);
    if (logoRes.ok) {
      const logoBuffer = await logoRes.arrayBuffer();
      const logoImage = await pdfDoc.embedPng(logoBuffer);
      const scaleFactor = 45 / logoImage.height;
      const logoWidth = logoImage.width * scaleFactor;
      page.drawImage(logoImage, {
        x: margin,
        y: leftHeaderY - 45,
        width: logoWidth,
        height: 45
      });
      
      leftHeaderY -= 15; 
      page.drawText('BRAINSTORM CLUB', { x: margin + logoWidth + 15, y: leftHeaderY, size: 16, font: boldFont, color: rgb(0, 0.33, 0.64) });
      page.drawText('LPU SCA', { x: margin + logoWidth + 15, y: leftHeaderY - 14, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
      
      leftHeaderY -= 45; // Below logo
    } else {
      leftHeaderY -= 15;
      page.drawText('BRAINSTORM CLUB', { x: margin, y: leftHeaderY, size: 16, font: boldFont, color: rgb(0, 0.33, 0.64) });
      page.drawText('LPU SCA', { x: margin, y: leftHeaderY - 14, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
      leftHeaderY -= 45;
    }
  } catch (err) {
    leftHeaderY -= 15;
    page.drawText('BRAINSTORM CLUB', { x: margin, y: leftHeaderY, size: 16, font: boldFont, color: rgb(0, 0.33, 0.64) });
    page.drawText('LPU SCA', { x: margin, y: leftHeaderY - 14, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
    leftHeaderY -= 45;
  }

  page.drawText('EVENT REGISTRATION PASS', { x: margin, y: leftHeaderY - 5, size: 13, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
  
  cursorY = Math.min(leftHeaderY - 20, cursorY - (qrCodeDims ? qrCodeDims.height + 30 : 50));
  drawDivider();

  // --- EVENT DETAILS ---
  drawSectionHeader('EVENT DETAILS');
  drawDataRow('Event', eventTitle);
  drawDataRow('Registration', registration.registrationType === 'team' ? 'Team' : 'Individual');
  
  cursorY -= 6;
  drawDivider();

  // --- PARTICIPANT DETAILS ---
  drawSectionHeader('PARTICIPANT DETAILS');
  const leader = registration.leader || registration;
  drawDataRow('Full Name', leader.fullName);
  drawDataRow('Registration Number', leader.registrationNumber);
  drawDataRow('Section', leader.section);
  drawDataRow('Email', leader.email);
  drawDataRow('Phone', leader.phone);

  // --- TEAM DETAILS ---
  if (registration.teamName) {
    cursorY -= 6;
    drawDivider();
    drawSectionHeader('TEAM DETAILS');
    drawDataRow('Team Name', registration.teamName);
    
    if (registration.registrationType === 'individual') {
      drawDataRow('Team Role', 'Leader');
      drawDataRow('Team Size', '1');
    } else {
      drawDataRow('Team Role', 'Leader');
      const size = 1 + (registration.members ? registration.members.length : 0);
      drawDataRow('Team Size', String(size));

      if (registration.members && registration.members.length > 0) {
        checkPageBreak(40);
        cursorY -= 4;
        page.drawText('Members', { x: margin, y: cursorY, size: 10, font: boldFont, color: rgb(0.4, 0.4, 0.4) });
        
        registration.members.forEach((m, i) => {
          checkPageBreak(20);
          const memberText = `${String(i + 1).padStart(2, '0')}.  ${m.fullName} (${m.registrationNumber})`;
          const nextY = drawWrappedText(memberText, 10, margin + 140, cursorY, contentWidth - 140 - 10, font, rgb(0,0,0));
          cursorY = nextY - 4;
        });
      }
    }
  }

  // --- PAYMENT DETAILS ---
  if (registration.paymentStatus) {
    cursorY -= 6;
    drawDivider();
    drawSectionHeader('PAYMENT DETAILS');
    const statusText = registration.paymentStatus.charAt(0).toUpperCase() + registration.paymentStatus.slice(1);
    drawDataRow('Status', statusText);
    drawDataRow('Transaction ID', registration.transactionId);
  }

  // --- STATUS / FOOTER ---
  cursorY -= 6;
  drawDivider();
  checkPageBreak(60);
  
  page.drawText(registration.status === 'Participated' ? 'PARTICIPATION MARKED' : 'REGISTRATION CONFIRMED', { 
    x: margin, 
    y: cursorY, 
    size: 11, 
    font: boldFont, 
    color: rgb(0.1, 0.5, 0.2) 
  });
  cursorY -= 16;
  page.drawText('Keep this pass for event entry and check-in.', { x: margin, y: cursorY, size: 10, font, color: rgb(0.4, 0.4, 0.4) });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
