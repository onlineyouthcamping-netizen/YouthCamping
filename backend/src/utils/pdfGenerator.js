const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

/**
 * Generates a professional PDF invoice using PDFKit.
 * Returns a Buffer containing the PDF data.
 */
async function generateInvoicePDF(booking) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // --- Colors & Styling ---
      const brandColor = '#1e293b';
      const secondaryColor = '#64748b';
      const accentColor = '#059669';

      // --- Header: Logo & Invoice Info ---
      // Try to load logo if exists
      const logoPath = path.join(__dirname, '../../../frontend/public/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 120 });
      } else {
        doc.fillColor(brandColor)
           .fontSize(20)
           .font('Helvetica-Bold')
           .text('YOUTHCAMPING.', 50, 50);
      }

      doc.fillColor(brandColor)
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('INVOICE', 400, 50, { align: 'right' });

      doc.fillColor(secondaryColor)
         .fontSize(10)
         .font('Helvetica')
         .text(`Invoice No: ${booking.bookingId}`, 400, 75, { align: 'right' })
         .text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 400, 90, { align: 'right' })
         .text(`Status: ${booking.paymentStatus.toUpperCase()}`, 400, 105, { align: 'right' });

      // Horizontal line
      doc.moveTo(50, 130)
         .lineTo(550, 130)
         .strokeColor('#e2e8f0')
         .lineWidth(1)
         .stroke();

      // --- Info Section: Guest & Travel ---
      doc.fillColor(brandColor)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Guest Details', 50, 150)
         .text('Travel Details', 300, 150);

      doc.fontSize(10)
         .font('Helvetica')
         .fillColor(secondaryColor)
         .text('Full Name:', 50, 170)
         .fillColor(brandColor)
         .font('Helvetica-Bold')
         .text(booking.fullName || booking.name || 'N/A', 120, 170)
         
         .font('Helvetica')
         .fillColor(secondaryColor)
         .text('Mobile:', 50, 185)
         .fillColor(brandColor)
         .text(`+91 ${booking.mobile || booking.phone || 'N/A'}`, 120, 185);

      if (booking.email) {
        doc.font('Helvetica')
           .fillColor(secondaryColor)
           .text('Email:', 50, 200)
           .fillColor(brandColor)
           .text(booking.email, 120, 200);
      }

      doc.fontSize(10)
         .font('Helvetica')
         .fillColor(secondaryColor)
         .text('Trip:', 300, 170)
         .fillColor(brandColor)
         .font('Helvetica-Bold')
         .text(booking.tripName || booking.tripId || 'N/A', 380, 170)
         
         .font('Helvetica')
         .fillColor(secondaryColor)
         .text('Transport:', 300, 185)
         .fillColor(brandColor)
         .text(`${booking.trainClass || 'N/A'} (${booking.ticketStatus || 'N/A'})`, 380, 185)
         
         .font('Helvetica')
         .fillColor(secondaryColor)
         .text('Room:', 300, 200)
         .fillColor(brandColor)
         .text(booking.roomType || 'N/A', 380, 200);

      // --- Table Headers ---
      const tableTop = 250;
      doc.rect(50, tableTop, 500, 25).fill('#f8fafc');
      doc.fillColor(secondaryColor)
         .font('Helvetica-Bold')
         .fontSize(9)
         .text('DESCRIPTION', 60, tableTop + 8)
         .text('QUANTITY', 350, tableTop + 8)
         .text('AMOUNT', 480, tableTop + 8, { align: 'right' });

      // Table Row
      const rowTop = tableTop + 35;
      doc.fillColor(brandColor)
         .font('Helvetica')
         .fontSize(10)
         .text(`Trip Package - ${booking.tripName || booking.tripId || 'TBD'} (${booking.trainClass || 'Standard'})`, 60, rowTop)
         .text('1 Traveller', 350, rowTop)
         .font('Helvetica-Bold')
         .text(`INR ${(booking.totalAmount || 0).toLocaleString('en-IN')}`, 480, rowTop, { align: 'right' });

      doc.moveTo(50, rowTop + 20)
         .lineTo(550, rowTop + 20)
         .strokeColor('#f1f5f9')
         .stroke();

      // --- Totals Section ---
      const totalsTop = rowTop + 50;
      
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor(secondaryColor)
         .text('Subtotal:', 350, totalsTop)
         .fillColor(brandColor)
         .text(`INR ${(booking.totalAmount || 0).toLocaleString('en-IN')}`, 480, totalsTop, { align: 'right' });

      doc.fillColor(secondaryColor)
         .text('Advance Paid:', 350, totalsTop + 20)
         .fillColor(accentColor)
         .text(`- INR ${(booking.advancePaid || 0).toLocaleString('en-IN')}`, 480, totalsTop + 20, { align: 'right' });

      // Grand Total Box
      doc.rect(340, totalsTop + 40, 210, 30).fill(brandColor);
      doc.fillColor('#fff')
         .font('Helvetica-Bold')
         .fontSize(11)
         .text('BALANCE DUE', 350, totalsTop + 50)
         .fontSize(13)
         .text(`INR ${(booking.remainingAmount || 0).toLocaleString('en-IN')}`, 480, totalsTop + 48, { align: 'right' });

      // --- Footer ---
      const pageHeight = doc.page.height;
      doc.fillColor(secondaryColor)
         .fontSize(8)
         .font('Helvetica')
         .text('Thank you for choosing YouthCamping!', 50, pageHeight - 100, { align: 'center', width: 500 })
         .text('This is a computer-generated document and does not require a signature.', 50, pageHeight - 85, { align: 'center', width: 500 })
         .text('Support: support@youthcamping.com | Website: youthcamping.com', 50, pageHeight - 70, { align: 'center', width: 500 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateInvoicePDF
};
