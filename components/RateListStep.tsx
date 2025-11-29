import React, { useRef, useState } from 'react';
import { FileText, Database, Upload, AlertCircle } from 'lucide-react';

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

    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Define Your Rates</h2>
              <p className="text-sm text-gray-500">
                Provide your standard pricing (INR ₹) to generate accurate estimates.
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
             <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 bg-blue-50 rounded-lg transition-colors"
            >
              <Upload size={14} />
              <span>Import CSV</span>
            </button>
            <button
              onClick={handleLoadExample}
              className="text-sm text-gray-500 hover:text-blue-600 font-medium underline decoration-dotted underline-offset-2"
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
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="relative">
          <textarea
            value={rateList}
            onChange={(e) => setRateList(e.target.value)}
            className="w-full h-64 p-4 text-sm font-mono text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            placeholder="Paste your rate list here...&#10;Or upload a CSV file.&#10;&#10;Format example:&#10;Item Name, Price, Unit"
          />
          <div className="absolute bottom-4 right-4 text-xs text-gray-400 pointer-events-none">
            {rateList.length} characters
          </div>
        </div>
        
        <div className="mt-4 flex items-start space-x-2 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
          <FileText size={16} className="mt-0.5 text-blue-500 flex-shrink-0" />
          <p>
            AutoBOM is flexible. You can paste data directly, or upload <strong>CSV</strong> files. The AI will parse the columns intelligently.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!rateList.trim()}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
        >
          Continue to Project Details
        </button>
      </div>
    </div>
  );
};

export default RateListStep;