import React, { useMemo } from 'react';
import { BOMResult, AppSettings } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Download, RefreshCw, Layers, FileDown, Building, Calendar, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ResultsStepProps {
  bomResult: BOMResult;
  settings: AppSettings;
  onReset: () => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

const ResultsStep: React.FC<ResultsStepProps> = ({ bomResult, settings, onReset }) => {
  const { items, metadata } = bomResult;
  
  // Recalculate total just in case, or use bomResult.totalCost
  const totalCost = useMemo(() => items.reduce((acc, item) => acc + item.amount, 0), [items]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    items.forEach(item => {
      const cat = item.category || 'Uncategorized';
      categories[cat] = (categories[cat] || 0) + item.amount;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [items]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // -- PDF HEADER --
    // Project Title
    doc.setFontSize(18);
    doc.setTextColor(41, 128, 185); // Blue
    doc.text("BILL OF MATERIALS", 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(0);
    
    let yPos = 30;
    const lineHeight = 6;
    
    // Project Meta
    if (metadata?.projectName) {
      doc.setFont('helvetica', 'bold');
      doc.text(`Project:`, 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${metadata.projectName}`, 40, yPos);
      yPos += lineHeight;
    }
    
    if (metadata?.drawingNumber) {
      doc.setFont('helvetica', 'bold');
      doc.text(`Drawing No:`, 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${metadata.drawingNumber}`, 40, yPos);
      yPos += lineHeight;
    }
    
    if (metadata?.client) {
      doc.setFont('helvetica', 'bold');
      doc.text(`Client:`, 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${metadata.client}`, 40, yPos);
      yPos += lineHeight;
    }
    
    if (metadata?.date || metadata?.totalWeight) {
        let metaStr = "";
        if (metadata.date) metaStr += `Date: ${metadata.date}   `;
        if (metadata.totalWeight) metaStr += `Weight: ${metadata.totalWeight}`;
        doc.text(metaStr, 14, yPos);
        yPos += lineHeight;
    }

    yPos += 5; // Spacer

    // -- TABLE --
    // Prepare rows
    const rows = items.map(item => [
      item.category,
      item.item,
      item.description,
      item.quantity,
      item.unit,
      item.rate.toFixed(2),
      item.amount.toFixed(2)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Item', 'Description', 'Qty', 'Unit', 'Rate (INR)', 'Amount (INR)']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 2, valign: 'middle' },
      columnStyles: {
        0: { cellWidth: 25 }, // Category
        1: { cellWidth: 30 }, // Item
        2: { cellWidth: 'auto' }, // Description
        3: { cellWidth: 15, halign: 'right' }, // Qty
        4: { cellWidth: 15 }, // Unit
        5: { cellWidth: 20, halign: 'right' }, // Rate
        6: { cellWidth: 25, halign: 'right' }  // Amount
      },
      didDrawPage: (data) => {
        // Footer page number
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${data.pageNumber}`, data.settings.margin.left, pageHeight - 10);
      }
    });

    // -- TOTALS --
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Amount: ₹${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, finalY);
    
    // -- PREPARED BY (Business Settings) --
    if (settings.businessName) {
      doc.setFontSize(10);
      doc.setTextColor(50);
      
      const pageHeight = doc.internal.pageSize.getHeight();
      let footerY = finalY + 25;
      
      // If table pushes too far down, create new page
      if (footerY > pageHeight - 40) {
        doc.addPage();
        footerY = 40;
      }
      
      doc.setDrawColor(200);
      doc.line(14, footerY, 196, footerY); // Horizontal line
      
      doc.text("Prepared By:", 14, footerY + 8);
      doc.setFont('helvetica', 'bold');
      doc.text(settings.businessName, 14, footerY + 14);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      if (settings.businessAddress) {
        doc.text(settings.businessAddress, 14, footerY + 20);
      }
      if (settings.businessContact) {
        doc.text(`Contact: ${settings.businessContact}`, 14, footerY + 26);
      }
    }

    doc.save("Detailed_BOM.pdf");
  };

  const handleDownloadCSV = () => {
    const headers = ['Category', 'Item', 'Description', 'Quantity', 'Unit', 'Rate', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...items.map(item => [
        `"${item.category}"`,
        `"${item.item}"`,
        `"${item.description}"`,
        item.quantity,
        `"${item.unit}"`,
        item.rate,
        item.amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'BOM_Estimate.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      
      {/* Metadata Card */}
      {metadata && (
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
             <FileText className="mr-2 text-blue-600" size={20} /> Project Summary
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {metadata.projectName && (
               <div className="p-3 bg-gray-50 rounded-lg">
                 <div className="text-xs text-gray-500 uppercase font-semibold">Project</div>
                 <div className="text-sm font-medium text-gray-900">{metadata.projectName}</div>
               </div>
             )}
             {metadata.client && (
               <div className="p-3 bg-gray-50 rounded-lg">
                 <div className="text-xs text-gray-500 uppercase font-semibold">Client</div>
                 <div className="text-sm font-medium text-gray-900 flex items-center">
                   <Building size={14} className="mr-1 text-gray-400" /> {metadata.client}
                 </div>
               </div>
             )}
             {metadata.drawingNumber && (
               <div className="p-3 bg-gray-50 rounded-lg">
                 <div className="text-xs text-gray-500 uppercase font-semibold">Drawing No</div>
                 <div className="text-sm font-medium text-gray-900">{metadata.drawingNumber}</div>
               </div>
             )}
             {metadata.date && (
               <div className="p-3 bg-gray-50 rounded-lg">
                 <div className="text-xs text-gray-500 uppercase font-semibold">Date</div>
                 <div className="text-sm font-medium text-gray-900 flex items-center">
                   <Calendar size={14} className="mr-1 text-gray-400" /> {metadata.date}
                 </div>
               </div>
             )}
           </div>
         </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Estimated Total Cost</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">
              ₹{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <span className="font-bold text-xl">₹</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Line Items</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">
              {items.length}
            </h3>
          </div>
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <Layers size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Table Section */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-800">Bill of Materials</h3>
            <div className="flex space-x-2">
              <button 
                onClick={handleDownloadCSV}
                className="text-xs flex items-center text-gray-600 hover:text-blue-600 font-medium px-3 py-1.5 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <Download size={14} className="mr-1.5" /> Export CSV
              </button>
              <button 
                onClick={handleDownloadPDF}
                className="text-xs flex items-center text-white bg-blue-600 hover:bg-blue-700 font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                <FileDown size={14} className="mr-1.5" /> Download PDF
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold border-b">Category</th>
                  <th className="p-4 font-semibold border-b">Item & Description</th>
                  <th className="p-4 font-semibold border-b text-right">Qty</th>
                  <th className="p-4 font-semibold border-b text-right">Unit</th>
                  <th className="p-4 font-semibold border-b text-right">Rate</th>
                  <th className="p-4 font-semibold border-b text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-500 font-medium whitespace-nowrap">{item.category}</td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{item.item}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{item.description}</div>
                    </td>
                    <td className="p-4 text-right text-gray-700">{item.quantity}</td>
                    <td className="p-4 text-right text-gray-500 text-xs">{item.unit}</td>
                    <td className="p-4 text-right text-gray-700">₹{item.rate.toFixed(2)}</td>
                    <td className="p-4 text-right font-semibold text-gray-900">₹{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={5} className="p-4 text-right font-bold text-gray-700">Total</td>
                  <td className="p-4 text-right font-bold text-blue-600">₹{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="font-semibold text-gray-800 mb-6">Cost Breakdown</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `₹${value.toFixed(2)}`}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
        >
          <RefreshCw size={18} />
          <span>Start New Estimate</span>
        </button>
      </div>
    </div>
  );
};

export default ResultsStep;