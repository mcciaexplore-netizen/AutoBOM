import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, X, FileText, FileType } from 'lucide-react';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) {
      return <FileType size={20} className="text-red-500" />;
    }
    return <ImageIcon size={20} className="text-blue-500" />;
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Project Details</h2>
            <p className="text-sm text-gray-500">
              Describe the work or upload drawings/sketches/documents.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Text Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Scope of Work / Inquiry</label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full h-64 p-4 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Describe the project...&#10;e.g., Construct a 12x12ft patio with concrete foundation and brick pavers. Include electrical outlet on the north side."
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Drawings, Schematics & PDFs</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition-all group"
            >
              <div className="p-4 bg-indigo-50 rounded-full text-indigo-500 group-hover:scale-110 transition-transform mb-3">
                <Upload size={24} />
              </div>
              <p className="text-sm font-medium text-gray-600">Click to upload files</p>
              <p className="text-xs text-gray-400 mt-1">Images (PNG, JPG) and PDF supported</p>
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
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Attached Files ({files.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {files.map((file, index) => (
                <div key={index} className="relative group bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center">
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                  >
                    <X size={12} />
                  </button>
                  <div className="w-10 h-10 mb-2 bg-gray-50 rounded flex items-center justify-center overflow-hidden">
                    {/* Simple preview logic: show image thumbnail if image, icon if PDF */}
                    {file.type.startsWith('image/') ? (
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="preview" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      getFileIcon(file)
                    )}
                  </div>
                  <span className="text-xs text-gray-600 truncate w-full text-center" title={file.name}>
                    {file.name}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1 uppercase">
                    {file.name.split('.').pop()} • {(file.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onGenerate}
          disabled={isLoading || (!projectDescription.trim() && files.length === 0)}
          className={`
            px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium 
            hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
            disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200
            flex items-center space-x-2
          `}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Analyzing & Generating...</span>
            </>
          ) : (
            <span>Generate BOM</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputStep;