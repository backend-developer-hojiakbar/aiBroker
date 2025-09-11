
import React, { useState, useEffect } from 'react';

const analysisMessages = [
  { text: "🔍 Elite AI tahlil tizimi faollashtirilmoqda...", progress: 10 },
  { text: "📊 Tanlangan ta'minotchilar chuqur tahlil qilinmoqda...", progress: 20 },
  { text: "🧠 Neyron tarmoq orqali o'tgan tenderlar tajribasi o'rganilmoqda...", progress: 30 },
  { text: "💰 Mukammal moliyaviy model qurilmoqda...", progress: 45 },
  { text: "⚠️ Risklar va golden imkoniyatlar baholanmoqda...", progress: 60 },
  { text: "🎯 Raqobatchilarni mag'lub etuvchi narx strategiyalari ishlab chiqilmoqda...", progress: 75 },
  { text: "🏆 Elite darajadagi strategik tavsiyalar tayyorlanmoqda...", progress: 85 },
  { text: "📋 G'alaba kafolatlagan yakuniy hisobot shakllantirilmoqda...", progress: 95 },
  { text: "✨ Tahlil yakunlandi - sukses strategiyangiz tayyor!", progress: 100 },
];

const sourcingMessages = [
    { text: "📄 AI tender hujjatini chuqur o'qimoqda...", progress: 15 },
    { text: "🔬 Mahsulot tavsifi va spetsifikatsiyalar aniqlanmoqda...", progress: 25 },
    { text: "🌐 Google Search orqali global bozor qidirilmoqda...", progress: 40 },
    { text: "🏪 Mahalliy premium ta'minotchilar tahlil qilinmoqda...", progress: 55 },
    { text: "🌍 Xalqaro arzon ta'minotchilar qidirilmoqda...", progress: 70 },
    { text: "✅ Topilgan ma'lumotlar haqiqiylik uchun tekshirilmoqda...", progress: 85 },
    { text: "📋 Eng yaxshi natijalar ro'yxati tuzilmoqda...", progress: 100 },
];

const contractMessages = [
  { text: "📜 AI-Yurist shartnoma matnini chuqur tahlil qilmoqda...", progress: 15 },
  { text: "⚖️ Yuridik terminologiya va bandlar tekshirilmoqda...", progress: 30 },
  { text: "🚨 Potentsial riskli bandlar qidirilmoqda...", progress: 50 },
  { text: "📋 Har bir tomonning majburiyatlari aniqlanmoqda...", progress: 65 },
  { text: "🏛️ O'zbekiston qonunchiligiga muvofiqlik tekshirilmoqda...", progress: 80 },
  { text: "✅ Professional yuridik xulosa tayyorlanmoqda...", progress: 100 },
];

interface LoadingIndicatorProps {
  stage?: 'sourcing' | 'analysis' | 'contract';
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ stage = 'analysis' }) => {
  const messages = stage === 'analysis' ? analysisMessages : stage === 'sourcing' ? sourcingMessages : contractMessages;
  const [messageIndex, setMessageIndex] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    setMessageIndex(0); // Reset on stage change
    const messageInterval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000);

    const timeInterval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);

    return () => {
      clearInterval(messageInterval);
      clearInterval(timeInterval);
    };
  }, [messages, stage, startTime]);

  const currentMessage = messages[messageIndex];
  const progress = currentMessage.progress;
  
  const title = stage === 'analysis' ? '🧠 AI-Broker Elite Intelligence System'
              : stage === 'sourcing' ? "🔍 Ultra-Advanced Sourcing Engine"
              : "⚖️ AI-Yurist Professional Legal Analyzer";

  const subtitle = stage === 'analysis' ? 'Strategik g\'alaba uchun tahlil qilmoqda...'
                 : stage === 'sourcing' ? "Eng arzon ta'minotchilarni qidirmoqda..."
                 : "Professional yuridik tahlil amalga oshirilmoqda...";

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center bg-gradient-to-br from-surface to-black/30 backdrop-blur-xl p-12 rounded-3xl shadow-2xl animate-slide-up border border-brand-primary/20 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-secondary to-accent opacity-20 animate-pulse"></div>
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-loading" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-loading)" />
        </svg>
      </div>
      
      <div className="relative z-10 text-center">
        {/* Elite Spinner with Progress */}
        <div className="relative h-40 w-40 mx-auto mb-8">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00B8D9" />
                      <stop offset="50%" stopColor="#8E44AD" />
                      <stop offset="100%" stopColor="#E91E63" />
                  </linearGradient>
                  <filter id="progressGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                  </filter>
              </defs>
              {/* Background Circle */}
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
              {/* Progress Circle */}
              <circle 
                cx="50" 
                cy="50" 
                r="42" 
                fill="none" 
                stroke="url(#progressGradient)" 
                strokeWidth="6" 
                strokeLinecap="round"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * progress) / 100}
                className="transition-all duration-1000 ease-out"
                style={{filter: 'url(#progressGlow)'}}
              />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                  {progress}%
                </div>
                <div className="text-xs text-text-secondary mt-1">
                  {formatTime(elapsedTime)}
                </div>
              </div>
          </div>
          {/* Floating particles */}
          <div className="absolute inset-0 animate-spin-slow">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full opacity-70 animate-ping"
                style={{
                  top: `${50 + 40 * Math.sin((i * Math.PI) / 4)}%`,
                  left: `${50 + 40 * Math.cos((i * Math.PI) / 4)}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to mb-2">
          {title}
        </h1>
        <p className="text-lg text-text-secondary mb-8">{subtitle}</p>
        
        {/* Enhanced Progress Steps */}
        <div className="w-full max-w-lg mx-auto mb-8">
          <div className="flex justify-between text-xs text-text-secondary mb-2">
            <span>Boshlandi</span>
            <span className="text-brand-primary font-semibold">{progress}% bajarildi</span>
            <span>Tugadi</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div 
              className="h-2 bg-gradient-to-r from-brand-primary via-brand-secondary to-accent rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
            </div>
          </div>
        </div>
        
        {/* Current Task with Icon */}
        <div className="bg-black/30 rounded-xl p-6 border border-brand-primary/30 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-3 h-3 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-brand-primary">Joriy jarayon</span>
            <div className="w-3 h-3 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full animate-pulse"></div>
          </div>
          <p key={messageIndex} className="text-lg font-medium text-text-primary text-center animate-fade-in transition-all duration-500">
            {currentMessage.text}
          </p>
        </div>
        
        {/* Elite Status Indicators */}
        <div className="grid grid-cols-3 gap-4 mt-8 text-center">
          <div className="bg-black/20 rounded-lg p-3 border border-status-success/30">
            <div className="text-status-success text-xl font-bold">{messageIndex + 1}</div>
            <div className="text-xs text-text-secondary">Bajarilgan</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3 border border-brand-primary/30">
            <div className="text-brand-primary text-xl font-bold animate-pulse">{messages.length - messageIndex - 1}</div>
            <div className="text-xs text-text-secondary">Qolgan</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3 border border-accent/30">
            <div className="text-accent text-xl font-bold">{Math.ceil((100 - progress) / 10)}</div>
            <div className="text-xs text-text-secondary">Daqiqa</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;