const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  static generateInvoicePDF(invoiceData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const buffers = [];

        // Pipe the PDF content to buffers
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Add invoice header
        doc.fontSize(20).text('INVOICE', 50, 50);
        doc.moveDown(0.5);

        // Company info (you can customize this)
        doc.fontSize(10);
        doc.text('SPARK Therapy Services', 50, 100);
        doc.text('123 Therapy Street', 50, 115);
        doc.text('City, State 12345', 50, 130);
        doc.text('Phone: (123) 456-7890', 50, 145);
        doc.text('Email: billing@sparktherapy.com', 50, 160);

        // Invoice details
        doc.moveTo(50, 180).lineTo(550, 180).stroke();
        doc.moveDown(2);

        doc.fontSize(12);
        doc.text(`Invoice #: ${invoiceData.invoiceNumber || 'N/A'}`, 50, 200);
        doc.text(`Issue Date: ${new Date(invoiceData.issuedDate).toLocaleDateString()}`, 300, 200);

        doc.text(`Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}`, 50, 220);
        doc.text(`Status: ${invoiceData.status.toUpperCase()}`, 300, 220);

        // Customer info
        doc.moveDown(2);
        doc.fontSize(10);
        doc.text('BILL TO:', 50, doc.y);
        doc.moveDown(0.5);
        doc.text(`${invoiceData.child?.firstName} ${invoiceData.child?.lastName || ''}`, 50, doc.y);
        doc.text(`${invoiceData.parent?.name || 'N/A'}`, 50, doc.y);
        doc.text(`${invoiceData.parent?.email || 'N/A'}`, 50, doc.y);

        // Line items table
        doc.moveDown(2);
        const startY = doc.y;

        // Table headers
        doc.rect(50, startY, 300, 20).fillAndStroke('#f0f0f0', '#cccccc');
        doc.rect(350, startY, 100, 20).fillAndStroke('#f0f0f0', '#cccccc');
        doc.rect(450, startY, 100, 20).fillAndStroke('#f0f0f0', '#cccccc');

        doc.fillColor('#000').fontSize(10);
        doc.text('Description', 60, startY + 5);
        doc.text('Quantity', 360, startY + 5, { align: 'right' });
        doc.text('Amount', 460, startY + 5, { align: 'right' });

        // Line item
        const rowY = startY + 20;
        doc.rect(50, rowY, 300, 30).stroke('#cccccc');
        doc.rect(350, rowY, 100, 30).stroke('#cccccc');
        doc.rect(450, rowY, 100, 30).stroke('#cccccc');

        doc.fillColor('#000').fontSize(10);
        doc.text(invoiceData.description || 'Therapy Services', 60, rowY + 10);
        doc.text('1', 360, rowY + 10, { align: 'right' });
        doc.text(`PKR ${invoiceData.amount.toFixed(2)}`, 460, rowY + 10, { align: 'right' });

        // Totals
        const totalY = rowY + 30 + 20;
        doc.text('TOTAL:', 350, totalY, { align: 'right' });
        doc.text(`PKR ${invoiceData.amount.toFixed(2)}`, 450, totalY, { align: 'right' });

        if (invoiceData.status === 'paid' && invoiceData.paidDate) {
          doc.text('PAID ON:', 350, totalY + 20, { align: 'right' });
          doc.text(new Date(invoiceData.paidDate).toLocaleDateString(), 450, totalY + 20, { align: 'right' });
        }

        // Notes
        if (invoiceData.notes) {
          doc.moveDown(4);
          doc.text('Notes:', 50, doc.y);
          doc.moveDown(0.5);
          doc.text(invoiceData.notes, 50, doc.y, { width: 500, align: 'left' });
        }

        // Footer
        doc.moveTo(50, 750).lineTo(550, 750).stroke();
        doc.moveDown(1);
        doc.fontSize(8);
        doc.text('Thank you for your business!', 50, doc.y, { align: 'center', width: 500 });

        // Finalize the PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = PDFGenerator;