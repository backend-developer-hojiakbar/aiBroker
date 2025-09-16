import React, { useState, useRef, DragEvent } from 'react';
import type { TenderData, Platform } from '../types';
import { Platform as PlatformEnum } from '../types';
import { UploadIcon, FileIcon, XIcon, AnalyzeIcon, PlusIcon, TrashIcon } from './Icons';
import { InfoTooltip } from './Card';
import { t } from '../utils/translations';

interface InputFormProps {
  onSubmit: (data: TenderData, platform: Platform) => void;
  companyProfile: any; // Sizning App.tsx faylingizdan kelayotgan prop
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, companyProfile }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [platform, setPlatform] = useState<Platform>(PlatformEnum.XT_XARID);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [includeVat, setIncludeVat] = useState<boolean>(true);
  const [additionalCosts, setAdditionalCosts] = useState<{ description: string; amount: string }[]>([]);

  const addCostField = () => {
    setAdditionalCosts([...additionalCosts, { description: '', amount: '' }]);
  };

  const handleCostChange = (index: number, field: 'description' | 'amount', value: string) => {
      const newCosts = [...additionalCosts];
      newCosts[index][field] = value;
      setAdditionalCosts(newCosts);
  };

  const removeCostField = (index: number) => {
      setAdditionalCosts(additionalCosts.filter((_, i) => i !== index));
  };

  const handleFileSelection = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
        setError(null);
        const newFiles = Array.from(selectedFiles);
        if (files.length + newFiles.length > 3) {
            setError("Bir vaqtning o'zida 3 tadan ko'p fayl yuklab bo'lmaydi.");
            return;
        }
        for (const file of newFiles) {
             if (file.size > 10 * 1024 * 1024) {
                setError(`"${file.name}" fayli 10MB dan katta. Iltimos, kichikroq fayl tanlang.`);
                return;
             }
        }
        setFiles(prev => [...prev, ...newFiles]);
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(event.target.files);
  };
  
  const handleDragEvents = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
        setIsDragging(true);
    } else if (e.type === 'dragleave') {
        setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelection(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsedCosts = additionalCosts
        .filter(cost => cost.description.trim() && cost.amount.trim())
        .map(cost => ({
            description: cost.description,
            amount: parseFloat(cost.amount) || 0
        }));

      if (files.length === 0) {
        setError("Iltimos, tahlil uchun kamida bitta fayl tanlang.");
        return;
      }
      const tenderData: TenderData = { files, includeVat, additionalCosts: parsedCosts };
    onSubmit(tenderData, platform);
  };

  const isSubmitDisabled = files.length === 0;

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-surface to-black/30 p-8 sm:p-10 rounded-2xl shadow-2xl animate-slide-up border border-brand-primary/20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-secondary to-accent opacity-10"></div>
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      <div className="relative z-10 text-center mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to mb-4">
          {t('ai-broker-elite-analysis-system')}
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          {t('ai-broker-elite-analysis-system-description')}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="min-h-[250px] flex flex-col justify-center">
                 <>
                    <div onDragEnter={handleDragEvents} onDragLeave={handleDragEvents} onDragOver={handleDragEvents} onDrop={handleDrop} className={`relative text-center p-8 border-2 border-dashed rounded-lg transition-colors duration-300 ${isDragging ? 'border-brand-primary bg-brand-primary/10 shadow-glow' : 'border-gray-600 hover:border-brand-primary'}`}>
                        <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt,image/*" ref={fileInputRef} multiple/>
                        <label htmlFor="file-upload" className="flex flex-col items-center justify-center text-text-secondary cursor-pointer">
                          <UploadIcon />
                          <p className="mt-2 font-semibold">{t('file-upload-instruction')}</p>
                          <p className="text-sm mt-1">{t('file-upload-subtitle')}</p>
                          <span className="mt-4 text-sm font-bold text-text-primary bg-surface-light px-4 py-2 rounded-md">{t('file-upload-button')}</span>
                        </label>
                    </div>

                    {files.length > 0 && (
                        <div className="mt-4 space-y-2 animate-fade-in">
                            <h3 className="font-semibold text-text-secondary">{t('selected-files')}</h3>
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-brand-primary/10 p-2 rounded-lg border border-brand-primary/20">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <FileIcon className="text-brand-primary flex-shrink-0 w-6 h-6"/>
                                        <span className="text-md font-medium text-text-primary truncate">{file.name}</span>
                                    </div>
                                    <button type="button" onClick={() => removeFile(index)} className="p-1 rounded-full hover:bg-white/10 text-brand-primary flex-shrink-0 ml-2" aria-label="Faylni olib tashlash">
                                        <XIcon />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-text-secondary mt-2 text-center">{t('file-upload-limit')}</p>
                </>
        </div>
       
        <div className="mt-8 pt-6 border-t border-border">
            <h2 className="text-xl font-bold text-center text-text-primary mb-4">{t('financial-settings')}</h2>

            <div className="flex items-center justify-between bg-black/20 p-3 rounded-lg">
                <label htmlFor="includeVat" className="flex items-center text-sm font-bold text-text-primary cursor-pointer">
                    {t('vat-calculation')}
                    <InfoTooltip text={t('vat-calculation-tooltip')} />
                </label>
                <label htmlFor="includeVat" className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input type="checkbox" id="includeVat" className="sr-only" checked={includeVat} onChange={(e) => setIncludeVat(e.target.checked)} />
                        <div className={`block w-14 h-8 rounded-full transition ${includeVat ? 'bg-brand-primary' : 'bg-gray-600'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${includeVat ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                </label>
            </div>

            <div className="mt-4">
                <div className="flex items-center justify-between">
                    <h3 className="flex items-center text-sm font-bold text-text-primary">
                        {t('additional-costs')}
                        <InfoTooltip text={t('additional-costs-tooltip')} />
                    </h3>
                    <button type="button" onClick={addCostField} className="flex items-center gap-1 text-sm font-semibold text-brand-primary hover:text-brand-secondary">
                        <PlusIcon /> {t('add-cost')}
                    </button>
                </div>
                <div className="space-y-2 mt-2">
                    {additionalCosts.map((cost, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                            <input
                                type="text"
                                placeholder={t('cost-description-placeholder')}
                                value={cost.description}
                                onChange={(e) => handleCostChange(index, 'description', e.target.value)}
                                className="w-2/3 p-2 border border-border rounded-md bg-background text-sm"
                            />
                            <input
                                type="number"
                                placeholder={t('cost-amount-placeholder')}
                                value={cost.amount}
                                onChange={(e) => handleCostChange(index, 'amount', e.target.value)}
                                className="w-1/3 p-2 border border-border rounded-md bg-background text-sm"
                            />
                            <button type="button" onClick={() => removeCostField(index)} className="p-2 text-text-secondary hover:text-status-danger">
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center justify-center mb-6">
                <h2 className="text-xl font-bold text-center text-text-primary">{t('select-platform')}</h2>
                <InfoTooltip text={t('select-platform-tooltip')} />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
                {(Object.values(PlatformEnum)).map((p) => (
                    <label
                        key={p}
                        className={`relative flex-1 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                            platform === p
                                ? 'border-brand-primary bg-brand-primary/10 shadow-glow'
                                : 'border-border bg-black/20 hover:border-brand-primary/50'
                        }`}
                    >
                        <input
                            type="radio"
                            name="platform"
                            value={p}
                            checked={platform === p}
                            onChange={(e) => setPlatform(e.target.value as Platform)}
                            className="sr-only"
                        />
                        <div className="flex items-center justify-center text-center">
                            <div className="flex flex-col gap-2">
                                <div className={`font-bold text-lg transition-colors duration-200 ${
                                    platform === p ? 'text-brand-primary' : 'text-text-primary'
                                }`}>
                                    {p === PlatformEnum.XT_XARID ? "XT-Xarid" : "Xarid.uzex.uz"}
                                </div>
                                <div className={`text-sm transition-colors duration-200 ${
                                    platform === p ? 'text-brand-primary' : 'text-text-secondary'
                                }`}>
                                    {p === PlatformEnum.XARID_UZEX 
                                        ? t('primary-platform') 
                                        : t('alternative-platform')
                                    }
                                </div>
                            </div>
                        </div>
                    </label>
                ))}
            </div>
        </div>

        {error && <p className="text-status-danger mt-6 text-sm text-center font-semibold" role="alert">{error}</p>}
        
        <div className="mt-8 p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-lg text-center">
            <p className="font-bold text-brand-primary">{t('next-step')}</p>
            <p className="text-sm text-text-secondary mt-1">{t('next-step-description')}</p>
        </div>

        <div className="mt-10 text-center">
             <button type="submit" className="bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white font-bold py-3 px-12 text-lg rounded-lg hover:shadow-glow transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-brand-primary/50 disabled:from-gray-600 disabled:to-gray-700 disabled:scale-100 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-3 mx-auto" disabled={isSubmitDisabled}>
                <AnalyzeIcon />
                {t('start-analysis')}
            </button>
        </div>
      </form>
    </div>
  );
};

export default InputForm;