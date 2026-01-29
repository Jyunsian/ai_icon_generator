
import React, { useState, useRef, useMemo, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { 
  AppState, 
  AnalysisResult, 
  TrendSynthesis, 
  CreativeBrief,
  ExploreItem
} from './types';
import { 
  analyzeAppMetadata, 
  synthesizeTrends, 
  createBriefs, 
  generateIcon 
} from './geminiService';

interface ScreenshotFile {
  data: string;
  mimeType: string;
  preview: string;
}

const ALL_PROMPT_SUGGESTIONS = [
  "A futuristic cyber-security app icon with neon glow and metallic textures.",
  "A minimal leaf-inspired icon for a sustainable vertical farming tool.",
  "A high-contrast 3D golden trophy icon for a competitive sports betting app.",
  "A glassmorphism heart icon for a social wellness platform with pastel gradients.",
  "A neo-brutalistic geometric shape for a modern architectural design firm.",
  "A cinematic camera lens icon for a premium 4K video editing suite.",
  "A flat, colorful geometric bird for a high-speed messaging startup.",
  "A textured clay-style piggy bank for a Gen-Z personal finance saving app.",
  "A sleek, brushed aluminum gear icon for an industrial automation dashboard.",
  "A mystical floating crystal for a fantasy RPG game icon.",
  "A cozy steaming coffee cup with a hand-drawn feel for a cafe finder.",
  "An abstract infinite loop icon for a productivity and time-loop app."
];

const MOCK_EXPLORE: ExploreItem[] = [
  { id: '1', title: 'Zen Meditation', category: 'Health', style: 'Glassmorphism', imageUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop', author: 'Alex R.', isFeatured: true },
  { id: '2', title: 'Crypto Vault', category: 'Finance', style: 'Neo-Brutalism', imageUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=1000&auto=format&fit=crop', author: 'Sarah K.', isFeatured: false },
  { id: '3', title: 'Status Saver Pro', category: 'Utility', style: 'Cinematic', imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop', author: 'Architect AI', isFeatured: true },
  { id: '4', title: 'Pixel Runner', category: 'Gaming', style: 'Pixel Art', imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop', author: 'GameDev99', isFeatured: false },
  { id: '5', title: 'Eco Tracker', category: 'Utility', style: 'Minimalist', imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop', author: 'GreenTech', isFeatured: true },
  { id: '6', title: 'Chef Palette', category: 'Food', style: 'Hyper-Realistic', imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1000&auto=format&fit=crop', author: 'FoodieLabs', isFeatured: false },
  { id: '7', title: 'Weather Sphere', category: 'Utility', style: '3D Isomorphic', imageUrl: 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?q=80&w=1000&auto=format&fit=crop', author: 'AeroUI', isFeatured: false },
  { id: '8', title: 'Nebula Navigator', category: 'Education', style: 'Futuristic', imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop', author: 'StellarAI', isFeatured: true },
];

const App: React.FC = () => {
  const [appInput, setAppInput] = useState('');
  const [status, setStatus] = useState<AppState>('IDLE');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [trends, setTrends] = useState<TrendSynthesis | null>(null);
  const [briefs, setBriefs] = useState<CreativeBrief[]>([]);
  const [isExecutingAll, setIsExecutingAll] = useState(false);
  const [screenshots, setScreenshots] = useState<ScreenshotFile[]>([]);
  
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [exploreFilter, setExploreFilter] = useState<'All' | 'Featured' | 'Latest'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const screenshotInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refreshSuggestions();
  }, []);

  const refreshSuggestions = () => {
    const shuffled = [...ALL_PROMPT_SUGGESTIONS].sort(() => 0.5 - Math.random());
    setCurrentSuggestions(shuffled.slice(0, 3));
  };

  const handleOpenKeySelector = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
    }
  };

  const handleResetApp = () => {
    setStatus('IDLE');
    setAnalysis(null);
    setTrends(null);
    setBriefs([]);
    setAppInput('');
    setScreenshots([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScreenshotSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setScreenshots(prev => [...prev, {
          data: base64,
          mimeType: file.type,
          preview: reader.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const startAnalysisStep = async () => {
    if (!appInput.trim() && screenshots.length === 0) return;
    setStatus('ANALYZING');
    try {
      const audit = await analyzeAppMetadata(appInput, screenshots);
      setAnalysis(audit);
      setStatus('ANALYSIS_REVIEW');
    } catch (err: any) {
      alert(err.message);
      setStatus('IDLE');
    }
  };

  const startTrendsStep = async () => {
    if (!analysis) return;
    setStatus('SYNTHESIZING');
    try {
      const pulse = await synthesizeTrends(analysis.vertical, analysis.demographics);
      setTrends(pulse);
      setStatus('TRENDS_REVIEW');
    } catch (err: any) {
      alert(err.message);
      setStatus('ANALYSIS_REVIEW');
    }
  };

  const startBriefingStep = async () => {
    if (!analysis || !trends) return;
    setStatus('BRIEFING');
    try {
      const strategies = await createBriefs(analysis, trends);
      setBriefs(strategies);
      setStatus('BRIEFS_REVIEW');
    } catch (err: any) {
      alert(err.message);
      setStatus('TRENDS_REVIEW');
    }
  };

  const handleGenerateImage = async (briefId: string) => {
    const brief = briefs.find(b => b.id === briefId);
    if (!brief) return;
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) await (window as any).aistudio.openSelectKey();
    }
    try {
      setBriefs(prev => prev.map(b => b.id === briefId ? { ...b, generatedImage: 'LOADING' } : b));
      
      const refImg = screenshots.length > 0 ? { data: screenshots[0].data, mimeType: screenshots[0].mimeType } : undefined;
      
      const imageUrl = await generateIcon(brief.prompt, brief.suggestedSize, refImg);
      setBriefs(prev => prev.map(b => b.id === briefId ? { ...b, generatedImage: imageUrl } : b));
    } catch (error: any) {
      alert(`Render Error: ${error.message}`);
      setBriefs(prev => prev.map(b => b.id === briefId ? { ...b, generatedImage: undefined } : b));
    }
  };

  const handleExecuteAll = async () => {
    if (isExecutingAll) return;
    setIsExecutingAll(true);
    for (const brief of briefs) {
      if (!brief.generatedImage) await handleGenerateImage(brief.id);
    }
    setIsExecutingAll(false);
  };

  const filteredExplore = useMemo(() => {
    return MOCK_EXPLORE.filter(item => {
      const matchesMain = exploreFilter === 'All' || (exploreFilter === 'Featured' && item.isFeatured) || (exploreFilter === 'Latest' && !item.isFeatured);
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      return matchesMain && matchesCategory;
    });
  }, [exploreFilter, categoryFilter]);

  const categories = ['All', ...Array.from(new Set(MOCK_EXPLORE.map(i => i.category)))];

  const getStepProgress = () => {
    const steps = ['DNA Audit', 'Trend Pulse', 'Architecture'];
    let current = 0;
    if (status === 'ANALYZING' || status === 'ANALYSIS_REVIEW') current = 0;
    if (status === 'SYNTHESIZING' || status === 'TRENDS_REVIEW') current = 1;
    if (status === 'BRIEFING' || status === 'BRIEFS_REVIEW' || status === 'COMPLETE') current = 2;
    return { steps, current };
  };

  return (
    <div className="flex h-screen overflow-hidden text-[#111827]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-right border-gray-200 flex flex-col p-4 shrink-0 shadow-[1px_0_0_rgba(0,0,0,0.05)] z-10">
        <div className="flex items-center gap-2 mb-8 px-2">
          <Lucide.Cpu className="text-gray-900" size={24} />
          <span className="font-bold tracking-tight">Architect AI</span>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <h4 className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Recently Generated</h4>
            <div className="sidebar-item">Status Saver App</div>
            <div className="sidebar-item">Meditation Guide</div>
            <div className="sidebar-item">Finance Tracker Pro</div>
          </div>
          <div className="space-y-1">
            <h4 className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Previous 7 Days</h4>
            <div className="sidebar-item">Calorie Counter UI</div>
            <div className="sidebar-item">Social Media Planner</div>
            <div className="sidebar-item">RPG Game Icon</div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex flex-col gap-1">
          <button onClick={handleResetApp} className="sidebar-item w-full font-bold text-indigo-600 hover:bg-indigo-50">
            <Lucide.PlusCircle size={16} /> New Task
          </button>
          <button onClick={handleOpenKeySelector} className="sidebar-item w-full">
            <Lucide.Settings size={16} /> Settings
          </button>
          <div className="mt-4 p-3 bg-indigo-50 rounded-xl">
             <button className="flex items-center gap-2 w-full text-xs font-bold text-indigo-600">
               <Lucide.MessageSquare size={14} /> Join Discord
             </button>
          </div>
          <button className="sidebar-item w-full text-red-500 hover:text-red-600 hover:bg-red-50 mt-1">
            <Lucide.LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 overflow-y-auto flex flex-col items-center relative">
        <div className="w-full max-w-6xl flex justify-end p-4 sticky top-0 bg-[#fafafa]/80 backdrop-blur-sm z-20">
          <button className="text-[11px] font-medium text-gray-400 border border-gray-200 px-3 py-1 rounded-md hover:bg-white transition-colors">Submit Feedback &rarr;</button>
        </div>

        <div className="w-full max-w-6xl px-8 py-12 flex flex-col items-center gap-8">
          
          <div className="text-center space-y-4">
             <div className="inline-block px-2 py-0.5 bg-gray-100 text-[10px] font-medium text-gray-500 rounded-md border border-gray-200 uppercase tracking-wider">Architect AI v1.2</div>
             <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Generate UI Components with AI</h1>
             <p className="text-gray-400 text-lg font-normal">Enter a simple prompt to generate stunning UI icons.</p>
          </div>

          {status !== 'IDLE' && (
            <div className="w-full max-w-4xl flex items-center justify-center gap-4 mb-4">
               {getStepProgress().steps.map((step, i) => (
                 <React.Fragment key={step}>
                   <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        getStepProgress().current > i ? 'bg-green-500 text-white' : 
                        getStepProgress().current === i ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                         {getStepProgress().current > i ? <Lucide.Check size={12} /> : i + 1}
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-widest ${getStepProgress().current === i ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step}
                      </span>
                   </div>
                   {i < 2 && <div className="w-12 h-[1px] bg-gray-200" />}
                 </React.Fragment>
               ))}
            </div>
          )}

          <div className="w-full max-w-4xl command-center rounded-2xl p-6 space-y-6 relative overflow-hidden">
            <textarea 
              placeholder="A package tracking app..."
              value={appInput}
              onChange={(e) => setAppInput(e.target.value)}
              disabled={status !== 'IDLE'}
              className="w-full min-h-[140px] text-xl outline-none resize-none placeholder:text-gray-300 font-normal leading-relaxed disabled:opacity-50"
            />
            
            {screenshots.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth">
                {screenshots.map((s, i) => (
                  <div key={i} className="relative group shrink-0">
                    <img src={s.preview} className="w-20 h-20 object-cover rounded-xl border border-gray-100 shadow-sm" />
                    <button 
                      disabled={status !== 'IDLE'}
                      onClick={() => setScreenshots(prev => prev.filter((_, idx) => idx !== i))} 
                      className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity disabled:hidden"
                    >
                      <Lucide.X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex gap-3">
                <button onClick={() => screenshotInputRef.current?.click()} disabled={status !== 'IDLE'} className="action-chip px-4 py-2 flex items-center gap-2 disabled:opacity-30">
                  <Lucide.Image size={16} /> <span className="text-sm">Image</span>
                </button>
                <div className="flex gap-2 items-center px-2 py-2 border border-gray-200 rounded-lg bg-white opacity-50">
                  <div className="w-4 h-4 rounded-full bg-indigo-500" />
                  <div className="w-4 h-4 rounded-full bg-violet-500" />
                  <Lucide.ChevronDown size={14} className="text-gray-400 ml-1" />
                </div>
              </div>
              
              {status === 'IDLE' ? (
                <button 
                  onClick={startAnalysisStep} 
                  className="bg-[#111827] text-white px-8 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-black transition-all shadow-md active:scale-95"
                >
                  <Lucide.Zap size={18} /> Begin Intelligence Audit
                </button>
              ) : (
                <button 
                  onClick={handleResetApp}
                  className="text-gray-400 hover:text-gray-900 text-sm font-medium px-4 py-2 transition-colors flex items-center gap-1"
                >
                  <Lucide.RotateCcw size={14} /> Restart Project
                </button>
              )}
            </div>
          </div>

          {status === 'IDLE' && (
            <div className="w-full max-w-4xl space-y-4 animate-in fade-in duration-1000">
               <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">You may want to create...</span>
                  <button onClick={refreshSuggestions} className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
                    <Lucide.RefreshCcw size={12} /> More ideas
                  </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {currentSuggestions.map((prompt, idx) => (
                    <button key={idx} onClick={() => setAppInput(prompt)} className="text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all group active:scale-[0.98]">
                      <p className="text-sm text-gray-500 group-hover:text-indigo-700 line-clamp-2 italic leading-relaxed">"{prompt}"</p>
                    </button>
                  ))}
               </div>
            </div>
          )}

          {status !== 'IDLE' && (
            <div className="w-full max-w-5xl space-y-8 animate-in fade-in duration-700">
              
              {(status === 'ANALYZING' || status === 'ANALYSIS_REVIEW') && (
                <div className="glass-card rounded-3xl p-8 border-gray-200 shadow-xl overflow-hidden relative">
                   {status === 'ANALYZING' ? (
                     <div className="flex flex-col items-center justify-center py-20 gap-6">
                        <div className="w-16 h-16 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin" />
                        <div className="text-center space-y-2">
                           <h3 className="text-xl font-bold">Auditing Market DNA</h3>
                           <p className="text-gray-400 text-sm">Identifying competitors, demographics, and functional psychographics...</p>
                        </div>
                     </div>
                   ) : (
                     <div className="space-y-8">
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
                              <h3 className="text-2xl font-bold">Checkpoint 1: Competitive DNA</h3>
                              <p className="text-gray-500 text-sm">Review the identified market landscape before proceeding to cultural trends.</p>
                           </div>
                           <button onClick={startTrendsStep} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2">
                             Confirm & Next Step <Lucide.ArrowRight size={18} />
                           </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="p-5 bg-gray-50 rounded-2xl space-y-3">
                              <div className="flex items-center gap-2 text-indigo-600">
                                 <Lucide.Target size={18} />
                                 <span className="text-xs font-bold uppercase tracking-widest">Vertical</span>
                              </div>
                              <p className="font-bold text-lg">{analysis?.vertical}</p>
                              <p className="text-sm text-gray-500 leading-relaxed">{analysis?.demographics}</p>
                           </div>
                           <div className="p-5 bg-gray-50 rounded-2xl space-y-3 md:col-span-2">
                              <div className="flex items-center gap-2 text-indigo-600">
                                 <Lucide.Users size={18} />
                                 <span className="text-xs font-bold uppercase tracking-widest">Psychographic Profile</span>
                              </div>
                              <p className="text-sm font-medium text-gray-700 leading-relaxed">{analysis?.psychographicProfile}</p>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400">Direct Visual Competitors</h4>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {analysis?.competitors.map((comp, i) => (
                                <div key={i} className="border border-gray-100 p-4 rounded-xl flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white shadow-sm font-bold text-gray-300">
                                     {comp.name[0]}
                                   </div>
                                   <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold truncate">{comp.name}</p>
                                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">{comp.style}</p>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                   )}
                </div>
              )}

              {(status === 'SYNTHESIZING' || status === 'TRENDS_REVIEW') && (
                <div className="glass-card rounded-3xl p-8 border-gray-200 shadow-xl overflow-hidden">
                   {status === 'SYNTHESIZING' ? (
                     <div className="flex flex-col items-center justify-center py-20 gap-6">
                        <div className="w-16 h-16 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin" />
                        <div className="text-center space-y-2">
                           <h3 className="text-xl font-bold">Mapping Cultural Pulse</h3>
                           <p className="text-gray-400 text-sm">Cross-referencing global entertainment trends with your app vertical...</p>
                        </div>
                     </div>
                   ) : (
                     <div className="space-y-8">
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
                              <h3 className="text-2xl font-bold">Checkpoint 2: Trend Synthesis</h3>
                              <p className="text-gray-500 text-sm">AI has mapped current viral media aesthetics to your product dna.</p>
                           </div>
                           <button onClick={startBriefingStep} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2">
                             Confirm & Architects Briefs <Lucide.ArrowRight size={18} />
                           </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-6">
                              <div className="p-6 bg-indigo-50 rounded-2xl space-y-4">
                                 <div className="flex items-center gap-2 text-indigo-700">
                                    <Lucide.Tv size={18} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Entertainment Narrative</span>
                                 </div>
                                 <p className="text-base text-indigo-900 font-medium leading-relaxed italic">
                                   "{trends?.entertainmentNarrative}"
                                 </p>
                              </div>
                              <div className="space-y-3 px-2">
                                 <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Visual Sentiment Keywords</h4>
                                 <div className="flex flex-wrap gap-2">
                                    {trends?.sentimentKeywords.map(k => (
                                      <span key={k} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600">#{k}</span>
                                    ))}
                                 </div>
                              </div>
                           </div>
                           <div className="space-y-6">
                              <div className="p-6 border border-gray-100 rounded-2xl space-y-4 bg-white">
                                 <div className="flex items-center gap-2 text-gray-900">
                                    <Lucide.Sparkles size={18} />
                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Proposed Visual DNA</span>
                                 </div>
                                 <p className="text-sm text-gray-600 leading-relaxed">
                                   <span className="font-bold text-gray-900">Subculture Overlap:</span> {trends?.subcultureOverlap}
                                 </p>
                                 <p className="text-sm text-gray-600 leading-relaxed">
                                   <span className="font-bold text-gray-900">Visual Aesthetic:</span> {trends?.visualTrends}
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>
                   )}
                </div>
              )}

              {(status === 'BRIEFING' || status === 'BRIEFS_REVIEW' || status === 'COMPLETE') && (
                <div className="space-y-12 pb-20">
                   {status === 'BRIEFING' ? (
                     <div className="glass-card rounded-3xl p-12 flex flex-col items-center justify-center gap-6">
                        <div className="w-16 h-16 border-4 border-gray-100 border-t-rose-500 rounded-full animate-spin" />
                        <h3 className="text-xl font-bold">Architecting Creative Directions</h3>
                     </div>
                   ) : (
                     <>
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
                              <h3 className="text-2xl font-bold">Final Architecture</h3>
                              <p className="text-gray-500 text-sm">High-conversion directions optimized to evolve your brand identity.</p>
                           </div>
                           <button onClick={handleExecuteAll} disabled={isExecutingAll} className="bg-[#111827] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50">
                             {isExecutingAll ? 'Rendering All...' : 'Render All Proposals'}
                           </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                           {briefs.map((brief) => (
                             <div key={brief.id} className="glass-card rounded-2xl overflow-hidden group hover:shadow-2xl transition-all border-gray-200">
                                <div className="aspect-square bg-gray-50 flex items-center justify-center relative border-b border-gray-100 overflow-hidden">
                                   {brief.generatedImage === 'LOADING' ? (
                                     <div className="flex flex-col items-center gap-3">
                                       <div className="w-10 h-10 border-3 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rendering...</span>
                                     </div>
                                   ) : brief.generatedImage ? (
                                     <img src={brief.generatedImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                   ) : (
                                     <button onClick={() => handleGenerateImage(brief.id)} className="flex flex-col items-center gap-4 text-gray-400 hover:text-gray-900 transition-all active:scale-95">
                                       <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-white group-hover:border-gray-400 shadow-sm transition-all">
                                         <Lucide.Play fill="currentColor" size={24} className="ml-1" />
                                       </div>
                                       <span className="text-[10px] font-bold uppercase tracking-widest">Render v{brief.id}</span>
                                     </button>
                                   )}
                                </div>
                                <div className="p-6 space-y-4">
                                   <h5 className="font-bold text-base tracking-tight">{brief.directionName}</h5>
                                   <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">"{brief.theWhy}"</p>
                                   <div className="flex gap-4 pt-4 border-t border-gray-50">
                                      <button className="text-[10px] font-bold text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Details</button>
                                      <button className="text-[10px] font-bold text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Adjust</button>
                                   </div>
                                </div>
                             </div>
                           ))}
                        </div>

                        {/* WAY OUT / NEXT TASK CTA */}
                        <div className="mt-12 p-10 border-t border-gray-100 flex flex-col items-center text-center gap-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                           <div className="space-y-2">
                             <h4 className="text-xl font-bold">Satisfied with the architecture?</h4>
                             <p className="text-gray-400 text-sm max-w-md">You can download your favorite renders or start a completely new architectural audit for another app.</p>
                           </div>
                           <div className="flex gap-4">
                              <button onClick={handleResetApp} className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95">
                                 <Lucide.PlusCircle size={20} /> Start New Generation
                              </button>
                              <button className="flex items-center gap-2 px-8 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                                 <Lucide.Download size={20} /> Save Workspace
                              </button>
                           </div>
                        </div>
                     </>
                   )}
                </div>
              )}
            </div>
          )}

          {status === 'IDLE' && (
            <div className="w-full space-y-8 mt-12 animate-in fade-in duration-700 px-4 md:px-0">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold flex items-center gap-2">
                    Explore <span className="text-gray-300 font-normal text-xl">({MOCK_EXPLORE.length})</span>
                  </h2>
                  <div className="flex gap-2">
                    {(['All', 'Featured', 'Latest'] as const).map(f => (
                      <button key={f} onClick={() => setExploreFilter(f)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${exploreFilter === f ? 'bg-white border border-gray-200 shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vertical</span>
                  <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium outline-none">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {filteredExplore.map((item) => (
                   <div key={item.id} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                      <div className="aspect-square overflow-hidden bg-gray-100 relative">
                         <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button className="bg-white text-gray-900 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">View Project</button>
                         </div>
                         {item.isFeatured && (
                           <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur text-[9px] font-bold text-indigo-600 rounded shadow-sm border border-indigo-50 tracking-tighter">FEATURED</div>
                         )}
                      </div>
                      <div className="p-4 space-y-1">
                         <div className="flex justify-between items-start">
                            <h4 className="font-bold text-sm tracking-tight">{item.title}</h4>
                            <span className="text-[9px] bg-gray-50 border border-gray-100 text-gray-400 px-1 py-0.5 rounded uppercase font-bold">{item.style}</span>
                         </div>
                         <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
                            <span>{item.category}</span>
                            <span className="flex items-center gap-1">@{item.author}</span>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <input type="file" ref={screenshotInputRef} className="hidden" accept="image/*" multiple onChange={handleScreenshotSelect} />
    </div>
  );
};

export default App;
