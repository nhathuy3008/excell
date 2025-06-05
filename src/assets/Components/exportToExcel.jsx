import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

function calculateTotalAfterTax(price, taxPercent = 0, quantity = 1) {
  return price * quantity * (1 + taxPercent / 100);
}

function calculateCarTotal(car, products) {
  let total = 0;
  (car.repairContents || []).forEach(rc => {
    const rcProducts = rc.products || [];
    let rcTotal = 0;

    rcProducts.forEach(p => {
      const prod = products.find(pr => pr._id === (p.product._id || p.product));
      if (prod) rcTotal += calculateTotalAfterTax(prod.price, prod.tax, p.quantity);
    });

    if (rcProducts.length === 0 && rc.servicePrice) {
      rcTotal += calculateTotalAfterTax(rc.servicePrice, 8, 1);
    }

    total += rcTotal;
  });
  return total;
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

  // Thiết lập trang in tối ưu cho A4 ngang
  worksheet.pageSetup = {
    orientation: 'landscape',
    paperSize: 9, // A4
    fitToPage: false, // Tắt fit to page để control scale chính xác
    scale: 68, // Scale phù hợp để hiển thị tốt
    margins: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      header: 0.0,
      footer: 0.0
    },
    blackAndWhite: false,
    draft: false,
    cellComments: 'None',
    errors: 'displayed'
  };

  // Thiết lập độ rộng cột tối ưu
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
    { header: 'Trạng thái', key: 'statuses', width: 25 },
    { header: 'Giải pháp', key: 'solutions', width: 25 },
  ];

  // Định nghĩa styles chuẩn
  const styles = {
    // Border styles cho in ấn
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
    // Fill colors
    carHeaderFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCCCC' } }, // Hồng nhạt
    repairContentFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F3FF' } }, // Xanh nhạt
    headerFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFFCC' } }, // Xanh lá nhạt
    totalFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF99' } }, // Vàng nhạt
    noDataFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } } // Xám nhạt
  };

  const formatMoney = (num) => num ? num.toLocaleString('vi-VN') + 'đ' : '0đ';

  let rowIndex = 1;
  let totalAllCars = 0;

  // Hàm apply style cho cell với đầy đủ borders
  function applyCellStyle(cell, options = {}) {
    // Luôn luôn có border
    cell.border = options.border || styles.thinBorder;

    // Alignment mặc định
    cell.alignment = options.alignment || {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
      shrinkToFit: false
    };

    // Font
    if (options.font) {
      cell.font = options.font;
    }

    // Fill
    if (options.fill) {
      cell.fill = options.fill;
    }

    // Number format cho tiền
    if (options.numFmt) {
      cell.numFmt = options.numFmt;
    }
  }

  // Hàm apply style cho range đã merge
  function applyMergedRangeStyle(startRow, startCol, endRow, endCol, style) {
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const cell = worksheet.getCell(row, col);
        applyCellStyle(cell, style);
      }
    }
  }

  // Hàm tạo header cho bảng sản phẩm
  function createProductHeader(rowIndex) {
    const headerRow = worksheet.getRow(rowIndex);

    worksheet.columns.forEach((col, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = col.header;
      applyCellStyle(cell, {
        fill: styles.headerFill,
        font: { bold: true, size: 11, name: 'Arial' },
        border: styles.mediumBorder,
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }
      });
    });

    headerRow.height = 40;
    return rowIndex + 1;
  }

  // Bắt đầu xử lý từng xe
  for (const car of cars) {
    // === HEADER BIỂN SỐ XE ===
    worksheet.mergeCells(`A${rowIndex}:K${rowIndex}`);
    const carHeaderText = `🚗 BIỂN SỐ: ${car.plateNumber} | LOẠI XE: ${car.carType?.name || 'N/A'}`;

    const carHeaderCell = worksheet.getCell(rowIndex, 1);
    carHeaderCell.value = carHeaderText;
    applyCellStyle(carHeaderCell, {
      fill: styles.carHeaderFill,
      font: { bold: true, size: 16, name: 'Arial', color: { argb: 'FFDC143C' } }, // Màu đỏ
      border: styles.thickBorder,
      alignment: { horizontal: 'center', vertical: 'middle' }
    });

    // Apply style cho toàn bộ merged range
    applyMergedRangeStyle(rowIndex, 1, rowIndex, 11, {
      fill: styles.carHeaderFill,
      border: styles.thickBorder
    });

    worksheet.getRow(rowIndex).height = 35;
    rowIndex++;

    // === XỬ LÝ TỪNG REPAIR CONTENT ===
    for (const rc of car.repairContents || []) {
      // Header nội dung sửa chữa
      worksheet.mergeCells(`A${rowIndex}:K${rowIndex}`);

      const rcName = repairContents.find(item =>
        item._id === (typeof rc.repairContent === 'object' ? rc.repairContent._id : rc.repairContent)
      )?.name || rc.name || 'Không có tên';

      const rcHeaderText = `🔧 NỘI DUNG SỬA CHỮA: ${rcName}`;

      const rcHeaderCell = worksheet.getCell(rowIndex, 1);
      rcHeaderCell.value = rcHeaderText;
      applyCellStyle(rcHeaderCell, {
        fill: styles.repairContentFill,
        font: { bold: true, size: 14, name: 'Arial', color: { argb: 'FF000000' } },
        border: styles.mediumBorder,
        alignment: { horizontal: 'center', vertical: 'middle' }
      });

      // Apply style cho merged range
      applyMergedRangeStyle(rowIndex, 1, rowIndex, 11, {
        fill: styles.repairContentFill,
        border: styles.mediumBorder
      });

      worksheet.getRow(rowIndex).height = 30;
      rowIndex++;

      // Header bảng sản phẩm
      rowIndex = createProductHeader(rowIndex);

      // === XỬ LÝ PRODUCTS ===
      const rcProducts = rc.products || [];
      const validProducts = rcProducts.filter(p =>
        products.find(prod => prod._id === (p.product._id || p.product))
      );

      if (validProducts.length > 0) {
        // Thiết lập độ rộng cột một lần (có thể điều chỉnh theo thực tế)
        const columnWidths = [15, 15, 15, 40, 10, 10, 10, 15, 15, 25, 25];
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
      
            applyCellStyle(cell, {
              font: { size: 10, name: 'Arial' },
              border: styles.thinBorder,
              alignment: {
                horizontal: 'center',
                vertical: 'middle',
                wrapText: true
              }
            });
          });
      
          // Tính chiều cao dòng dựa trên nội dung dài nhất (không chỉ specs)
          const CHAR_PER_LINE = 40; // nhỏ hơn giúp an toàn hơn nếu font nhỏ
          const multiLineFields = [specs, statuses, solutions];
          const longestLineCount = Math.max(
            ...multiLineFields.map(text => {
              const lines = text.split('\n');
              return lines.reduce((acc, line) => acc + Math.ceil(line.length / CHAR_PER_LINE), 0);
            })
          );
      
          const baseHeight = 20; // dòng tối thiểu
          const lineHeight = 16; // chiều cao mỗi dòng
          row.height = baseHeight + longestLineCount * lineHeight;
      
          rowIndex++;
        });
      }
      
       else if (rc.servicePrice) {
        // Có dịch vụ công
        const totalServicePrice = calculateTotalAfterTax(rc.servicePrice, 8, 1);
        const row = worksheet.getRow(rowIndex);
      
        const serviceData = [
          'DV-CONG', // Mã
          'Dịch vụ', // Thương hiệu
          '',        // Xuất xứ
          'Dịch vụ sửa chữa, bảo dưỡng', // Thông số kỹ thuật
          'Công việc',                   // Đơn vị
          '8%',                          // Thuế
          1,                             // Số lượng
          formatMoney(rc.servicePrice),         // Đơn giá
          formatMoney(totalServicePrice),       // Thành tiền
          rc.solutions?.map(sol => sol.name).join(', '), // Giải pháp
          rc.statuses?.map(st => st.name).join(', ')     // Trạng thái
        ];
      
        serviceData.forEach((value, index) => {
          const cell = row.getCell(index + 1);
          cell.value = value;
      
          applyCellStyle(cell, {
            font: { size: 10, name: 'Arial', italic: true },
            border: styles.thinBorder,
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAFAFA' } },
            alignment: {
              horizontal: 'center',
              vertical: 'middle',
              wrapText: true
            }
          });
        });
      
        // Tăng chiều cao dòng để hiển thị nội dung tốt hơn
        row.height = 40;
      
        rowIndex++;
      }
       else {
        // Không có sản phẩm
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

      // Khoảng cách giữa các repair content
      rowIndex++;
    }

    // === TỔNG TIỀN XE ===
    const carTotal = calculateCarTotal(car, products);
    totalAllCars += carTotal;

    // Merge cells cho tổng tiền xe
    worksheet.mergeCells(`A${rowIndex}:H${rowIndex}`); // Cột 1-8: Label
    worksheet.mergeCells(`J${rowIndex}:K${rowIndex}`); // Cột 10-11: Tiền bằng chữ

    const totalRow = worksheet.getRow(rowIndex);

    // Label tổng tiền
    const totalLabelCell = totalRow.getCell(1);
    totalLabelCell.value = '💰 TỔNG TIỀN XE:';
    applyCellStyle(totalLabelCell, {
      fill: styles.totalFill,
      font: { bold: true, size: 12, name: 'Arial' },
      border: styles.mediumBorder,
      alignment: { horizontal: 'right', vertical: 'middle' }
    });

    // Số tiền
    const totalAmountCell = totalRow.getCell(9);
    totalAmountCell.value = formatMoney(carTotal);
    applyCellStyle(totalAmountCell, {
      fill: styles.totalFill,
      font: { bold: true, size: 12, name: 'Arial', color: { argb: 'FF0066CC' } },
      border: styles.mediumBorder,
      alignment: { horizontal: 'center', vertical: 'middle' }
    });

    // Tiền bằng chữ
    const totalTextCell = totalRow.getCell(10);
    totalTextCell.value = numberToVietnameseText(carTotal);
    applyCellStyle(totalTextCell, {
      fill: styles.totalFill,
      font: { bold: true, size: 10, name: 'Arial', italic: true },
      border: styles.mediumBorder,
      alignment: { horizontal: 'left', vertical: 'middle', wrapText: true }
    });

    // Apply style cho merged ranges
    applyMergedRangeStyle(rowIndex, 1, rowIndex, 8, {
      fill: styles.totalFill,
      border: styles.mediumBorder
    });
    applyMergedRangeStyle(rowIndex, 10, rowIndex, 11, {
      fill: styles.totalFill,
      border: styles.mediumBorder
    });

    // Tính chiều cao dựa vào độ dài text tiền chữ
    const moneyTextLength = numberToVietnameseText(carTotal).length;
    totalRow.height = Math.max(30, Math.ceil(moneyTextLength / 40) * 15);

    rowIndex += 2; // Khoảng cách giữa các xe
  }

  // === TỔNG TIỀN TẤT CẢ XE ===
  worksheet.mergeCells(`A${rowIndex}:H${rowIndex}`);
  worksheet.mergeCells(`J${rowIndex}:K${rowIndex}`);

  const grandTotalRow = worksheet.getRow(rowIndex);

  // Label tổng cuối
  const grandTotalLabelCell = grandTotalRow.getCell(1);
  grandTotalLabelCell.value = '🏆 TỔNG TIỀN TẤT CẢ XE:';
  applyCellStyle(grandTotalLabelCell, {
    fill: styles.totalFill,
    font: { bold: true, size: 14, name: 'Arial' },
    border: styles.thickBorder,
    alignment: { horizontal: 'right', vertical: 'middle' }
  });

  // Tổng số tiền
  const grandTotalAmountCell = grandTotalRow.getCell(9);
  grandTotalAmountCell.value = formatMoney(totalAllCars);
  applyCellStyle(grandTotalAmountCell, {
    fill: styles.totalFill,
    font: { bold: true, size: 14, name: 'Arial', color: { argb: 'FFFF0000' } },
    border: styles.thickBorder,
    alignment: { horizontal: 'center', vertical: 'middle' }
  });

  // Tổng tiền bằng chữ
  const grandTotalTextCell = grandTotalRow.getCell(10);
  grandTotalTextCell.value = numberToVietnameseText(totalAllCars);
  applyCellStyle(grandTotalTextCell, {
    fill: styles.totalFill,
    font: { bold: true, size: 12, name: 'Arial', italic: true },
    border: styles.thickBorder,
    alignment: { horizontal: 'left', vertical: 'middle', wrapText: true }
  });

  // Apply style cho merged ranges cuối
  applyMergedRangeStyle(rowIndex, 1, rowIndex, 8, {
    fill: styles.totalFill,
    border: styles.thickBorder
  });
  applyMergedRangeStyle(rowIndex, 10, rowIndex, 11, {
    fill: styles.totalFill,
    border: styles.thickBorder
  });

  const grandTotalTextLength = numberToVietnameseText(totalAllCars).length;
  grandTotalRow.height = Math.max(35, Math.ceil(grandTotalTextLength / 40) * 15);

  // === XUẤT FILE ===
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, 'Danh_sach_xe_chi_tiet.xlsx');
};

export default exportToExcel;