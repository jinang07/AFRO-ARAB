import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[999] bg-white flex flex-col items-center justify-center overflow-hidden">
      {/* Background soft gradients for a premium feel */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-50">
        <div className="absolute top-[-10%] right-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-[#224194]/10 to-transparent blur-3xl animate-pulse duration-[4000ms]"></div>
        <div className="absolute bottom-[-10%] left-[-20%] w-[100%] h-[40%] bg-gradient-to-tr from-[#f49022]/10 to-transparent blur-3xl animate-pulse duration-[3000ms]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Logo Container */}
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl flex items-center justify-center mb-6 w-56 h-48 transform animate-in fade-in zoom-in duration-1000 ease-out border border-slate-50">
          <img 
            src="/logo.jpeg" 
            alt="AFRO ARAB Logo" 
            className="w-full h-full object-contain animate-pulse duration-[2000ms]"
          />
        </div>

        {/* Branding Text */}
        <div className="text-center space-y-2 animate-in slide-in-from-bottom duration-700 delay-300 fill-mode-both">
          <h1 className="text-2xl font-black text-[#224194] uppercase tracking-tighter">
            AFRO ARAB
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-[2px] w-8 bg-[#f49022] rounded-full"></div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em]">
              Business Association
            </p>
            <div className="h-[2px] w-8 bg-[#f49022] rounded-full"></div>
          </div>
          <p className="text-[9px] font-medium text-slate-300 uppercase tracking-[0.2em] mt-8 italic">
            Connecting Opportunities Globally
          </p>
        </div>

        {/* Loading Indicator at Bottom */}
        <div className="absolute bottom-12 flex flex-col items-center gap-3 animate-in fade-in duration-1000 delay-1000 fill-mode-both">
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#224194] animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#f49022] animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#2e9782] animate-bounce"></div>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-40">Initializing Portal</span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
