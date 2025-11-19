import React, { useMemo, useState } from 'react';
import { CaseData } from '../types';
import { Download, Printer, Trash2 } from 'lucide-react';

interface ReportTableProps {
  data: CaseData[];
  onDelete: (ids: string[]) => void;
}

export const ReportTable: React.FC<ReportTableProps> = ({ data, onDelete }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Group data by Referrer
  const groupedData = useMemo(() => {
    const groups: Record<string, CaseData[]> = {};
    data.forEach(item => {
      if (!groups[item.referrer]) {
        groups[item.referrer] = [];
      }
      groups[item.referrer].push(item);
    });
    // Sort keys alphabetically
    return Object.keys(groups).sort().reduce((acc, key) => {
      acc[key] = groups[key];
      return acc;
    }, {} as Record<string, CaseData[]>);
  }, [data]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(data.map(d => d.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = () => {
    onDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Patient Name,Test Name,Remark,Gross Amount,Discount,Payment Received,Balance,DC\n";
    
    Object.keys(groupedData).forEach(doctor => {
      csvContent += `"${doctor}",,,,,,,,\n`; 
      groupedData[doctor].forEach(row => {
        const line = [
          row.date,
          row.patientName,
          row.investigations,
          row.remark,
          row.totalFee,
          row.discount,
          row.feePaid,
          row.feeDue,
          row.dcAmount
        ].map(field => `"${field}"`).join(",");
        csvContent += line + "\n";
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "DC_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-lg border border-gray-300 overflow-hidden">
      {/* Toolbar */}
      <div className="p-3 border-b border-gray-300 flex justify-between items-center bg-gray-100 print:hidden">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wide">
            DCREPORT
          </h2>
          {selectedIds.size > 0 && (
            <button 
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
            >
              <Trash2 size={14} />
              Delete ({selectedIds.size})
            </button>
          )}
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-700 text-white text-sm font-medium rounded hover:bg-green-800 transition-colors"
            >
                <Download size={14} />
                Export
            </button>
            <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-700 text-white text-sm font-medium rounded hover:bg-blue-800 transition-colors"
            >
                <Printer size={14} />
                Print
            </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-white">
        <table className="w-full text-sm text-left border-collapse min-w-[1000px]">
          <thead className="text-gray-800 bg-[#dff0d8] sticky top-0 z-20 shadow-sm">
            <tr>
              <th className="px-2 py-2 border border-gray-400 w-10 text-center">
                <input 
                  type="checkbox" 
                  className="rounded cursor-pointer accent-blue-600"
                  checked={data.length > 0 && selectedIds.size === data.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-2 py-2 border border-gray-400 font-bold text-center w-28">Date</th>
              <th className="px-2 py-2 border border-gray-400 font-bold text-center w-64">Patient Name</th>
              <th className="px-2 py-2 border border-gray-400 font-bold text-center">Test Name</th>
              <th className="px-2 py-2 border border-gray-400 font-bold text-center w-32">Remark</th>
              <th className="px-2 py-2 border border-gray-400 font-bold text-center w-28">Gross Amount</th>
              <th className="px-2 py-2 border border-gray-400 font-bold text-center w-20">Discount</th>
              <th className="px-2 py-2 border border-gray-400 font-bold text-center w-28">Payment Received</th>
              <th className="px-2 py-2 border border-gray-400 font-bold text-center w-20">Balance</th>
              <th className="px-2 py-2 border border-gray-400 font-bold text-center w-20 bg-[#fff2cc]">DC</th>
            </tr>
          </thead>
          <tbody className="text-gray-900">
            {Object.keys(groupedData).length === 0 ? (
                <tr>
                    <td colSpan={10} className="p-8 text-center text-gray-500">No records found.</td>
                </tr>
            ) : (
                Object.entries(groupedData).map(([doctor, cases]: [string, CaseData[]]) => {
                const totalDC = cases.reduce((sum, c) => sum + c.dcAmount, 0);

                return (
                    <React.Fragment key={doctor}>
                    {/* Group Header */}
                    <tr className="bg-[#fffcf0] font-bold">
                        <td colSpan={9} className="px-2 py-1.5 border border-gray-400 text-left text-gray-900">
                            {doctor}
                        </td>
                        <td className="px-2 py-1.5 border border-gray-400 text-right bg-[#fff2cc]">
                            {totalDC}
                        </td>
                    </tr>
                    
                    {/* Rows */}
                    {cases.map((c) => (
                        <tr key={c.id} className={`bg-white ${c.canceled ? 'line-through text-red-600' : ''} ${selectedIds.has(c.id) ? 'bg-blue-50' : ''}`}>
                            <td className="px-2 py-1 border border-gray-300 text-center">
                              <input 
                                type="checkbox" 
                                className="rounded cursor-pointer accent-blue-600"
                                checked={selectedIds.has(c.id)}
                                onChange={() => handleSelectRow(c.id)}
                              />
                            </td>
                            <td className="px-2 py-1 border border-gray-300 whitespace-nowrap text-center">{c.date}</td>
                            <td className="px-2 py-1 border border-gray-300 text-left">{c.patientName}</td>
                            <td className="px-2 py-1 border border-gray-300 text-left truncate max-w-xs" title={c.investigations}>{c.investigations}</td>
                            <td className="px-2 py-1 border border-gray-300 text-left">{c.remark}</td>
                            <td className="px-2 py-1 border border-gray-300 text-right">{c.totalFee}</td>
                            <td className="px-2 py-1 border border-gray-300 text-right">{c.discount}</td>
                            <td className="px-2 py-1 border border-gray-300 text-right">{c.feePaid}</td>
                            <td className="px-2 py-1 border border-gray-300 text-right">{c.feeDue}</td>
                            <td className="px-2 py-1 border border-gray-300 text-right font-medium">{c.dcAmount}</td>
                        </tr>
                    ))}
                    </React.Fragment>
                );
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};