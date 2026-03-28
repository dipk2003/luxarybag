import { jsPDF } from 'jspdf';

/**
 * Generate and download a premium invoice PDF for a given order.
 * Works entirely client-side using jsPDF — no server required.
 */
export const generateInvoicePDF = (order, brandName = 'LuxeBag') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  const fmt = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

  // ── Brand header ──────────────────────────────────────────
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(brandName.toUpperCase(), margin, y);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('TAX INVOICE', pageWidth - margin, y, { align: 'right' });
  y += 12;

  // ── Divider ───────────────────────────────────────────────
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ── Order meta ────────────────────────────────────────────
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice No:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`#${order.orderId || order.order_id || 'N/A'}`, margin + 28, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', pageWidth - margin - 50, y);
  doc.setFont('helvetica', 'normal');
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
  doc.text(orderDate, pageWidth - margin - 38, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Payment:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(order.paymentMethod || order.payment_method || 'COD', margin + 28, y);
  y += 14;

  // ── Customer details ──────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text('Bill To', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  const customerName = order.customerName || order.customer_name || 'Customer';
  doc.text(customerName, margin, y);
  y += 5;

  const phone = order.customerPhone || order.customer_phone;
  if (phone) {
    doc.text(`Phone: ${phone}`, margin, y);
    y += 5;
  }

  const email = order.customerEmail || order.customer_email;
  if (email) {
    doc.text(`Email: ${email}`, margin, y);
    y += 5;
  }

  const addressParts = [
    order.customerAddress || order.customer_address,
    order.customerCity || order.customer_city,
    order.customerState || order.customer_state,
    order.customerPincode || order.customer_pincode,
  ].filter(Boolean);

  if (addressParts.length) {
    const addressLines = doc.splitTextToSize(addressParts.join(', '), pageWidth - 2 * margin);
    doc.text(addressLines, margin, y);
    y += addressLines.length * 5;
  }
  y += 8;

  // ── Items table header ────────────────────────────────────
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 4, pageWidth - 2 * margin, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);

  const colItem = margin + 2;
  const colQty = pageWidth - margin - 60;
  const colPrice = pageWidth - margin - 35;
  const colTotal = pageWidth - margin - 2;

  doc.text('ITEM', colItem, y);
  doc.text('QTY', colQty, y, { align: 'right' });
  doc.text('PRICE', colPrice, y, { align: 'right' });
  doc.text('TOTAL', colTotal, y, { align: 'right' });
  y += 8;

  // ── Items rows ────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);

  const items = Array.isArray(order.items) ? order.items : [];

  items.forEach((item) => {
    const name = item.name || 'Product';
    const qty = item.quantity || 1;
    const price = item.price || 0;
    const total = qty * price;

    // Wrap long product names
    const nameLines = doc.splitTextToSize(name, colQty - colItem - 10);
    doc.text(nameLines, colItem, y);
    doc.text(String(qty), colQty, y, { align: 'right' });
    doc.text(fmt(price), colPrice, y, { align: 'right' });
    doc.text(fmt(total), colTotal, y, { align: 'right' });

    y += nameLines.length * 5 + 3;

    // light line
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.2);
    doc.line(margin, y - 1, pageWidth - margin, y - 1);
  });

  y += 6;

  // ── Totals ────────────────────────────────────────────────
  const subtotal = order.subtotalAmount ?? order.subtotal_amount ?? 0;
  const shipping = order.shippingAmount ?? order.shipping_amount ?? 0;
  const total = order.totalAmount ?? order.total_amount ?? subtotal;

  const drawTotal = (label, value, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 11 : 10);
    doc.text(label, colPrice - 10, y, { align: 'right' });
    doc.text(fmt(value), colTotal, y, { align: 'right' });
    y += 6;
  };

  doc.setTextColor(60, 60, 60);
  drawTotal('Subtotal', subtotal);
  drawTotal('Shipping', shipping);
  y += 2;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.4);
  doc.line(colPrice - 40, y - 3, colTotal, y - 3);
  doc.setTextColor(20, 20, 20);
  drawTotal('Total', total, true);

  // ── Footer ────────────────────────────────────────────────
  y = doc.internal.pageSize.getHeight() - 25;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text('Thank you for your purchase!', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.text(
    'This is a computer-generated invoice. No signature required.',
    pageWidth / 2,
    y,
    { align: 'center' },
  );

  // ── Save ──────────────────────────────────────────────────
  const filename = `Invoice-${order.orderId || order.order_id || 'order'}.pdf`;
  doc.save(filename);
};
