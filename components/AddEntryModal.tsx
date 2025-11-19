
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CaseData } from '../types';
import { REFERRERS_LIST, INVESTIGATIONS_LIST } from '../constants';

interface AddEntryModalProps {
  onClose: () => void;
  onSave: (data: CaseData) => void;
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    patientName: '',
    age: '',
    referrer: '',
    investigations: '',
    totalFee: '',
    feePaid: '',
    discount: '',
    remark: 'C/O nan'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Transform to CaseData format
    // Format date to DD MM YYYY for consistency with table
    const dateParts = formData.date.split('-');
    const formattedDate = `${dateParts[2]} ${dateParts[1]} ${dateParts[0]}`;
    
    const total = Number(formData.totalFee) || 0;
    const paid = Number(formData.feePaid) || 0;
    const discount = Number(formData.discount) || 0;
    
    // Calculate DC
    let dc = Math.round((total * 0.3) - discount);
    if (dc < 0) dc = 0;
    
    const newCase: CaseData = {
      id: Date.now().toString(),
      regNo: 'NEW',
      caseType: 'USG', // Default
      date: formattedDate,
      patientName: `${formData.patientName} ${formData.age}`,
      patientAge: formData.age,
      referrer: formData.referrer,
      investigations: formData.investigations,
      totalFee: total,
      feePaid: paid,
      feeDue: total - paid - discount,
      discount: discount,
      discountType: '',
      canceled: false,
      dcAmount: dc,
      remark: discount > 0 ? 'LESS BY DR' : formData.remark
    };

    onSave(newCase);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">Add New Entry</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <div className="col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Referrer Name</label>
            <input 
              type="text" 
              required
              list="referrer-list"
              placeholder="Select or type Dr. Name"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.referrer}
              onChange={e => setFormData({...formData, referrer: e.target.value})}
            />
            <datalist id="referrer-list">
              {REFERRERS_LIST.map((ref, index) => (
                <option key={index} value={ref} />
              ))}
            </datalist>
          </div>

          <div className="col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Patient Name</label>
            <input 
              type="text" 
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.patientName}
              onChange={e => setFormData({...formData, patientName: e.target.value})}
            />
          </div>

          <div className="col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Age (e.g., 25 YRS)</label>
            <input 
              type="text" 
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.age}
              onChange={e => setFormData({...formData, age: e.target.value})}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Investigations</label>
            <input 
              type="text" 
              required
              list="investigations-list"
              placeholder="Select or type investigation"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.investigations}
              onChange={e => setFormData({...formData, investigations: e.target.value})}
            />
            <datalist id="investigations-list">
              {INVESTIGATIONS_LIST.map((inv, index) => (
                <option key={index} value={inv} />
              ))}
            </datalist>
          </div>

          <div className="col-span-2 grid grid-cols-3 gap-3">
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Total Fee</label>
                <input 
                type="number" 
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.totalFee}
                onChange={e => setFormData({...formData, totalFee: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Discount</label>
                <input 
                type="number" 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.discount}
                onChange={e => setFormData({...formData, discount: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Paid</label>
                <input 
                type="number" 
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.feePaid}
                onChange={e => setFormData({...formData, feePaid: e.target.value})}
                />
            </div>
          </div>

          <div className="col-span-2 mt-4 flex justify-end gap-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
