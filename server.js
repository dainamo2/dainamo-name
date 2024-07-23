const express = require('express');
const bodyParser = require('body-parser');
const { PDFDocument } = require('pdf-lib');
const fontkit = require('fontkit');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname)); // サーバーが静的ファイルを提供するように設定

// デバッグ用のシンプルなルートを追加
app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post('/create-invoice', async (req, res) => {
    const {
        customerName, issuerName, issuerAddress, issuerPhone, invoiceDate,
        transactionDate, subtotal, tax, totalAmount, dueDate, bankDetails,
        invoiceNumber
    } = req.body;

    try {
        const pdfDoc = await PDFDocument.create();
        pdfDoc.registerFontkit(fontkit);
        const fontBytes = await readFile(path.join(__dirname, 'fonts', 'NotoSansJP-Regular.otf'));
        const customFont = await pdfDoc.embedFont(fontBytes);
        const page = pdfDoc.addPage([600, 800]);
        const { width, height } = page.getSize();

        page.drawText(`請求書 # ${invoiceNumber}`, { x: 50, y: height - 50, size: 25, font: customFont });
        page.drawText(`請求日: ${invoiceDate}`, { x: 50, y: height - 80, size: 12, font: customFont });
        page.drawText(`取引年月日: ${transactionDate}`, { x: 50, y: height - 100, size: 12, font: customFont });
        page.drawText(`支払期限: ${dueDate}`, { x: 50, y: height - 120, size: 12, font: customFont });
        page.drawText(`発行者名: ${issuerName}`, { x: 50, y: height - 140, size: 12, font: customFont });
        page.drawText(`発行者の住所: ${issuerAddress}`, { x: 50, y: height - 160, size: 12, font: customFont });
        page.drawText(`発行者の電話番号: ${issuerPhone}`, { x: 50, y: height - 180, size: 12, font: customFont });
        page.drawText(`宛名（請求先）: ${customerName}`, { x: 50, y: height - 200, size: 12, font: customFont });

        page.drawText(`小計: ${subtotal} 円`, { x: 50, y: height - 240, size: 12, font: customFont });
        page.drawText(`消費税: ${tax} 円`, { x: 50, y: height - 260, size: 12, font: customFont });
        page.drawText(`合計金額: ${totalAmount} 円`, { x: 50, y: height - 280, size: 12, font: customFont });
        page.drawText(`振込先: ${bankDetails}`, { x: 50, y: height - 300, size: 12, font: customFont });
        page.drawText(`請求書番号: ${invoiceNumber}`, { x: 50, y: height - 320, size: 12, font: customFont });

        const pdfBytes = await pdfDoc.save();
        const pdfPath = path.join(__dirname, 'invoices', `invoice-${invoiceNumber}.pdf`);
        await writeFile(pdfPath, pdfBytes);

        res.status(200).send({ message: 'Invoice created successfully', downloadLink: `/invoices/invoice-${invoiceNumber}.pdf` });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Error creating invoice' });
    }
});

app.use('/invoices', express.static(path.join(__dirname, 'invoices')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

