import React, { useState, useEffect } from 'react';
import { AppStep, BOMResult, AppSettings } from './types';
import { generateBOM } from './services/geminiService';
import RateListStep from './components/RateListStep';
import InputStep from './components/InputStep';
import ResultsStep from './components/ResultsStep';
import StepIndicator from './components/StepIndicator';
import SettingsModal from './components/SettingsModal';
import { ScrollText, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.RATE_LIST);
  const [rateList, setRateList] = useState<string>("");
  const [projectDescription, setProjectDescription] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bomResult, setBomResult] = useState<BOMResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    provider: 'gemini',
    geminiApiKey: '',
    groqApiKey: '',
    groqModel: 'llama-3.2-90b-vision-preview',
    businessName: '',
    businessAddress: '',
    businessContact: ''
  });

  // Load settings from local storage on mount
  useEffect(() => {
    const savedSettingsStr = localStorage.getItem('autoBomSettings');
    if (savedSettingsStr) {
      try {
        const saved = JSON.parse(savedSettingsStr);
        // Migration logic for old settings format
        let modelToUse = saved.groqModel;
        if (!modelToUse || modelToUse === 'llama-3.2-11b-vision-preview') {
            modelToUse = 'llama-3.2-90b-vision-preview';
        }

        const newSettings: AppSettings = {
          provider: saved.provider || 'gemini',
          geminiApiKey: saved.geminiApiKey || (saved.apiKey && !saved.geminiApiKey ? saved.apiKey : ''),
          groqApiKey: saved.groqApiKey || '',
          groqModel: modelToUse,
          businessName: saved.businessName || '',
          businessAddress: saved.businessAddress || '',
          businessContact: saved.businessContact || ''
        };
        setAppSettings(newSettings);
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    localStorage.setItem('autoBomSettings', JSON.stringify(newSettings));
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateBOM(rateList, projectDescription, files, appSettings);
      setBomResult(result);
      setCurrentStep(AppStep.RESULTS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate BOM. Please check your API Key and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(AppStep.RATE_LIST);
    setBomResult(null);
    setFiles([]);
    setProjectDescription("");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => setCurrentStep(AppStep.RATE_LIST)}>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <ScrollText className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">AutoBOM</h1>
              <span className="text-xs text-blue-600 font-medium tracking-wide uppercase">AI Estimator</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-100"
              title="Settings & API Key"
            >
              <Settings size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start justify-between shadow-sm animate-fade-in">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Encountered</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors p-1">
               <span className="sr-only">Close</span>
               <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
               </svg>
            </button>
          </div>
        )}

        <div className="mb-12">
          <StepIndicator currentStep={currentStep} />
        </div>

        <div className="transition-all duration-500 ease-in-out">
          {currentStep === AppStep.RATE_LIST && (
            <RateListStep
              rateList={rateList}
              setRateList={setRateList}
              onNext={() => setCurrentStep(AppStep.PROJECT_INPUT)}
            />
          )}

          {currentStep === AppStep.PROJECT_INPUT && (
            <InputStep
              projectDescription={projectDescription}
              setProjectDescription={setProjectDescription}
              files={files}
              setFiles={setFiles}
              onBack={() => setCurrentStep(AppStep.RATE_LIST)}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          )}

          {currentStep === AppStep.RESULTS && bomResult && (
            <ResultsStep
              bomResult={bomResult}
              settings={appSettings}
              onReset={handleReset}
            />
          )}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
          <div className="flex items-center space-x-2 mb-2">
            <ScrollText size={16} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-600">AutoBOM</span>
          </div>
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} AutoBOM. Powered by MCCIA Applied AI Center.</p>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={appSettings}
        onSave={handleSaveSettings}
      />
    </div>
  );
};

export default App;