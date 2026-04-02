export function restockConfirmTemplate({
  itemName,
  sku,
  previousQty,
  newQty,
  addedQty,
}: {
  itemName: string;
  sku: string;
  previousQty: number;
  newQty: number;
  addedQty: number;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', Arial, sans-serif; background: #F8FAFC; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #059669, #10B981); padding: 24px; color: white; }
        .header h1 { margin: 0; font-size: 20px; }
        .content { padding: 24px; }
        .success-box { background: #F0FDF4; border-left: 4px solid #22C55E; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
        .details td { padding: 8px 12px; }
        .details td:first-child { font-weight: 600; color: #64748B; }
        .footer { padding: 16px 24px; background: #F8FAFC; text-align: center; color: #94A3B8; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Restock Confirmation</h1>
        </div>
        <div class="content">
          <div class="success-box">
            <strong>Stock Replenished</strong>
            <p>${itemName} (${sku}) has been restocked successfully.</p>
          </div>
          <table class="details">
            <tr><td>Item</td><td>${itemName}</td></tr>
            <tr><td>SKU</td><td>${sku}</td></tr>
            <tr><td>Added</td><td>+${addedQty} units</td></tr>
            <tr><td>Previous Qty</td><td>${previousQty}</td></tr>
            <tr><td>New Qty</td><td><strong>${newQty}</strong></td></tr>
          </table>
        </div>
        <div class="footer">
          <p>This is an automated notification from StockSense.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
