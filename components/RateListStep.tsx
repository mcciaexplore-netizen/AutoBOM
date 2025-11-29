import React, { useRef, useState } from 'react';
import { FileText, Database, Upload, AlertCircle, Info } from 'lucide-react';

interface RateListStepProps {
  rateList: string;
  setRateList: (val: string) => void;
  onNext: () => void;
}

const EXAMPLE_RATES = `Profile 45x90, 959.04, Meter
Profile 45x45 (Medium Duty), 630.00, Meter
Profile 30x30, 242.58, Meter
Profile 40x40 (Heavy Duty), 598.62, Meter
Polycarbonate Sheet (6mm), 850.00, Sq.m
MS Sheet (2mm), 55.00, Kg
Powder Coating (RAL 7035), 150.00, Sq.m
Hinges (Misumi C-HHDL8), 85.00, Nos
Door Handle (C-NUWUAN109), 65.00, Nos
T-Nuts M8, 9.00, Nos
Allen Bolts M8x16, 3.04, Nos
End Caps 45x45, 12.00, Nos`;

const RateListStep: React.FC<RateListStepProps> = ({ rateList, setRateList, onNext }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleLoadExample = () => {
    setRateList(EXAMPLE_RATES);
    setError(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    try {
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        setRateList(prev => {
          const separator = prev.trim() ? '\n' : '';
          return prev + separator + text;
        });
      } else {
        setError("Unsupported file format. Please upload .csv");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to parse file. Please ensure it is a valid CSV file.");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-gray-100 gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shadow-inner">
              <Database size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Define Your Rates</h2>
              <p className="text-sm text-gray-500 mt-1">
                Provide your standard pricing (INR ₹) to generate accurate estimates.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
             <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-none justify-center text-sm flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium px-4 py-2 bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50 rounded-lg transition-all duration-200 shadow-sm"
            >
              <Upload size={16} />
              <span>Import CSV</span>
            </button>
            <button
              onClick={handleLoadExample}
              className="flex-1 sm:flex-none justify-center text-sm text-blue-600 hover:text-blue-700 font-semibold px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Load Example
            </button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv"
            className="hidden" 
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl flex items-center border border-red-100">
            <AlertCircle size={18} className="mr-3 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Text Area */}
        <div className="relative group">
          <textarea
            value={rateList}
            onChange={(e) => setRateList(e.target.value)}
            className="w-full h-80 p-5 text-sm font-mono text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none shadow-inner"
            placeholder="Paste your rate list here...&#10;&#10;Format:&#10;Item Name, Price, Unit&#10;&#10;Example:&#10;Profile 45x90, 959.04, Meter"
          />
          <div className="absolute bottom-4 right-4 text-xs font-medium text-gray-400 bg-white/80 px-2 py-1 rounded-md backdrop-blur-sm border border-gray-100">
            {rateList.length} chars
          </div>
        </div>
        
        {/* Info Box */}
        <div className="mt-6 flex items-start space-x-3 text-sm text-gray-600 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          <Info size={18} className="mt-0.5 text-blue-600 flex-shrink-0" />
          <p className="leading-relaxed">
            AutoBOM is flexible. You can paste raw data directly from Excel or upload <strong>CSV</strong> files. The AI will parse the columns intelligently.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!rateList.trim()}
          className="group relative px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="flex items-center space-x-2">
            <span>Continue to Project Details</span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default RateListStep;