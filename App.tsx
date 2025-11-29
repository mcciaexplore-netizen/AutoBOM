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
    apiKey: '',
    businessName: '',
    businessAddress: '',
    businessContact: ''
  });

  // Load settings from local storage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('autoBomSettings');
    if (savedSettings) {
      setAppSettings(JSON.parse(savedSettings));
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
      const result = await generateBOM(rateList, projectDescription, files, appSettings.apiKey);
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
    // We optionally keep the rate list as users often reuse it
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ScrollText className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">AutoBOM <span className="text-gray-400 font-normal text-sm ml-2">AI Estimator</span></h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Settings & API Key"
            >
              <Settings size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-md flex items-start justify-between">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-500">
               <span className="sr-only">Close</span>
               <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
               </svg>
            </button>
          </div>
        )}

        <div className="mb-8">
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
      
      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} AutoBOM. Powered by MCCIA Applied AI Center.</p>
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