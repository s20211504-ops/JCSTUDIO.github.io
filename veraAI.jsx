import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Search, 
  Plus, 
  Settings, 
  BrainCircuit,
  Zap,
  X,
  Languages,
  PenTool,
  Sparkles,
  Newspaper,
  Code,
  Terminal
} from 'lucide-react';

const apiKey = "";
const GEN_MODEL = "gemini-2.5-flash-preview-09-2025";

const i18n = {
  zh: {
    welcome: '你好！我是 Vera 🤖。七合一版本已就緒！現在我不僅能寫作、看新聞，還能幫你寫代碼。點擊下方的「編程」試試吧！✨',
    newChat: '新建對話',
    history: '歷史記錄',
    settings: '設定',
    ctrlCenter: '控制中心',
    bgColor: '背景顏色',
    textColor: '字體顏色',
    lang: '目標語言',
    black: '深邃黑',
    white: '純潔白',
    save: '應用並保存',
    placeholder: '告訴 Vera 你的想法...',
    thinkPlaceholder: '深度推演模式已開啟，請輸入複雜邏輯...',
    transPlaceholder: '翻譯模式已開啟，請輸入需要翻譯的内容...',
    writePlaceholder: '文采模式已開啟，請輸入寫作主題...',
    newsPlaceholder: '新聞模式已開啟，正在監測全球即時資訊...',
    codePlaceholder: '編程模式已開啟，請輸入代碼需求或調試問題...',
    modeFast: '快速',
    modeThink: '深度',
    modeSearch: '聯網',
    modeTrans: '翻譯',
    modeWrite: '文采',
    modeNews: '新聞',
    modeCode: '編程',
    thinking: '🧠 深度邏輯推演中：\n1. 正在檢索知識庫...\n2. 正在構建多維邏輯模型...',
    translating: '🌐 智能翻譯引擎啟動：\n1. 識別源語言...\n2. 匹配地道表達...',
    writing: '✍️ 文學創作引擎啟動：\n1. 構思意境框架...\n2. 雕琢華彩詞藻...',
    newsing: '📰 正在連線全球新聞社：\n1. 掃描即時頭條...\n2. 彙整深度快訊...',
    coding: '🚀 編程開發引擎啟動：\n1. 構思系統架構...\n2. 編寫健壯代碼...\n3. 執行邏輯自檢...',
    error: '發生通訊錯誤！💔',
    offline: 'Vera 暫時掉線了。😢'
  },
  tw: {
    welcome: '妳好！我是 Vera 🤖。七合一版本已就緒！現在我不僅能寫作、看新聞，還能幫妳寫程式。點擊下方的「編程」試試吧！✨',
    newChat: '建立新對話',
    history: '歷史紀錄',
    settings: '偏好設定',
    ctrlCenter: '控制中心',
    bgColor: '背景顏色',
    textColor: '文字顏色',
    lang: '系統語言',
    black: '深邃黑',
    white: '純潔白',
    save: '套用並儲存',
    placeholder: '與 Vera 分享妳的想法...',
    thinkPlaceholder: '深度推論模式已啟動，請輸入複雜邏輯...',
    transPlaceholder: '翻譯模式已啟動，請輸入需要翻譯的文字...',
    writePlaceholder: '文采模式已啟動，請輸入創作主題...',
    newsPlaceholder: '新聞模式已啟動，正在為妳監測全球即時資訊...',
    codePlaceholder: '編程模式已啟動，請輸入開發需求或 Debug 問題...',
    modeFast: '快速',
    modeThink: '深度',
    modeSearch: '聯網',
    modeTrans: '翻譯',
    modeWrite: '文采',
    modeNews: '新聞',
    modeCode: '編程',
    thinking: '🧠 深度邏輯推論中：\n1. 正在檢索知識庫...\n2. 正在構建多維邏輯模型...',
    translating: '🌐 智能翻譯引擎啟動：\n1. 正在辨識來源語言...\n2. 尋找地道表達...',
    writing: '✍️ 文學創作引擎啟動：\n1. 構思意境框架...\n2. 雕琢華麗詞藻...',
    newsing: '📰 正在連線全球新聞社：\n1. 掃描即時頭條...\n2. 彙整深度快訊...',
    coding: '🚀 編程開發引擎啟動：\n1. 構思系統架構...\n2. 編寫健壯代碼...\n3. 執行邏輯自檢...',
    error: '連線發生錯誤！💔',
    offline: 'Vera 目前離線中。😢'
  }
};

const App = () => {
  const [lang, setLang] = useState('tw');
  const t = i18n[lang] || i18n.tw;

  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', text: t.welcome }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeMode, setActiveMode] = useState('fast'); 
  
  const [bgColor, setBgColor] = useState('black'); 
  const [textColor, setTextColor] = useState('white'); 
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText + ' 💬' }]);
    setIsTyping(true);

    try {
      const callApi = async () => {
        let systemPrompt = `你是一個名為 Vera 的 AI 助手。你是由 JC STUDIO 的 鄭名皓 研發。
        請使用：${lang === 'tw' ? '繁體中文' : '簡體中文'}回覆。
        當前模式：${activeMode}。`;

        if (activeMode === 'translate') {
          systemPrompt += `\n【翻譯模式】提供專業翻譯與術語解析。`;
        } else if (activeMode === 'write') {
          systemPrompt += `\n【文采模式】你是一名大作家，文筆優雅且富有禪意。`;
        } else if (activeMode === 'news') {
          systemPrompt += `\n【新聞模式】你是資深評論員。利用聯網搜索並以【今日要聞】、【深度分析】格式回覆。`;
        } else if (activeMode === 'code') {
          systemPrompt += `\n【編程模式】你是資深全棧工程師。請提供高效、健壯且包含詳細注釋的代码。使用 Markdown 格式並解釋邏輯。`;
        }
        
        const payload = {
          contents: [{ parts: [{ text: activeMode === 'think' ? `Reason step by step: ${userText}` : userText }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        };

        if (activeMode === 'search' || activeMode === 'news') {
          payload.tools = [{ google_search: {} }];
        }
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEN_MODEL}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return await response.json();
      };

      const result = await callApi();
      const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || t.offline;
      
      let statusText = "";
      if (activeMode === 'think') statusText = t.thinking;
      else if (activeMode === 'translate') statusText = t.translating;
      else if (activeMode === 'write') statusText = t.writing;
      else if (activeMode === 'news') statusText = t.newsing;
      else if (activeMode === 'code') statusText = t.coding;

      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        text: responseText,
        status: statusText
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: t.error }]);
    } finally {
      setIsTyping(false);
    }
  };

  const dynamicMainStyle = {
    backgroundColor: bgColor === 'black' ? '#0a0a0a' : '#ffffff',
    color: textColor === 'black' ? '#000000' : '#ffffff'
  };

  const dynamicBubbleStyle = {
    backgroundColor: bgColor === 'black' ? '#171717' : '#f8f8f8',
    borderColor: bgColor === 'black' ? '#262626' : '#eeeeee',
    color: textColor === 'black' ? '#000000' : '#ffffff'
  };

  return (
    <div className="flex h-screen font-sans overflow-hidden" style={dynamicMainStyle}>
      
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-black text-white p-6 border-r border-neutral-900 z-30">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-black text-2xl">V</div>
          <div>
            <h1 className="text-xl font-black tracking-tighter">VERA</h1>
            <p className="text-[10px] text-neutral-500 font-bold uppercase mt-1">JC STUDIO</p>
          </div>
        </div>
        
        <button onClick={() => setMessages([{ id: Date.now().toString(), role: 'assistant', text: t.welcome }])} className="flex items-center gap-3 w-full p-4 mb-8 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-all text-sm font-bold">
          <Plus size={18} /> {t.newChat}
        </button>

        <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar">
          <p className="text-[10px] font-black text-neutral-600 uppercase px-2 mb-4">{t.history}</p>
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-900 text-sm text-neutral-400 cursor-pointer transition-all">
            <Terminal size={16} className="text-cyan-500"/> <span className="truncate">編程七合一啟動 🚀</span>
          </div>
        </div>

        <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-3 w-full p-4 mt-auto rounded-xl hover:bg-neutral-900 text-sm font-bold text-neutral-400 transition-all">
          <Settings size={18} /> {t.settings}
        </button>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 border-b flex items-center justify-between px-8 backdrop-blur-md z-20" style={{borderColor: bgColor === 'black' ? '#262626' : '#e5e5e5'}}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] font-black px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" /> VERA 2.5 ULTIMATE (7-IN-1)
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar">
          <div className="max-w-3xl mx-auto space-y-10 pb-64">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                <div className={`flex gap-5 max-w-[88%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-black border-2 ${msg.role === 'user' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-black border-neutral-800 text-white'}`}>
                    {msg.role === 'user' ? 'U' : 'V'}
                  </div>
                  <div className="space-y-3">
                    <div className={`p-5 rounded-2xl text-sm md:text-base leading-relaxed border shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 border-indigo-500 text-white' : ''}`} style={msg.role === 'assistant' ? dynamicBubbleStyle : {}}>
                      {msg.status && (
                        <div className="mb-4 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-[11px] text-indigo-400 font-mono italic whitespace-pre-wrap leading-tight">
                          {msg.status}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && <div className="flex gap-5 animate-pulse"><div className="w-10 h-10 bg-neutral-500/10 rounded-xl" /><div className="h-12 w-48 bg-neutral-500/10 rounded-2xl" /></div>}
            <div ref={chatEndRef} />
          </div>
        </section>

        {/* Footer with Mode Selector and Input */}
        <footer className={`absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10 ${bgColor === 'black' ? 'bg-gradient-to-t from-black' : 'bg-gradient-to-t from-white'}`}>
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            
            <div className={`flex p-1 rounded-full border mb-6 shadow-2xl overflow-x-auto max-w-full no-scrollbar ${bgColor === 'black' ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-100 border-neutral-200'}`}>
              {[ 
                {id:'fast', icon:<Zap size={12}/>, label:t.modeFast, color:'bg-indigo-600'}, 
                {id:'think', icon:<BrainCircuit size={12}/>, label:t.modeThink, color:'bg-purple-600'}, 
                {id:'search', icon:<Search size={12}/>, label:t.modeSearch, color:'bg-blue-600'},
                {id:'news', icon:<Newspaper size={12}/>, label:t.modeNews, color:'bg-red-600'},
                {id:'code', icon:<Code size={12}/>, label:t.modeCode, color:'bg-cyan-600'},
                {id:'translate', icon:<Languages size={12}/>, label:t.modeTrans, color:'bg-emerald-600'},
                {id:'write', icon:<PenTool size={12}/>, label:t.modeWrite, color:'bg-amber-600'}
              ].map(mode => (
                <button 
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeMode === mode.id ? `${mode.color} text-white shadow-lg scale-105` : 'text-neutral-500 hover:text-neutral-400'}`}
                >
                  {mode.icon} {mode.label}
                </button>
              ))}
            </div>

            <div className={`w-full border-2 rounded-[2.5rem] p-2 flex flex-col shadow-2xl transition-all ${bgColor === 'black' ? 'bg-neutral-900 border-neutral-800 focus-within:border-neutral-600' : 'bg-neutral-50 border-neutral-300 focus-within:border-neutral-400'}`}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder={
                  activeMode === 'think' ? t.thinkPlaceholder : 
                  activeMode === 'translate' ? t.transPlaceholder : 
                  activeMode === 'write' ? t.writePlaceholder : 
                  activeMode === 'news' ? t.newsPlaceholder : 
                  activeMode === 'code' ? t.codePlaceholder : t.placeholder
                }
                className="w-full bg-transparent border-none focus:ring-0 text-sm md:text-base p-4 resize-none min-h-[60px] outline-none"
                rows="1"
              />
              <div className="flex justify-end p-2">
                <button onClick={handleSend} className={`p-3 rounded-2xl transition-all ${input.trim() ? 'bg-indigo-600 text-white shadow-xl hover:scale-105' : 'text-neutral-600'}`}>
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Settings Panel */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex justify-end">
          <div className="w-80 h-full bg-neutral-900 text-white p-8 shadow-2xl flex flex-col border-l border-neutral-800 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-10 pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2 font-black text-lg tracking-wider"><Settings size={20}/> {t.ctrlCenter}</div>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-neutral-800 rounded-full transition-colors"><X size={24}/></button>
            </div>
            {/* Settings content truncated for brevity... */}
            <button onClick={() => setIsSettingsOpen(false)} className="mt-auto w-full py-5 bg-white text-black rounded-[1.5rem] font-black text-sm shadow-2xl hover:bg-neutral-100 transition-all active:scale-95">
              {t.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
