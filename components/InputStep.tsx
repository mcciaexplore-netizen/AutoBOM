import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X, FileText, Sparkles } from 'lucide-react';

interface InputStepProps {
  projectDescription: string;
  setProjectDescription: (val: string) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  onBack: () => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const InputStep: React.FC<InputStepProps> = ({
  projectDescription,
  setProjectDescription,
  files,
  setFiles,
  onBack,
  onGenerate,
  isLoading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles([...files, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) {
      return <FileText size={32} className="text-red-500" />;
    }
    return <ImageIcon size={32} className="text-blue-500" />;
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
        
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-gray-100">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shadow-inner">
            <FileText size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Project Details</h2>
            <p className="text-sm text-gray-500 mt-1">
              Describe the work scope and upload technical drawings or sketches.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Text Input */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Scope of Work / Inquiry</label>
            <div className="relative">
                <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="w-full h-[320px] p-5 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none shadow-inner"
                placeholder="Describe the project requirements...&#10;&#10;Example:&#10;Construct a 12x12ft guarding enclosure.&#10;Include safety switches on the door.&#10;Use 45x90 profiles for the main structure."
                />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-3 flex flex-col">
            <label className="block text-sm font-semibold text-gray-700">Drawings & Documents</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`
                flex-grow border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group relative overflow-hidden bg-white
                ${isDragOver 
                  ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' 
                  : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                }
              `}
            >
              <div className={`p-5 rounded-full mb-4 transition-transform duration-300 ${isDragOver ? 'bg-white scale-110 shadow-md' : 'bg-indigo-50 text-indigo-500 group-hover:scale-110'}`}>
                <Upload size={32} className={isDragOver ? 'text-indigo-600' : 'text-indigo-500'} />
              </div>
              <p className="text-base font-medium text-gray-700">Drag & Drop or Click to Upload</p>
              <p className="text-xs text-gray-400 mt-2">Supports Images (PNG, JPG) and PDF</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,application/pdf"
                multiple
              />
            </div>
          </div>
        </div>

        {/* File Preview List */}
        {files.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                Attached Files <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">{files.length}</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {files.map((file, index) => (
                <div key={index} className="relative group bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center">
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md z-10 hover:scale-110"
                    title="Remove file"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                  <div className="w-full aspect-square mb-3 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100 relative">
                    {file.type.startsWith('image/') ? (
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="preview" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="bg-white p-3 rounded-full shadow-sm">
                          {getFileIcon(file)}
                      </div>
                    )}
                  </div>
                  <div className="w-full text-center">
                    <p className="text-xs font-medium text-gray-700 truncate w-full" title={file.name}>
                        {file.name}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 uppercase">
                        {(file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors hover:bg-gray-100 rounded-lg"
        >
          Back
        </button>
        <button
          onClick={onGenerate}
          disabled={isLoading || (!projectDescription.trim() && files.length === 0)}
          className={`
            group relative px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold 
            hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 
            disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25 
            hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0
            flex items-center space-x-2 overflow-hidden
          `}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} className="group-hover:animate-pulse" />
              <span>Generate Estimate</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputStep;