export function lowStockEmailTemplate({
  itemName,
  sku,
  currentQty,
  reorderPoint,
}: {
  itemName: string;
  sku: string;
  currentQty: number;
  reorderPoint: number;
}): string {
  const isOutOfStock = currentQty === 0;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', Arial, sans-serif; background: #F8FAFC; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #1E3A5F, #2563EB); padding: 24px; color: white; }
        .header h1 { margin: 0; font-size: 20px; }
        .content { padding: 24px; }
        .alert-box { background: ${isOutOfStock ? '#FEF2F2' : '#FFFBEB'}; border-left: 4px solid ${isOutOfStock ? '#EF4444' : '#F59E0B'}; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
        .details { margin: 16px 0; }
        .details td { padding: 8px 12px; }
        .details td:first-child { font-weight: 600; color: #64748B; }
        .footer { padding: 16px 24px; background: #F8FAFC; text-align: center; color: #94A3B8; font-size: 12px; }
        .btn { display: inline-block; background: #1E3A5F; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-top: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 StockSense Alert</h1>
        </div>
        <div class="content">
          <div class="alert-box">
            <strong>${isOutOfStock ? '🔴 Out of Stock' : '⚠️ Low Stock Warning'}</strong>
            <p>${itemName} (${sku}) ${isOutOfStock ? 'is completely out of stock' : 'is below the reorder point'}.</p>
          </div>
          <table class="details">
            <tr><td>Item</td><td>${itemName}</td></tr>
            <tr><td>SKU</td><td>${sku}</td></tr>
            <tr><td>Current Quantity</td><td><strong>${currentQty}</strong></td></tr>
            <tr><td>Reorder Point</td><td>${reorderPoint}</td></tr>
          </table>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/inventory/${sku}" class="btn">View Item →</a>
        </div>
        <div class="footer">
          <p>This is an automated alert from StockSense.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
