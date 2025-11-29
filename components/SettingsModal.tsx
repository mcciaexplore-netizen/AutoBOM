import React, { useState, useEffect } from 'react';
import { X, Save, Key, Building, MapPin, Phone, Cpu, Box, ExternalLink, ShieldCheck } from 'lucide-react';
import { AppSettings, AIProvider } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleProviderChange = (provider: AIProvider) => {
    setFormData({ ...formData, provider });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Settings</h2>
            <p className="text-xs text-gray-500 mt-0.5">Configure AI providers and report details</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* AI Provider Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center">
              <Cpu size={14} className="mr-1.5" /> AI Configuration
            </h3>
            
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-5">
                <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Select Provider</label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                    type="button"
                    onClick={() => handleProviderChange('gemini')}
                    className={`relative px-4 py-3 text-sm font-semibold rounded-xl border-2 transition-all flex items-center justify-center ${
                        formData.provider === 'gemini'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                    >
                    Google Gemini
                    {formData.provider === 'gemini' && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                    </button>
                    <button
                    type="button"
                    onClick={() => handleProviderChange('groq')}
                    className={`relative px-4 py-3 text-sm font-semibold rounded-xl border-2 transition-all flex items-center justify-center ${
                        formData.provider === 'groq'
                        ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                    >
                    Groq
                    {formData.provider === 'groq' && <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />}
                    </button>
                </div>
                </div>

                {/* API Key Input */}
                <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-900">
                    {formData.provider === 'gemini' ? 'Gemini API Key' : 'Groq API Key'}
                </label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Key size={16} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                    type={showKey ? "text" : "password"}
                    value={formData.provider === 'gemini' ? formData.geminiApiKey : formData.groqApiKey}
                    onChange={(e) => {
                        if (formData.provider === 'gemini') {
                        setFormData({ ...formData, geminiApiKey: e.target.value });
                        } else {
                        setFormData({ ...formData, groqApiKey: e.target.value });
                        }
                    }}
                    placeholder={`Enter your ${formData.provider === 'gemini' ? 'Gemini' : 'Groq'} API Key`}
                    className="pl-10 pr-16 block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm outline-none"
                    />
                    <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute inset-y-0 right-0 px-3 text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                    >
                    {showKey ? "Hide" : "Show"}
                    </button>
                </div>
                <div className="flex items-center text-[11px] text-gray-500 bg-gray-50 p-2 rounded-md">
                    <ShieldCheck size={12} className="mr-1.5 text-green-600" />
                    Your key is stored locally in your browser and never sent to our servers.
                </div>
                </div>

                {/* Groq Model Input */}
                {formData.provider === 'groq' && (
                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <label className="block text-sm font-semibold text-gray-900">
                    Groq Model Name
                </label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Box size={16} className="text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <input
                    type="text"
                    value={formData.groqModel}
                    onChange={(e) => setFormData({ ...formData, groqModel: e.target.value })}
                    placeholder="e.g. llama-3.2-90b-vision-preview"
                    className="pl-10 block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm outline-none"
                    />
                </div>
                <div className="flex items-center justify-between mt-1 px-1">
                    <p className="text-xs text-gray-500">
                    Model must support vision capabilities.
                    </p>
                    <a 
                    href="https://console.groq.com/docs/models" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-orange-600 hover:text-orange-800 flex items-center font-medium"
                    >
                    View Models <ExternalLink size={10} className="ml-1" />
                    </a>
                </div>
                </div>
                )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
              <Building size={14} className="mr-1.5" /> PDF Footer Details
            </h3>
            
            <div className="bg-gray-50/50 rounded-xl border border-gray-200 p-4 space-y-4">
                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 uppercase">Business Name</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Building size={16} className="text-gray-400" />
                        </div>
                        <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        placeholder="e.g. Acme Automation Pvt Ltd"
                        className="pl-10 block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 uppercase">Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <MapPin size={16} className="text-gray-400" />
                        </div>
                        <input
                        type="text"
                        value={formData.businessAddress}
                        onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                        placeholder="City, State, Zip"
                        className="pl-10 block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 uppercase">Contact</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Phone size={16} className="text-gray-400" />
                        </div>
                        <input
                        type="text"
                        value={formData.businessContact}
                        onChange={(e) => setFormData({ ...formData, businessContact: e.target.value })}
                        placeholder="+91-XXXX-XXXXXX"
                        className="pl-10 block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        />
                    </div>
                </div>
            </div>
          </div>

        </form>

        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20 flex items-center transform active:scale-95"
            >
              <Save size={18} className="mr-2" />
              Save Settings
            </button>
          </div>
      </div>
    </div>
  );
};

export default SettingsModal;