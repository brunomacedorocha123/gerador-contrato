"use client";

export function gerarPDF(htmlContent: string) {
  if (!htmlContent) {
    alert("Gere o contrato primeiro antes de imprimir.");
    return;
  }

  const win = window.open("", "_blank");
  if (!win) {
    alert("Permita pop-ups para gerar o PDF.");
    return;
  }

  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Contrato de Compra e Venda</title>
      <style>
        @page { size: A4; margin: 8mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.6;
          color: #000;
          text-align: justify;
        }
        h1 { text-align: center; font-size: 14pt; font-weight: bold; margin-bottom: 20px; }
        h2 { text-align: center; font-size: 12pt; font-weight: bold; margin: 15px 0; }
        p { margin-bottom: 10px; }
        strong { font-weight: bold; }
      </style>
    </head>
    <body onload="setTimeout(() => window.print(), 500)">
      ${htmlContent}
    </body>
    </html>
  `);
  win.document.close();
}