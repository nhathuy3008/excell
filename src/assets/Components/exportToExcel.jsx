import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

function calculateTotalAfterTax(price, taxPercent = 0, quantity = 1) {
  return price * quantity * (1 + taxPercent / 100);
}

function calculateCarTotal(car, products) {
  let total8PercentPreTax = 0;
  let total8PercentPostTax = 0;
  let total10PercentPreTax = 0;
  let total10PercentPostTax = 0;

  (car.repairContents || []).forEach(rc => {
    const rcProducts = rc.products || [];
    rcProducts.forEach(p => {
      const prod = products.find(pr => pr._id === (p.product._id || p.product));
      if (prod) {
        const preTax = prod.price * p.quantity;
        const postTax = calculateTotalAfterTax(prod.price, prod.tax, p.quantity);
        if (prod.tax === 8) {
          total8PercentPreTax += preTax;
          total8PercentPostTax += postTax;
        } else if (prod.tax === 10) {
          total10PercentPreTax += preTax;
          total10PercentPostTax += postTax;
        }
      }
    });
    if (rcProducts.length === 0 && rc.servicePrice) {
      total8PercentPreTax += rc.servicePrice;
      total8PercentPostTax += calculateTotalAfterTax(rc.servicePrice, 8, 1);
    }
  });
  const vat8Percent = total8PercentPostTax - total8PercentPreTax;
  const vat10Percent = total10PercentPostTax - total10PercentPreTax;
  const totalAmount = total8PercentPostTax + total10PercentPostTax;
  return {
    total8PercentPreTax,
    total8PercentPostTax,
    total10PercentPreTax,
    total10PercentPostTax,
    vat8Percent,
    vat10Percent,
    totalAmount
  };
}

function numberToVietnameseText(num) {
  const ChuSo = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const Tien = ['', 'nghìn', 'triệu', 'tỷ'];

  function DocSo3ChuSo(baso) {
    let tram = Math.floor(baso / 100);
    let chuc = Math.floor((baso % 100) / 10);
    let donvi = baso % 10;
    let ketQua = '';

    if (tram === 0 && chuc === 0 && donvi === 0) return '';

    if (tram !== 0) {
      ketQua += ChuSo[tram] + ' trăm';
      if (chuc === 0 && donvi !== 0) ketQua += ' linh';
    }

    if (chuc !== 0 && chuc !== 1) {
      ketQua += ' ' + ChuSo[chuc] + ' mươi';
      if (donvi === 1) ketQua += ' mốt';
      else if (donvi === 5) ketQua += ' lăm';
      else if (donvi !== 0) ketQua += ' ' + ChuSo[donvi];
    } else if (chuc === 1) {
      ketQua += ' mười';
      if (donvi === 1) ketQua += ' một';
      else if (donvi === 5) ketQua += ' lăm';
      else if (donvi !== 0) ketQua += ' ' + ChuSo[donvi];
    } else if (chuc === 0 && donvi !== 0) {
      ketQua += ' ' + ChuSo[donvi];
    }

    return ketQua;
  }

  if (num === 0) return 'Không đồng';
  let so = Math.round(num);
  let i = 0;
  let result = '';
  while (so > 0) {
    let phan = so % 1000;
    so = Math.floor(so / 1000);
    if (phan > 0) {
      result = DocSo3ChuSo(phan) + ' ' + Tien[i] + ' ' + result;
    }
    i++;
  }

  return result.trim().replace(/  +/g, ' ') + ' đồng';
}

const exportToExcel = async (cars, repairContents, products) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Danh sách xe');

  worksheet.pageSetup = {
    orientation: 'landscape',
    paperSize: 9,
    fitToPage: false,
    scale: 68,
    margins: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      header: 0.0,
      footer: 0.0
    },
    horizontalCentered: true,
    verticalCentered: false,
    blackAndWhite: false,
    draft: false,
    cellComments: 'None',
    errors: 'displayed'
  };

  worksheet.columns = [
    { header: 'Mã sản phẩm', key: 'code', width: 18 },
    { header: 'Thương hiệu', key: 'brand', width: 12 },
    { header: 'Xuất xứ', key: 'origin', width: 15 },
    { header: 'Thông số kỹ thuật', key: 'specs', width: 30 },
    { header: 'Đơn vị tính', key: 'unit', width: 12 },
    { header: 'Thuế (%)', key: 'tax', width: 10 },
    { header: 'Số lượng', key: 'quantity', width: 12 },
    { header: 'Giá bán', key: 'price', width: 18 },
    { header: 'Tiền sau thuế', key: 'totalAfterTax', width: 22 },
    { header: 'Trạng thái', key: 'statuses', width: 19 },
    { header: 'Giải pháp', key: 'solutions', width: 20 },
  ];

  const styles = {
    thickBorder: {
      top: { style: 'thick', color: { argb: 'FF000000' } },
      left: { style: 'thick', color: { argb: 'FF000000' } },
      bottom: { style: 'thick', color: { argb: 'FF000000' } },
      right: { style: 'thick', color: { argb: 'FF000000' } }
    },
    mediumBorder: {
      top: { style: 'medium', color: { argb: 'FF000000' } },
      left: { style: 'medium', color: { argb: 'FF000000' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
      right: { style: 'medium', color: { argb: 'FF000000' } }
    },
    thinBorder: {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    },
    carHeaderFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCCCC' } },
    repairContentFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F3FF' } },
    headerFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFFCC' } },
    totalFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF99' } },
    noDataFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } }
  };

  const formatMoney = (num) => num ? num.toLocaleString('vi-VN') + 'đ' : '0đ';

  let rowIndex = 1;
  let totalAllCars = 0;

  function applyCellStyle(cell, options = {}) {
    cell.border = options.border || styles.thinBorder;

    cell.alignment = options.alignment || {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
      shrinkToFit: false
    };

    if (options.font) {
      cell.font = options.font;
    }

    if (options.fill) {
      cell.fill = options.fill;
    }

    if (options.numFmt) {
      cell.numFmt = options.numFmt;
    }
  }

  function applyMergedRangeStyle(startRow, startCol, endRow, endCol, style) {
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const cell = worksheet.getCell(row, col);
        applyCellStyle(cell, style);
      }
    }
  }

  function createProductHeader(rowIndex) {
    const headerRow = worksheet.getRow(rowIndex);

    worksheet.columns.forEach((col, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = col.header;
      applyCellStyle(cell, {
        fill: styles.headerFill,
        font: { bold: true, size: 13, name: 'Arial' },
        border: styles.mediumBorder,
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }
      });
    });

    headerRow.height = 40;
    return rowIndex + 1;
  }

  for (const car of cars) {
    const carTotal = calculateCarTotal(car, products);
    totalAllCars += carTotal.totalAmount;

    worksheet.mergeCells(`A${rowIndex}:G${rowIndex}`);
    worksheet.mergeCells(`H${rowIndex}:K${rowIndex}`);

    const carHeaderText = `🚗 BIỂN SỐ: ${car.plateNumber} | LOẠI XE: ${car.carType?.name || 'N/A'}`;
    const totalAmountText = `💰 TỔNG TIỀN: ${formatMoney(carTotal.totalAmount)}`;

    const carHeaderCell = worksheet.getCell(rowIndex, 1);
    carHeaderCell.value = carHeaderText;
    applyCellStyle(carHeaderCell, {
      fill: styles.carHeaderFill,
      font: { bold: true, size: 16, name: 'Arial', color: { argb: 'FFDC143C' } },
      border: styles.thickBorder,
      alignment: { horizontal: 'left', vertical: 'middle' }
    });

    const totalAmountCell = worksheet.getCell(rowIndex, 8);
    totalAmountCell.value = totalAmountText;
    applyCellStyle(totalAmountCell, {
      fill: styles.carHeaderFill,
      font: { bold: true, size: 16, name: 'Arial', color: { argb: 'FF0066CC' } },
      border: styles.thickBorder,
      alignment: { horizontal: 'right', vertical: 'middle' }
    });

    applyMergedRangeStyle(rowIndex, 1, rowIndex, 7, {
      fill: styles.carHeaderFill,
      border: styles.thickBorder
    });
    applyMergedRangeStyle(rowIndex, 8, rowIndex, 11, {
      fill: styles.carHeaderFill,
      border: styles.thickBorder
    });

    worksheet.getRow(rowIndex).height = 80;
    rowIndex++;

    for (const rc of car.repairContents || []) {
      worksheet.mergeCells(`A${rowIndex}:K${rowIndex}`);

      const rcName = repairContents.find(item =>
        item._id === (typeof rc.repairContent === 'object' ? rc.repairContent._id : rc.repairContent)
      )?.name || rc.name || 'Không có tên';

      const rcHeaderText = `🔧 NỘI DUNG CÔNG VIỆC: ${rcName}`;

      const rcHeaderCell = worksheet.getCell(rowIndex, 1);
      rcHeaderCell.value = rcHeaderText;
      applyCellStyle(rcHeaderCell, {
        fill: styles.repairContentFill,
        font: { bold: true, size: 14, name: 'Arial', color: { argb: 'FF000000' } },
        border: styles.mediumBorder,
        alignment: { horizontal: 'center', vertical: 'middle' }
      });

      applyMergedRangeStyle(rowIndex, 1, rowIndex, 11, {
        fill: styles.repairContentFill,
        border: styles.mediumBorder
      });

      worksheet.getRow(rowIndex).height = 80;
      rowIndex++;

      rowIndex = createProductHeader(rowIndex);

      const rcProducts = rc.products || [];
      const validProducts = rcProducts.filter(p =>
        products.find(prod => prod._id === (p.product._id || p.product))
      );

      function estimateWrappedLineCount(text, columnWidth, fontSize = 15) {
        const avgCharWidth = fontSize * 0.6;
        const pxPerChar = columnWidth * 7;
        const maxCharsPerLine = Math.floor(pxPerChar / avgCharWidth);

        const lines = text.split('\n');
        return lines.reduce((count, line) => {
          return count + Math.max(1, Math.ceil(line.length / maxCharsPerLine));
        }, 0);
      }

      if (validProducts.length > 0) {
        const columnWidths = [18, 12, 15, 30, 12, 10, 12, 18, 22, 19, 20];
        columnWidths.forEach((width, index) => {
          worksheet.getColumn(index + 1).width = width;
        });

        validProducts.forEach(p => {
          const prod = products.find(pr => pr._id === (p.product._id || p.product));
          if (!prod) return;

          const total = calculateTotalAfterTax(prod.price, prod.tax, p.quantity);
          const row = worksheet.getRow(rowIndex);

          const specs = (prod.specs || []).length > 0
            ? (prod.specs || []).map(s => `• ${s}`).join('\n')
            : 'N/A';

          const statuses = p.statuses?.map(st => st.name).join(', ') || 'Chưa có';
          const solutions = p.solutions?.map(sol => sol.name).join(', ') || 'Chưa có';

          const rowData = [
            prod.code || 'N/A',
            prod.brand || 'N/A',
            prod.origin || 'N/A',
            specs,
            prod.unit?.name || 'N/A',
            prod.tax ? `${prod.tax}%` : '0%',
            p.quantity || 1,
            formatMoney(prod.price),
            formatMoney(total),
            statuses,
            solutions
          ];

          rowData.forEach((value, index) => {
            const cell = row.getCell(index + 1);
            cell.value = value;

            const isSpecsColumn = index === 3;
            applyCellStyle(cell, {
              font: { size: isSpecsColumn ? 15 : 12, name: 'Arial' },
              border: styles.thinBorder,
              alignment: {
                horizontal: 'center',
                vertical: 'middle',
                wrapText: true
              }
            });
          });

          const specsColumnWidth = columnWidths[3];
          const specsLineCount = estimateWrappedLineCount(specs, specsColumnWidth, 13);
          const baseHeight = 24;
          const lineHeight = 30;
          const paddingPixels = 20;
          row.height = baseHeight + specsLineCount * lineHeight + paddingPixels;

          const specsCell = row.getCell(4);
          applyCellStyle(specsCell, {
            font: { size: 15, name: 'Arial' },
            border: styles.thinBorder,
            alignment: {
              horizontal: 'center',
              vertical: 'middle',
              wrapText: true,
              indent: 1
            }
          });

          rowIndex++;
        });
      }

      else if (rc.servicePrice) {
        const totalServicePrice = calculateTotalAfterTax(rc.servicePrice, 8, 1);
        const row = worksheet.getRow(rowIndex);

        const serviceData = [
          'DV-CONG',
          'Dịch vụ',
          '',
          'Dịch vụ sửa chữa, bảo dưỡng',
          'Công việc',
          '8%',
          1,
          formatMoney(rc.servicePrice),
          formatMoney(totalServicePrice),
          rc.solutions?.map(sol => sol.name).join(', '),
          rc.statuses?.map(st => st.name).join(', ')
        ];

        serviceData.forEach((value, index) => {
          const cell = row.getCell(index + 1);
          cell.value = value;

          applyCellStyle(cell, {
            font: { size: 12, name: 'Arial', italic: true },
            border: styles.thinBorder,
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAFAFA' } },
            alignment: {
              horizontal: 'center',
              vertical: 'middle',
              wrapText: true
            }
          });
        });

        row.height = 40;

        rowIndex++;
      }
      else {
        worksheet.mergeCells(`A${rowIndex}:K${rowIndex}`);
        const noDataCell = worksheet.getCell(rowIndex, 1);
        noDataCell.value = '⚠️ Không có sản phẩm nào';

        applyCellStyle(noDataCell, {
          fill: styles.noDataFill,
          font: { italic: true, size: 11, color: { argb: 'FF666666' } },
          border: styles.thinBorder,
          alignment: { horizontal: 'center', vertical: 'middle' }
        });

        applyMergedRangeStyle(rowIndex, 1, rowIndex, 11, {
          fill: styles.noDataFill,
          border: styles.thinBorder
        });

        worksheet.getRow(rowIndex).height = 25;
        rowIndex++;
      }

      rowIndex++;
    }

    rowIndex += 2;
  }

  let all8PreTax = 0, all8PostTax = 0, all10PreTax = 0, all10PostTax = 0;
  cars.forEach(car => {
    const t = calculateCarTotal(car, products);
    all8PreTax += t.total8PercentPreTax;
    all8PostTax += t.total8PercentPostTax;
    all10PreTax += t.total10PercentPreTax;
    all10PostTax += t.total10PercentPostTax;
  });
  const allVat8 = all8PostTax - all8PreTax;
  const allVat10 = all10PostTax - all10PreTax;
  const allPreTax = all8PreTax + all10PreTax;
  const allVat = allVat8 + allVat10;
  const allPostTax = all8PostTax + all10PostTax;

  worksheet.getColumn(4).width = 35;
  worksheet.getColumn(5).width = 15;
  worksheet.getColumn(6).width = 15;
  worksheet.getColumn(7).width = 15;
  worksheet.getColumn(8).width = 15;

  rowIndex++;
  worksheet.mergeCells(`C${rowIndex}:D${rowIndex}`);
  worksheet.mergeCells(`E${rowIndex}:F${rowIndex}`);
  worksheet.mergeCells(`G${rowIndex}:H${rowIndex}`);
  worksheet.getCell(rowIndex, 3).value = 'Thuế suất 8%';
  worksheet.getCell(rowIndex, 5).value = 'Thuế suất 10%';
  worksheet.getCell(rowIndex, 7).value = 'Tổng cộng';

  [3, 5, 7].forEach(col => {
    const cell = worksheet.getCell(rowIndex, col);
    applyCellStyle(cell, {
      font: { bold: true, size: 18 },
      alignment: { horizontal: 'center' },
      border: styles.thickBorder,
      fill: styles.totalFill
    });
  });

  rowIndex++;
  worksheet.mergeCells(`C${rowIndex}:D${rowIndex}`);
  worksheet.mergeCells(`E${rowIndex}:F${rowIndex}`);
  worksheet.mergeCells(`G${rowIndex}:H${rowIndex}`);
  worksheet.mergeCells(`A${rowIndex}:B${rowIndex}`);
  worksheet.getCell(rowIndex, 1).value = 'Tiền trước thuế';
  worksheet.getCell(rowIndex, 3).value = formatMoney(all8PreTax);
  worksheet.getCell(rowIndex, 5).value = formatMoney(all10PreTax);
  worksheet.getCell(rowIndex, 7).value = formatMoney(allPreTax);

  rowIndex++;
  worksheet.mergeCells(`C${rowIndex}:D${rowIndex}`);
  worksheet.mergeCells(`E${rowIndex}:F${rowIndex}`);
  worksheet.mergeCells(`G${rowIndex}:H${rowIndex}`);
  worksheet.mergeCells(`A${rowIndex}:B${rowIndex}`);
  worksheet.getCell(rowIndex, 1).value = 'Thuế GTGT';
  worksheet.getCell(rowIndex, 3).value = formatMoney(allVat8);
  worksheet.getCell(rowIndex, 5).value = formatMoney(allVat10);
  worksheet.getCell(rowIndex, 7).value = formatMoney(allVat);

  rowIndex++;
  worksheet.mergeCells(`C${rowIndex}:D${rowIndex}`);
  worksheet.mergeCells(`E${rowIndex}:F${rowIndex}`);
  worksheet.mergeCells(`G${rowIndex}:H${rowIndex}`);
  worksheet.mergeCells(`A${rowIndex}:B${rowIndex}`);
  worksheet.getCell(rowIndex, 1).value = 'Tiền thanh toán';
  worksheet.getCell(rowIndex, 3).value = formatMoney(all8PostTax);
  worksheet.getCell(rowIndex, 5).value = formatMoney(all10PostTax);
  worksheet.getCell(rowIndex, 7).value = formatMoney(allPostTax);

  for (let i = rowIndex - 2; i <= rowIndex; i++) {
    [1, 3, 5, 7].forEach(col => {
      applyCellStyle(worksheet.getCell(i, col), {
        font: { bold: true, size: 16 },
        alignment: { horizontal: 'center' },
        border: styles.thickBorder
      });
    });
    worksheet.getRow(i).height = 30;
  }

  [1, 3, 5, 7].forEach(col => {
    worksheet.getCell(rowIndex, col).fill = styles.totalFill;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, 'Danh_sach_xe_chi_tiet.xlsx');
};

export default exportToExcel;