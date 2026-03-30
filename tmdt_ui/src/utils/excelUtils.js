import * as XLSX from 'xlsx';

export const exportToExcel = (data, fileName = 'DanhSachDu Lieu') => {
    // Tạo một worksheet từ dữ liệu JSON
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Tạo một workbook mới
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    
    // Xuất file
    XLSX.writeFile(workbook, `${fileName}_${new Date().getTime()}.xlsx`);
};