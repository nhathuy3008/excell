import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// Tính tiền sau thuế = price * quantity * (1 + tax/100)
function calculateTotalAfterTax(price, taxPercent = 0, quantity = 1) {
  return price * quantity * (1 + taxPercent / 100);
}

// Tính tổng tiền xe: cộng tất cả tiền dịch vụ + tổng tiền sản phẩm (có thuế)
function calculateCarTotal(car, products) {
  let total = 0;
  (car.repairContents || []).forEach(rc => {
    const rcProducts = rc.products || [];
    let rcTotal = 0;

    rcProducts.forEach(p => {
      const prod = products.find(pr => pr._id === (p.product._id || p.product));
      if (prod) rcTotal += calculateTotalAfterTax(prod.price, prod.tax, p.quantity);
    });

    // Nếu không có sản phẩm mà có servicePrice thì tính thuế 8% cho dịch vụ công
    if (rcProducts.length === 0 && rc.servicePrice) {
      rcTotal += calculateTotalAfterTax(rc.servicePrice, 8, 1);
    }

    total += rcTotal;
  });
  return total;
}

const exportToExcel = async (cars, repairContents, products) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Danh sách xe');

  const styles = {
    headerFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB6D7A8' } },
    sectionFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } },
    totalFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6E0B4' } },
    borderThin: { style: 'thin', color: { argb: 'FF000000' } },
  };

  worksheet.columns = [
    { header: 'Mã SP', key: 'code', width: 15 },
    { header: 'Thương hiệu', key: 'brand', width: 20 },
    { header: 'Xuất xứ', key: 'origin', width: 15 },
    { header: 'Thông số', key: 'specs', width: 30 },
    { header: 'Đơn vị', key: 'unit', width: 10 },
    { header: 'Thuế', key: 'tax', width: 8 },
    { header: 'Số lượng', key: 'quantity', width: 10 },
    { header: 'Giá', key: 'price', width: 15 },
    { header: 'Tiền sau thuế', key: 'totalAfterTax', width: 20 },
    { header: 'Giải pháp', key: 'solutions', width: 25 },
    { header: 'Trạng thái', key: 'statuses', width: 25 },
  ];

  const formatMoney = (num) => num ? num.toLocaleString('vi-VN') + 'đ' : '0đ';

  let rowIndex = 1;
  let totalAllCars = 0;

  function styleCell(cell, options = {}) {
    cell.border = {
      top: styles.borderThin,
      left: styles.borderThin,
      bottom: styles.borderThin,
      right: styles.borderThin,
    };
    cell.alignment = options.alignment || { horizontal: 'center', vertical: 'middle', wrapText: true };
    if (options.font) cell.font = options.font;
    if (options.fill) cell.fill = options.fill;
  }

  function writeProductHeader(rowIndex) {
    const headerRow = worksheet.getRow(rowIndex);
    worksheet.columns.forEach((col, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = col.header;
      styleCell(cell, { fill: styles.headerFill, font: { bold: true }, alignment: { horizontal: 'center', vertical: 'middle' } });
    });
    headerRow.height = 30;
    return rowIndex + 1;
  }

  for (const car of cars) {
    worksheet.mergeCells(`A${rowIndex}:K${rowIndex}`);
    const carRow = worksheet.getRow(rowIndex);
    const carHeader = `Biển số: ${car.plateNumber} | Loại xe: ${car.carType?.name || ''}`;
    carRow.getCell(1).value = carHeader;
    carRow.getCell(1).fill = styles.sectionFill;
    carRow.getCell(1).font = { bold: true, size: 14 };
    carRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    carRow.height = 35;
    rowIndex++;

    for (const rc of car.repairContents || []) {
      worksheet.mergeCells(`A${rowIndex}:K${rowIndex}`);
      const rcRow = worksheet.getRow(rowIndex);
      const rcName = repairContents.find(item => item._id === (typeof rc.repairContent === 'object' ? rc.repairContent._id : rc.repairContent))?.name
        || rc.name
        || 'Không có tên';
      rcRow.getCell(1).value = `Nội dung sửa chữa: ${rcName}`;
      rcRow.getCell(1).fill = styles.headerFill;
      rcRow.getCell(1).font = { bold: true };
      rcRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
      rcRow.height = 30;
      rowIndex++;

      rowIndex = writeProductHeader(rowIndex);

      const rcProducts = rc.products || [];
      const validProducts = rcProducts.filter(p => products.find(prod => prod._id === (p.product._id || p.product)));

      if (validProducts.length) {
        validProducts.forEach(p => {
          const prod = products.find(pr => pr._id === (p.product._id || p.product));
          if (!prod) return;

          const row = worksheet.getRow(rowIndex);
          row.getCell(1).value = prod.code;
          row.getCell(2).value = prod.brand || 'N/A';
          row.getCell(3).value = prod.origin || 'N/A';
          const specsArray = (prod.specs || []);
          row.getCell(4).value = specsArray.length > 0
            ? specsArray.map(s => `• ${s}`).join('\n')
            : 'N/A';
          row.getCell(5).value = prod.unit?.name || 'N/A';
          row.getCell(6).value = prod.tax ? `${prod.tax}%` : '0%';
          row.getCell(7).value = p.quantity || 1;
          row.getCell(8).value = formatMoney(prod.price);
          row.getCell(9).value = formatMoney(calculateTotalAfterTax(prod.price, prod.tax, p.quantity));
          row.getCell(10).value = p.solutions?.map(sol => sol.name).join(', ') || 'Chưa có';
          row.getCell(11).value = p.statuses?.map(st => st.name).join(', ') || 'Chưa có';

          [8, 9].forEach(ci => {
            row.getCell(ci).alignment = { horizontal: 'right', vertical: 'middle' };
          });

          [1, 2, 3, 4, 5, 6, 7, 10, 11].forEach(ci => {
            if (ci === 4) {
              row.getCell(ci).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            } else {
              row.getCell(ci).alignment = { horizontal: 'center', vertical: 'middle' };
            }
          });

          for (let ci = 1; ci <= 11; ci++) {
            styleCell(row.getCell(ci));
          }

          row.height = Math.max(specsArray.length * 30, 30);
          rowIndex++;
        });
      } else if (rc.servicePrice) {
        // Tính tiền dịch vụ công với thuế 8%
        const totalServicePrice = calculateTotalAfterTax(rc.servicePrice, 8, 1);

        const row = worksheet.getRow(rowIndex);
        row.getCell(1).value = 'Dịch vụ công';
        row.getCell(5).value = 'công';
        row.getCell(6).value = '8%';  // Thuế dịch vụ công là 8%
        row.getCell(7).value = 1;
        row.getCell(8).value = formatMoney(rc.servicePrice);
        row.getCell(9).value = formatMoney(totalServicePrice);
        row.getCell(10).value = rc.solutions?.map(sol => sol.name).join(', ') || 'Chưa có';
        row.getCell(11).value = rc.statuses?.map(st => st.name).join(', ') || 'Chưa có';

        [8, 9].forEach(ci => {
          row.getCell(ci).alignment = { horizontal: 'right', vertical: 'middle' };
        });
        [1, 5, 6, 7, 10, 11].forEach(ci => {
          row.getCell(ci).alignment = { horizontal: 'center', vertical: 'middle' };
        });

        for (let ci = 1; ci <= 11; ci++) {
          styleCell(row.getCell(ci));
        }

        row.height = 30;
        rowIndex++;
      } else {
        worksheet.mergeCells(`A${rowIndex}:K${rowIndex}`);
        const row = worksheet.getRow(rowIndex);
        row.getCell(1).value = 'Không có sản phẩm';
        row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        row.getCell(1).font = { italic: true, color: { argb: 'FF888888' } };
        row.height = 30;
        rowIndex++;
      }

      rowIndex += 2;
    }

    // Tổng tiền của từng xe
    const carTotal = calculateCarTotal(car, products);
    totalAllCars += carTotal;

    worksheet.mergeCells(`A${rowIndex}:I${rowIndex}`);
    const totalRow = worksheet.getRow(rowIndex);
    totalRow.getCell(1).value = 'Tổng tiền của xe:';
    totalRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    totalRow.getCell(1).font = { bold: true };
    totalRow.getCell(10).value = formatMoney(carTotal);
    totalRow.getCell(10).alignment = { horizontal: 'center', vertical: 'middle' };
    totalRow.getCell(10).font = { bold: true };
    totalRow.getCell(10).fill = styles.totalFill;
    totalRow.height = 30;
    rowIndex += 2;
  }

  // Tổng tiền tất cả xe
  worksheet.mergeCells(`A${rowIndex}:I${rowIndex}`);
  const totalAllRow = worksheet.getRow(rowIndex);
  totalAllRow.getCell(1).value = 'Tổng tiền tất cả xe:';
  totalAllRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  totalAllRow.getCell(1).font = { bold: true, size: 14 };
  totalAllRow.getCell(10).value = formatMoney(totalAllCars);
  totalAllRow.getCell(10).alignment = { horizontal: 'center', vertical: 'middle' };
  totalAllRow.getCell(10).font = { bold: true, size: 14 };
  totalAllRow.getCell(10).fill = styles.totalFill;
  totalAllRow.height = 30;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, 'Danh_sach_xe.xlsx');
};

export default exportToExcel;
