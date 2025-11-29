import * as XLSX from 'xlsx';
import { CaseData } from '../types';

/**
 * Returns the month name from a month number (1-12)
 */
export const getMonthName = (month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || 'Unknown';
};

/**
 * Groups records by month based on the date field (format: "DD MM YYYY")
 * Returns a map where key is "MM_YYYY" and value is array of records
 */
export const groupByMonth = (data: CaseData[]): Map<string, CaseData[]> => {
  const grouped = new Map<string, CaseData[]>();
  
  data.forEach(record => {
    const parts = record.date.split(' ');
    if (parts.length === 3) {
      // parts[0] = Day, parts[1] = Month, parts[2] = Year
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      
      // Validate month is between 1-12 and year is a valid number
      if (month >= 1 && month <= 12 && !isNaN(year)) {
        const monthKey = `${parts[1]}_${parts[2]}`; // e.g., "10_2025"
        
        if (!grouped.has(monthKey)) {
          grouped.set(monthKey, []);
        }
        grouped.get(monthKey)!.push(record);
      }
    }
  });
  
  return grouped;
};

/**
 * Excel row format for export
 */
interface ExcelRow {
  'Date': string;
  'Reg No': string;
  'Patient Name': string;
  'Age': string;
  'Case Type': string;
  'Referrer': string;
  'Investigations': string;
  'Total Fee': number;
  'Fee Paid': number;
  'Fee Due': number;
  'Discount': number;
  'DC Amount': number;
  'Canceled': string;
  'Remark': string;
}

/**
 * Converts CaseData array to Excel-friendly format with proper column headers
 */
export const formatForExcel = (data: CaseData[]): ExcelRow[] => {
  return data.map(record => ({
    'Date': record.date,
    'Reg No': record.regNo,
    'Patient Name': record.patientName,
    'Age': record.patientAge,
    'Case Type': record.caseType,
    'Referrer': record.referrer,
    'Investigations': record.investigations,
    'Total Fee': record.totalFee,
    'Fee Paid': record.feePaid,
    'Fee Due': record.feeDue,
    'Discount': record.discount,
    'DC Amount': record.dcAmount,
    'Canceled': record.canceled ? 'Yes' : 'No',
    'Remark': record.remark
  }));
};

/**
 * Creates an Excel workbook from data with proper column widths
 */
const createWorkbook = (data: CaseData[]): XLSX.WorkBook => {
  const formattedData = formatForExcel(data);
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  
  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 12 },  // Date
    { wch: 10 },  // Reg No
    { wch: 25 },  // Patient Name
    { wch: 8 },   // Age
    { wch: 12 },  // Case Type
    { wch: 35 },  // Referrer
    { wch: 40 },  // Investigations
    { wch: 10 },  // Total Fee
    { wch: 10 },  // Fee Paid
    { wch: 10 },  // Fee Due
    { wch: 10 },  // Discount
    { wch: 10 },  // DC Amount
    { wch: 10 },  // Canceled
    { wch: 15 }   // Remark
  ];
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Records');
  
  return workbook;
};

/**
 * Generates filename for a month's export
 * Format: DC_Records_MonthName_Year.xlsx
 */
const getFileName = (monthKey: string): string => {
  const parts = monthKey.split('_');
  if (parts.length !== 2) {
    return `DC_Records_Unknown.xlsx`;
  }
  const [month, year] = parts;
  const monthNum = parseInt(month, 10);
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return `DC_Records_Unknown_${year}.xlsx`;
  }
  const monthName = getMonthName(monthNum);
  return `DC_Records_${monthName}_${year}.xlsx`;
};

/**
 * Exports a specific month's data to one Excel file
 */
export const exportSingleMonth = (data: CaseData[], monthKey: string): void => {
  if (data.length === 0) return;
  
  const workbook = createWorkbook(data);
  const fileName = getFileName(monthKey);
  
  XLSX.writeFile(workbook, fileName);
};

/**
 * Exports each month's data to a separate Excel file (triggers multiple downloads)
 */
export const exportAllByMonth = (data: CaseData[]): void => {
  if (data.length === 0) return;
  
  const grouped = groupByMonth(data);
  
  // Sort keys to export in chronological order
  const sortedKeys = Array.from(grouped.keys()).sort((a, b) => {
    const [monthA, yearA] = a.split('_').map(Number);
    const [monthB, yearB] = b.split('_').map(Number);
    if (yearA !== yearB) return yearA - yearB;
    return monthA - monthB;
  });
  
  // Export each month's data with a small delay between downloads
  sortedKeys.forEach((monthKey, index) => {
    const monthData = grouped.get(monthKey)!;
    
    // Use setTimeout to space out downloads slightly
    setTimeout(() => {
      exportSingleMonth(monthData, monthKey);
    }, index * 100);
  });
};
