
import React, { useState, useEffect } from 'react';
import type { TenderStatus, WinnerInfo } from '../types';
import { InfoIcon } from './Icons';

interface TenderOutcomeFormProps {
  onSubmit: (status: TenderStatus, details: WinnerInfo) => void;
  onClose: () => void;
  preselectedOutcome?: TenderStatus | null;
}

const TenderOutcomeForm: React.FC<TenderOutcomeFormProps> = ({ onSubmit, onClose, preselectedOutcome }) => {
  const [outcome, setOutcome] = useState<TenderStatus | null>(null);
  const [winnerPrice, setWinnerPrice] = useState('');
  const [winnerCompany, setWinnerCompany] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [customsDuties, setCustomsDuties] = useState('');
  const [certificationCosts, setCertificationCosts] = useState('');
  const [actualDeliveryDate, setActualDeliveryDate] = useState('');
  const [deliveryDifficulties, setDeliveryDifficulties] = useState('');

  useEffect(() => {
    if (preselectedOutcome) {
      handleOutcomeSelect(preselectedOutcome);
    }
  }, [preselectedOutcome]);


  const handleOutcomeSelect = (selectedOutcome: TenderStatus) => {
    setOutcome(selectedOutcome);
    if (selectedOutcome === 'Did not participate') {
      handleSubmit(selectedOutcome);
    }
  };
  
  const handleSubmit = (status: TenderStatus) => {
    onSubmit(status, { winnerPrice, winnerCompany, actualCost, actualDeliveryDate, deliveryDifficulties, customsDuties, certificationCosts });
  }

  const renderInitialSelection = () => (
    <>
      <h3 className="text-xl font-bold text-brand-primary mb-2 text-center">Lot Natijasi Qanday Bo'ldi?</h3>
      <p className="text-text-secondary mb-6 text-center">Sizning javobingiz AI-Yadroni o'qitishga yordam beradi va kelajakdagi bashoratlarni kuchaytiradi.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => handleOutcomeSelect('Won')} className="p-6 text-center rounded-lg bg-status-success/10 border-2 border-status-success/20 hover:border-status-success hover:bg-status-success/20 transition-all transform hover:scale-105">
            <span className="text-5xl">✅</span>
            <p className="mt-2 text-lg font-bold text-status-success">Yutdim</p>
        </button>
        <button onClick={() => handleOutcomeSelect('Lost')} className="p-6 text-center rounded-lg bg-status-danger/10 border-2 border-status-danger/20 hover:border-status-danger hover:bg-status-danger/20 transition-all transform hover:scale-105">
            <span className="text-5xl">❌</span>
            <p className="mt-2 text-lg font-bold text-status-danger">Yutqazdim</p>
        </button>
        <button onClick={() => handleOutcomeSelect('Did not participate')} className="p-6 text-center rounded-lg bg-gray-500/10 border-2 border-gray-500/20 hover:border-gray-400 hover:bg-gray-500/20 transition-all transform hover:scale-105">
            <span className="text-5xl">➖</span>
            <p className="mt-2 text-lg font-bold text-gray-400">Ishtirok Etmadim</p>
        </button>
      </div>
    </>
  );

  const renderDetailsForm = () => {
    if (!outcome) return null;
    const isWin = outcome === 'Won';
    return (
      <div className="animate-fade-in">
        <h3 className="text-xl font-bold text-brand-primary mb-4">Tizimni yaxshilashga yordam bering</h3>
        <p className="text-text-secondary mb-4">Bashoratlarni aniqlashtirish uchun lot natijalari haqida ma'lumot kiriting (ixtiyoriy).</p>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            <div className="p-3 bg-brand-secondary/10 border-l-4 border-brand-secondary rounded-r-lg flex gap-3">
                <InfoIcon className="h-5 w-5 text-brand-secondary flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-text-primary">Nima uchun bu muhim?</h4>
                    <p className="text-xs text-text-secondary mt-1">Siz kiritgan har bir ma'lumot (ayniqsa raqobatchi narxi va nomi) AI-ning kelajakdagi tenderlar uchun narx bashorat qilish, raqobatchilar strategiyasini tahlil qilish va g'alaba ehtimolini hisoblash qobiliyatini sezilarli darajada yaxshilaydi.</p>
                </div>
            </div>
          <div>
              <label htmlFor="winnerPrice" className="text-sm font-medium text-text-secondary">{isWin ? "G'oliblik narxi (Shartnoma summasi)" : "Haqiqiy g'olib narxi"}</label>
              <input
                id="winnerPrice"
                type="text"
                placeholder="123 456 789,00 UZS"
                value={winnerPrice}
                onChange={(e) => setWinnerPrice(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md bg-transparent border-border focus:ring-1 focus:ring-brand-primary"
              />
          </div>
          <div>
              <label htmlFor="winnerCompany" className="text-sm font-medium text-text-secondary">G'olib kompaniya nomi</label>
              <input
                id="winnerCompany"
                type="text"
                placeholder="Masalan, 'Raqobatchi MChJ'"
                value={winnerCompany}
                onChange={(e) => setWinnerCompany(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md bg-transparent border-border focus:ring-1 focus:ring-brand-primary"
              />
          </div>
          {isWin && (
            <>
                <div>
                    <label htmlFor="actualCost" className="text-sm font-medium text-text-secondary">Haqiqiy xarajatlar (tannarx, logistika va hk.)</label>
                    <input
                        id="actualCost"
                        type="text"
                        placeholder="Umumiy xarajatlaringiz"
                        value={actualCost}
                        onChange={(e) => setActualCost(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md bg-transparent border-border focus:ring-1 focus:ring-brand-primary"
                    />
                </div>
                 <div>
                    <label htmlFor="customsDuties" className="text-sm font-medium text-text-secondary">Bojxona to'lovlari</label>
                    <input
                        id="customsDuties"
                        type="text"
                        placeholder="Umumiy bojxona to'lovlari"
                        value={customsDuties}
                        onChange={(e) => setCustomsDuties(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md bg-transparent border-border focus:ring-1 focus:ring-brand-primary"
                    />
                </div>
                 <div>
                    <label htmlFor="certificationCosts" className="text-sm font-medium text-text-secondary">Sertifikatlashtirish xarajatlari</label>
                    <input
                        id="certificationCosts"
                        type="text"
                        placeholder="Majburiy sertifikatlar uchun xarajat"
                        value={certificationCosts}
                        onChange={(e) => setCertificationCosts(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md bg-transparent border-border focus:ring-1 focus:ring-brand-primary"
                    />
                </div>
                <div>
                    <label htmlFor="actualDeliveryDate" className="text-sm font-medium text-text-secondary">Haqiqiy yetkazib berish sanasi</label>
                    <input
                        id="actualDeliveryDate"
                        type="date"
                        value={actualDeliveryDate}
                        onChange={(e) => setActualDeliveryDate(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md bg-transparent border-border focus:ring-1 focus:ring-brand-primary"
                    />
                </div>
                 <div>
                    <label htmlFor="deliveryDifficulties" className="text-sm font-medium text-text-secondary">Yetkazib berishda yuzaga kelgan qiyinchiliklar</label>
                    <textarea
                        id="deliveryDifficulties"
                        rows={3}
                        placeholder="Masalan, hujjatlar bilan muammo, logistika kechikishi, buyurtmachi bilan kelishmovchilik..."
                        value={deliveryDifficulties}
                        onChange={(e) => setDeliveryDifficulties(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md bg-transparent border-border focus:ring-1 focus:ring-brand-primary"
                    />
                </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setOutcome(null)} className="bg-gray-700 text-text-primary font-semibold py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors">Orqaga</button>
            <button onClick={() => handleSubmit(outcome)} className="bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white font-semibold py-2 px-6 rounded-lg hover:shadow-glow transition-shadow shadow-lg">
              Ma'lumotni Yuborish
            </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
        <div className="bg-surface backdrop-blur-xl border border-border p-8 rounded-xl shadow-lg w-full max-w-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-2xl" aria-label="Yopish">&times;</button>
            {!outcome ? renderInitialSelection() : renderDetailsForm()}
        </div>
    </div>
  );
};

export default TenderOutcomeForm;
