import { motion } from "motion/react";
import { AudioLines, Sparkles, Command } from "lucide-react";

const AppleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12.152 6.896c-.022-2.313 1.905-3.415 1.986-3.468-1.074-1.576-2.748-1.782-3.344-1.815-1.425-.143-2.782.842-3.513.842-.731 0-1.841-.81-2.992-.788-1.517.022-2.915.885-3.69 2.235-1.562 2.709-.395 6.721 1.134 8.92 .743 1.074 1.62 2.279 2.782 2.235 1.118-.044 1.547-.723 2.894-.723 1.347 0 1.733.723 2.915.701 1.205-.022 1.951-1.096 2.682-2.148.843-1.233 1.192-2.427 1.214-2.493-.028-.011-2.336-.893-2.358-3.504L12.152 6.896zm-1.884-5.32c.621-.75 1.042-1.8 1.042-2.84.004-.15-.015-.298-.051-.436-.921.036-2.072.612-2.716 1.385-.516.611-.97 1.688-.867 2.721.157.012.316.02.476.015.823-.005 1.83-.497 2.45-1.246"/>
  </svg>
);

export default function App() {
  return (
    <div className="min-h-screen bg-white text-[#1c1917] font-sans selection:bg-gray-200 flex flex-col items-center w-full">
      
      {/* Sticky Pill Navigation */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white rounded-full border border-gray-200 shadow-sm flex items-center pr-1.5 pl-5 py-1.5 gap-6">
          <div className="flex items-center gap-2 font-pixel text-2xl tracking-wide pt-1">
            <span className="text-xl">🐝</span> lazy
          </div>
          <button className="bg-[#1c1917] hover:bg-black transition-colors text-white text-[13px] font-medium px-4 py-2 rounded-full flex items-center gap-2">
            <AppleIcon className="w-3.5 h-3.5 mb-0.5" />
            Download for macOS
          </button>
        </div>
      </div>

      {/* Hero 1 - Full Width Background Holder */}
      <section className="w-full relative flex flex-col items-center justify-center pt-48 pb-32 px-4 bg-gray-100 overflow-hidden min-h-[70vh]">
        <div 
          className="absolute inset-0 bg-cover bg-center brightness-[0.7]"
          style={{ backgroundImage: `url('https://framerusercontent.com/images/BD0IjamMdd4pWLkZSrAyKkLeLQ.png?scale-down-to=2048&width=5760&height=4096')` }}
        ></div>
        
        <div className="relative z-10 text-center flex flex-col items-center w-full max-w-4xl mx-auto">
          <h1 className="font-pixel text-[4rem] sm:text-[5rem] md:text-[6.5rem] text-white leading-none mb-6 drop-shadow-md">
            Speak to your computer
          </h1>
          <p className="text-[17px] md:text-[19px] text-white max-w-2xl mx-auto mb-10 text-center leading-relaxed drop-shadow-md font-medium">
            <span className="font-bold">Lazy</span> turns your voice into text, write anything, anywhere on your Mac, just by speaking.
          </p>
          <button className="bg-white text-black font-semibold shadow-md rounded-full px-7 py-3 flex items-center justify-center gap-2.5 mx-auto hover:bg-gray-50 transition-colors">
            <AppleIcon className="w-5 h-5 mb-0.5" />
            Download Now for macOS
          </button>
        </div>
      </section>

      {/* Section 2 - Operate your Mac */}
      <section className="w-full max-w-6xl mx-auto px-6 py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-10">
          <h2 className="font-pixel text-5xl sm:text-6xl md:text-7xl max-w-xl leading-[0.9] tracking-tight">
            Operate your Mac 100x faster
          </h2>
          <div className="md:w-[420px] flex flex-col items-start gap-6 md:pb-2">
            <p className="text-gray-500 text-[17px] leading-relaxed">
              Powerful voice dictation, smart formatting, and real actions built into one seamless workflow.
            </p>
            <button className="border border-gray-300 rounded-full px-5 py-2 flex items-center gap-2 font-medium hover:bg-gray-50 transition-colors text-[14px]">
              <AppleIcon className="w-4 h-4 mb-0.5" />
              Download for macOS
            </button>
          </div>
        </div>

        {/* 3 Features Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="flex flex-col">
            <div className="bg-gray-100 rounded-3xl aspect-[1.3] w-full mb-8 relative border border-gray-100/50 overflow-hidden">
              <img src="https://framerusercontent.com/images/ScCZOdJ3xdMtIAODsZOwr3zuaEM.png?scale-down-to=512&width=704&height=504" alt="Voice Dictation" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <h3 className="font-semibold text-lg flex items-center gap-2.5 mb-3">
              <AudioLines className="w-5 h-5" /> Voice Dictation
            </h3>
            <p className="text-gray-500 text-[15px] mb-5 leading-relaxed flex-1">
              Speak to your slack, emails, whatsapp, notes & more.
            </p>
            <p className="text-[14px] font-semibold text-[#1c1917]">Works Everywhere</p>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col">
            <div className="bg-gray-100 rounded-3xl aspect-[1.3] w-full mb-8 relative border border-gray-100/50 overflow-hidden">
              <img src="https://framerusercontent.com/images/zkSEZRVmJCAqnKwAWWFSR9hgA.png?scale-down-to=512&width=704&height=504" alt="AI Formatting" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <h3 className="font-semibold text-lg flex items-center gap-2.5 mb-3">
              <Sparkles className="w-5 h-5" /> AI Formatting
            </h3>
            <p className="text-gray-500 text-[15px] mb-5 leading-relaxed flex-1">
              Removes filler, fixes structure, and matches your tone automatically.
            </p>
            <p className="text-[14px] font-semibold text-[#1c1917]">Cleans As You Speak</p>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col">
            <div className="bg-gray-100 rounded-3xl aspect-[1.3] w-full mb-8 relative border border-gray-100/50 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1581287053822-fd7bf4f4bfec?auto=format&fit=crop&q=80&w=600" alt="Speak to Action" className="absolute inset-0 w-full h-full object-cover opacity-80" />
            </div>
            <h3 className="font-semibold text-lg flex items-center gap-2.5 mb-3">
              <Command className="w-5 h-5" /> Speak to Action
            </h3>
            <p className="text-gray-500 text-[15px] mb-5 leading-relaxed flex-1">
              Reply to emails, find files, run actions just by asking.
            </p>
            <p className="text-[14px] font-semibold text-[#1c1917]">Stop clicking buttons</p>
          </div>
        </div>
      </section>

      {/* Section 3 - Feeling Lazy? */}
      <section className="w-full max-w-5xl mx-auto px-6 py-20 text-center flex flex-col items-center">
        <div className="bg-gray-100 rounded-[2.5rem] aspect-[2.2] w-full mb-14 relative border border-gray-100/50 overflow-hidden">
           <img src="https://framerusercontent.com/images/eNbv4FtaSnW4yTEodgdGlesU4.png?scale-down-to=2048&width=4480&height=1972" alt="Keyboard with Fn highlighted" className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <h2 className="text-2xl md:text-[28px] font-medium mb-8 text-[#1c1917]">Feeling Lazy? Press Fn</h2>
        <button className="border border-gray-300 rounded-full px-5 py-2.5 flex items-center gap-2 font-medium hover:bg-gray-50 transition-colors text-[14px]">
          <AppleIcon className="w-4 h-4 mb-0.5" />
          Download for macOS
        </button>
      </section>

      {/* Section 4 - 4x faster typing */}
      <section className="w-full py-40 mt-16 text-center relative overflow-hidden bg-gray-900">
         <div 
           className="absolute inset-0 bg-cover bg-center brightness-[0.7]"
           style={{ backgroundImage: `url('https://framerusercontent.com/images/wUcHT2msZa9meRMKPtaIQW5k3U.png?scale-down-to=2048&width=2880&height=1600')` }}
         ></div>
         
         <div className="relative z-10 flex flex-col items-center">
           <div className="inline-flex bg-white rounded-full border border-gray-200 shadow-sm items-center pr-1.5 pl-5 py-1.5 gap-5 mb-14">
              <div className="flex items-center gap-2 font-pixel text-xl pt-1">
                <span className="text-lg">🐝</span> lazy
              </div>
              <button className="bg-[#1c1917] hover:bg-black transition-colors text-white text-[13px] font-medium px-4 py-2 rounded-full flex items-center gap-2">
                <AppleIcon className="w-3.5 h-3.5 mb-0.5" />
                Download for macOS
              </button>
           </div>

           <h2 className="font-pixel text-[4.5rem] md:text-[7rem] leading-none mb-6 text-white drop-shadow-md">
             4x faster typing
           </h2>
           <p className="text-white text-[17px] mb-12 max-w-sm mx-auto drop-shadow-md">
             Start speaking and getting things done in seconds — right from your Mac.
           </p>
           
           <button className="bg-white text-black font-semibold shadow-md rounded-full px-6 py-3 flex items-center justify-center gap-2 mx-auto hover:bg-gray-50 transition-colors">
              <AppleIcon className="w-5 h-5 mb-0.5" />
              Download for free
           </button>
         </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-black text-white pt-24 pb-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start mb-28">
           <div className="mb-10 md:mb-0">
             <div className="flex items-center gap-2 font-pixel text-[2.5rem] pt-1 mb-2">
               <span className="text-[2rem]">🐝</span> lazy
             </div>
             <p className="text-gray-400 text-[15px]">A smallest AI product</p>
           </div>
           
           <div className="flex items-center gap-2 font-pixel text-[2.5rem] pt-1 text-white/90">
               <span className="text-[2rem]">🐝</span> lazy
           </div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[13px] text-gray-500 border-t border-gray-800/80 pt-8">
          <p>2026 Lazy Voice All rights reserved.</p>
          <div className="flex flex-wrap justify-center md:justify-end gap-5 md:gap-8 mt-6 md:mt-0">
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Changelog</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Data privacy</a>
          </div>
        </div>
      </footer>
      
    </div>
  );
}
