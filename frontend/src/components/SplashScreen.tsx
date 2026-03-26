import React from 'react';

interface SplashScreenProps {
  status?: string;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ status = 'Initializing Portal' }) => {
  return (
    <div className="fixed inset-0 z-[999] bg-white flex flex-col items-center justify-center overflow-hidden">
      {/* Background soft gradients for a premium feel */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-50">
        <div className="absolute top-[-10%] right-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-[#224194]/10 to-transparent blur-3xl animate-pulse duration-[4000ms]"></div>
        <div className="absolute bottom-[-10%] left-[-20%] w-[100%] h-[40%] bg-gradient-to-tr from-[#f49022]/10 to-transparent blur-3xl animate-pulse duration-[3000ms]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-between h-full py-20">
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Animated Logo Container */}
          <div className="bg-white/80 backdrop-blur-md px-10 py-6 rounded-[2.5rem] shadow-2xl flex items-center justify-center mb-10 w-full max-w-[320px] transform animate-in fade-in zoom-in duration-1000 ease-out border border-white/50">
            <img 
              src="/logo.jpeg" 
              alt="AFRO ARAB Logo" 
              className="w-full h-auto max-h-28 object-contain animate-pulse duration-[2000ms]"
            />
          </div>

          {/* Branding Text */}
          <div className="text-center space-y-3 animate-in slide-in-from-bottom duration-700 delay-300 fill-mode-both">
            <h1 className="text-3xl font-black text-[#224194] uppercase tracking-tighter">
              AFRO ARAB
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-[2px] w-10 bg-[#f49022] rounded-full"></div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.5em]">
                Business Association
              </p>
              <div className="h-[2px] w-10 bg-[#f49022] rounded-full"></div>
            </div>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mt-12 italic opacity-80">
              Connecting Opportunities Globally
            </p>
          </div>
        </div>

        {/* Loading Indicator at Bottom - NOW SPRACED CORRECTLY */}
        <div className="flex flex-col items-center gap-3 mt-16 animate-in fade-in duration-1000 delay-700 fill-mode-both">
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#224194] animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#f49022] animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#2e9782] animate-bounce"></div>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-40">{status}</span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
