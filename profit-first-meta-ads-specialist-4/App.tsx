
import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { 
  ArrowRight, 
  Menu, 
  X, 
  Quote, 
  Star, 
  Clock, 
  User, 
  Send,
  ExternalLink,
  Zap,
  ShieldCheck,
  Instagram,
  Send as TelegramIcon,
  Phone as WhatsAppIcon,
  Target,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { AuditFormState } from './types';
import { ChatWidget } from './ChatWidget';

const MY_PHOTO_URL = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop";

const FadeIn: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

const ThreeDEmblem = ({ compact = false }: { compact?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-150, 150], [15, -15]);
  const rotateY = useTransform(mouseX, [-150, 150], [-15, 15]);

  const springConfig = { damping: 25, stiffness: 100 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const sizeClass = compact ? "w-[120px] h-[60px]" : "w-[160px] h-[160px]";
  const barWidth = compact ? "w-[80px]" : "w-[100px]";
  const barHeight = compact ? "h-[25px]" : "h-[35px]";

  function handleMouseMove(event: React.MouseEvent) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(event.clientX - centerX);
    mouseY.set(event.clientY - centerY);
  }

  return (
    <div 
      className={`relative flex items-center justify-center ${sizeClass} cursor-pointer`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
        setIsHovered(false);
      }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        style={{ 
          rotateX: springRotateX, 
          rotateY: springRotateY,
          transformStyle: "preserve-3d"
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        <motion.div 
          animate={{ x: isHovered ? 0 : -20, y: isHovered ? 0 : -10, rotate: isHovered ? -45 : -60, scale: isHovered ? 1.05 : 0.9 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className={`absolute ${barWidth} ${barHeight} bg-accent/40 rounded-full shadow-lg backdrop-blur-sm`}
          style={{ translateZ: -20 }}
        />
        <motion.div 
          animate={{ x: isHovered ? 0 : 0, y: isHovered ? 0 : 15, rotate: isHovered ? -45 : -25, scale: isHovered ? 1.05 : 1 }}
          transition={{ type: "spring", stiffness: 110, damping: 20 }}
          className={`absolute ${barWidth} ${barHeight} bg-accent/60 rounded-full shadow-lg backdrop-blur-sm`}
          style={{ translateZ: 20 }}
        />
        <motion.div 
          animate={{ x: isHovered ? 0 : 20, y: isHovered ? 0 : -5, rotate: isHovered ? -45 : -40, scale: isHovered ? 1.05 : 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className={`absolute ${barWidth} ${barHeight} bg-accent rounded-full shadow-xl shadow-accent/20`}
          style={{ translateZ: 60 }}
        />
        <motion.div animate={{ translateZ: isHovered ? 90 : 70 }} className="absolute z-50 pointer-events-none text-white">
          <h2 className={`font-outfit ${compact ? 'text-[9px]' : 'text-sm'} font-black tracking-[0.3em]`}>IGADSFLEX</h2>
        </motion.div>
      </motion.div>
    </div>
  );
};

const SocialLink = ({ icon: Icon, href, label }: { icon: any, href: string, label: string }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    className="p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-accent/20 hover:border-accent/40 transition-all group relative"
  >
    <Icon size={16} className="text-white/70 group-hover:text-accent transition-colors" />
    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-accent font-bold">
      {label}
    </span>
  </motion.a>
);

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [auditState, setAuditState] = useState<AuditFormState>({ name: '', website: '', niche: '', loading: false });
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const handleAuditRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditState.website || !auditState.niche || !auditState.name) return;
    setAuditState(prev => ({ ...prev, loading: true }));
    
    const message = `Вітаю! Мене звати ${auditState.name}. Хочу отримати безкоштовний аудит моєї реклами.\n\nПроект: ${auditState.website}\nНіша: ${auditState.niche}`;
    const telegramUrl = `https://t.me/igadsflex?text=${encodeURIComponent(message)}`;
    
    setTimeout(() => {
      window.open(telegramUrl, '_blank');
      setAuditState({ name: '', website: '', niche: '', loading: false });
    }, 500);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-dark text-white selection:bg-accent/40 overflow-x-hidden font-sans">
      <ChatWidget />
      
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[1px] bg-accent z-[100] origin-left shadow-[0_0_10px_#8B5CF6]" 
        style={{ scaleX }} 
      />

      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/5 px-6 md:px-12 py-2 flex justify-between items-center">
        <div 
          className="cursor-pointer -ml-4" 
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
        >
          <ThreeDEmblem compact />
        </div>

        <div className="hidden lg:flex items-center space-x-12">
          <div className="flex space-x-8 text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
            <button onClick={() => scrollTo('how')} className="hover:text-white transition-colors">Метод</button>
            <button onClick={() => scrollTo('for-whom')} className="hover:text-white transition-colors">Для кого</button>
            <button onClick={() => scrollTo('cases')} className="hover:text-white transition-colors">Кейси</button>
          </div>
          <div className="flex items-center space-x-3 pl-8 border-l border-white/10">
            <SocialLink icon={TelegramIcon} href="https://t.me/igadsflex" label="Telegram" />
            <SocialLink icon={WhatsAppIcon} href="https://wa.me/4917662832957" label="WhatsApp" />
            <SocialLink icon={Instagram} href="https://www.instagram.com/yarovyi.vision/" label="Instagram" />
          </div>
        </div>

        <button className="lg:hidden p-2 text-white/60 hover:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[40] bg-dark/95 backdrop-blur-xl pt-32 px-8 flex flex-col space-y-8"
          >
            {['Метод', 'Для кого', 'Кейси'].map((item) => (
              <button 
                key={item} 
                onClick={() => scrollTo(item === 'Метод' ? 'how' : item === 'Для кого' ? 'for-whom' : 'cases')}
                className="text-4xl font-outfit font-black uppercase tracking-tighter text-left hover:text-accent transition-colors"
              >
                {item}
              </button>
            ))}
            <div className="pt-8 border-t border-white/5 flex space-x-4">
               <SocialLink icon={TelegramIcon} href="https://t.me/igadsflex" label="Telegram" />
               <SocialLink icon={WhatsAppIcon} href="https://wa.me/4917662832957" label="WhatsApp" />
               <SocialLink icon={Instagram} href="https://www.instagram.com/yarovyi.vision/" label="Instagram" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 pt-20">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-8">
            <FadeIn>
              <div className="inline-flex items-center space-x-3 mb-8 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_#8B5CF6]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Professional Meta Advertising</span>
              </div>
              <h1 className="font-outfit text-5xl md:text-8xl font-black tracking-tight leading-[0.95] uppercase mb-10">
                Реклама, яка <br />
                <span className="text-white/20 hover:text-glow transition-all duration-700 cursor-default">приводить клієнтів.</span>
              </h1>
              <p className="text-white/40 max-w-lg mb-10 text-sm md:text-lg leading-relaxed font-light">
                Стабільно. Прогнозовано. Без хаосу. <br />
                Я допомагаю бізнесам отримувати клієнтів через Facebook та Instagram — без зливу бюджету, без “магії”, без обіцянок у повітрі. Тільки чітка система і зрозумілий результат.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <button 
                  onClick={() => scrollTo('offer')} 
                  className="group relative px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-full overflow-hidden transition-all hover:pr-14 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                >
                  <span className="relative z-10">Отримати безкоштовний аудит</span>
                  <ArrowRight size={18} className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              </div>
            </FadeIn>
          </div>
          <div className="lg:col-span-4 relative flex justify-center">
            <FadeIn delay={0.2}>
              <motion.div 
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative w-full max-w-[400px] aspect-[4/5] rounded-[3.5rem] overflow-hidden glass-card group shadow-2xl shadow-accent/10"
              >
                <img 
  src="/me.png"
  alt="Ihor Yarovyi"
  className="w-full h-full object-cover transition-all duration-700 scale-105 group-hover:scale-110 group-hover:brightness-110"
/>

                <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent" />
                <div className="absolute bottom-10 left-10">
                  <h3 className="text-2xl font-outfit font-black uppercase tracking-tighter text-white">Ігор Яровий</h3>
                  <div className="text-accent text-[10px] font-black uppercase tracking-[0.3em] mt-1">Meta Ads Specialist</div>
                </div>
              </motion.div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-accent/10 blur-[80px] rounded-full -z-10" />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="how" className="py-32 px-6 border-t border-white/5 bg-dark/50">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="mb-20">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-6">Просто про те, що я роблю</h2>
              <h3 className="font-outfit text-4xl md:text-6xl font-black tracking-tight uppercase max-w-3xl">
                Більшість запускають рекламу “надіюсь — спрацює”. <span className="text-white/20">Я роблю по-іншому.</span>
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  t: "Цільова аудиторія", 
                  d: "Реклама приводить людей, яким реально потрібен ваш продукт. Жодних випадкових кліків.",
                  icon: <User size={24} className="text-accent" />
                },
                { 
                  t: "Стабільні заявки", 
                  d: "Вибудовую систему, яка генерує звернення щодня, а не раз на тиждень.",
                  icon: <TrendingUp size={24} className="text-accent" />
                },
                { 
                  t: "Прогноз прибутку", 
                  d: "Ви чітко розумієте, звідки йдуть клієнти і за що ви платите. Прозорість у кожній цифрі.",
                  icon: <BarChart3 size={24} className="text-accent" />
                }
              ].map((s, i) => (
                <div key={i} className="glass-card p-12 rounded-[3rem] flex flex-col items-start">
                  <div className="mb-8 p-4 bg-accent/10 rounded-2xl">{s.icon}</div>
                  <h4 className="text-xl font-black uppercase tracking-tighter mb-6 text-white">— {s.t}</h4>
                  <p className="text-white/40 text-sm leading-relaxed font-light">{s.d}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* For Whom Section */}
      <section id="for-whom" className="py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-6">Для кого</h2>
                <h3 className="font-outfit text-4xl md:text-6xl font-black tracking-tight uppercase mb-10">Мій формат підходить, якщо ви:</h3>
                <div className="space-y-6">
                  {[
                    "продаєте послуги або товари від $200",
                    "хочете стабільні заявки щомісяця",
                    "втомилися “крутити рекламу на удачу”",
                    "хочете зрозумілу систему, а не хаос"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="w-6 h-6 rounded-full border border-accent/30 flex items-center justify-center text-accent">
                        <CheckCircle2 size={14} />
                      </div>
                      <span className="text-white/60 text-lg font-light">• {item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="glass-card p-10 rounded-[2.5rem] mt-12 animate-float">
                    <div className="text-4xl font-black font-outfit text-accent mb-2">40+</div>
                    <div className="text-[9px] text-white/30 uppercase tracking-widest">Проектів у 2024</div>
                 </div>
                 <div className="glass-card p-10 rounded-[2.5rem] animate-float" style={{ animationDelay: '2s' }}>
                    <div className="text-4xl font-black font-outfit text-white mb-2">3.5x</div>
                    <div className="text-[9px] text-white/30 uppercase tracking-widest">Середній ROAS</div>
                 </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Cases Section */}
      <section id="cases" className="py-32 px-6 border-t border-white/5 bg-dark/30">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-6">Кейси</h2>
                <h3 className="font-outfit text-4xl md:text-6xl font-black tracking-tight uppercase">Досвід у цифрах</h3>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  niche: "Локальний бізнес", 
                  was: "реклама працювала через раз", 
                  did: "оновили оголошення і сторінку",
                  now: "заявки кожен день",
                  res: "Стабільний потік клієнтів за 2 тижні"
                },
                { 
                  niche: "Онлайн-послуги", 
                  was: "багато кліків — мало продажів", 
                  did: "змінили офер і логіку реклами",
                  now: "продажі пішли з першого тижня",
                  res: "+10 000$ за перший місяць"
                },
                { 
                  niche: "Ніша з високим чеком", 
                  was: "реклама “зʼїдала” прибуток", 
                  did: "нова стратегія + ремаркетинг",
                  now: "дешевші заявки і більше клієнтів",
                  res: "бізнес почав рости, а не виживати"
                }
              ].map((c, i) => (
                <div key={i} className="glass-card p-10 rounded-[3.5rem] flex flex-col justify-between group">
                  <div>
                    <div className="text-accent text-[10px] font-black uppercase tracking-widest mb-6">{c.niche}</div>
                    <div className="space-y-4 mb-8">
                      <div className="text-xs text-white/20 uppercase tracking-widest">Було: <span className="text-white/60 lowercase">{c.was}</span></div>
                      <div className="text-xs text-white/20 uppercase tracking-widest">Зробили: <span className="text-white/60 lowercase">{c.did}</span></div>
                      <div className="text-xs text-white/20 uppercase tracking-widest">Стало: <span className="text-accent lowercase">{c.now}</span></div>
                    </div>
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/5">
                    <div className="text-xl font-black font-outfit uppercase group-hover:text-glow transition-all">{c.res}</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Why Me Section */}
      <section className="py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-20">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-6">Чому мене обирають</h2>
              <h3 className="font-outfit text-4xl md:text-6xl font-black tracking-tight uppercase">Жодної магії, тільки підхід</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { t: "Говорю просто", d: "Пояснюю стратегію людською мовою без складних термінів." },
                { t: "Реальний бізнес", d: "Працюю тільки з тими, у кого є твердий продукт і цілі." },
                { t: "Тільки цифри", d: "Показую звіти з кабінету та прибуток, а не гарні скріни." },
                { t: "Власна система", d: "Будую довготривалий актив, а не просто “рекламку”." }
              ].map((item, i) => (
                <div key={i} className="text-center group">
                   <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-accent group-hover:text-white transition-all">
                      <CheckCircle2 size={20} />
                   </div>
                   <h4 className="font-black uppercase tracking-tighter mb-4 text-white">{item.t}</h4>
                   <p className="text-white/30 text-xs leading-relaxed font-light">{item.d}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA Section */}
      <section id="offer" className="py-32 px-6 relative overflow-hidden bg-[#070707]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <FadeIn>
            <div className="text-center mb-20">
              <h2 className="font-outfit text-4xl md:text-8xl font-black tracking-tight uppercase leading-[0.9] text-white mb-10">
                Безкоштовна <br /> <span className="text-accent">консультація.</span>
              </h2>
              <p className="text-white/40 max-w-lg mx-auto text-lg leading-relaxed font-light">
                Покажу, що заважає вашій рекламі давати більше клієнтів вже зараз. Запишіться на аудит.
              </p>
            </div>

            <form onSubmit={handleAuditRequest} className="glass-card p-8 md:p-16 rounded-[4rem] shadow-2xl relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                <div className="space-y-4">
                  <label className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">
                    <User size={14} className="text-accent" />
                    <span>Як до вас звертатися?</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ваше ім'я" 
                    value={auditState.name} 
                    onChange={(e) => setAuditState({ ...auditState, name: e.target.value })} 
                    className="w-full bg-white/[0.03] border border-white/10 rounded-[1.5rem] px-8 py-5 text-base outline-none focus:border-accent focus:bg-white/[0.06] transition-all text-white placeholder:text-white/10" 
                    required 
                  />
                </div>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">
                    <ExternalLink size={14} className="text-accent" />
                    <span>Сайт або Instagram</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="myshop.com" 
                    value={auditState.website} 
                    onChange={(e) => setAuditState({ ...auditState, website: e.target.value })} 
                    className="w-full bg-white/[0.03] border border-white/10 rounded-[1.5rem] px-8 py-5 text-base outline-none focus:border-accent focus:bg-white/[0.06] transition-all text-white placeholder:text-white/10" 
                    required 
                  />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <label className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">
                    <Zap size={14} className="text-accent" />
                    <span>Що ви продаєте?</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Напр. Дизайн інтер'єру, Одяг, Меблі" 
                    value={auditState.niche} 
                    onChange={(e) => setAuditState({ ...auditState, niche: e.target.value })} 
                    className="w-full bg-white/[0.03] border border-white/10 rounded-[1.5rem] px-8 py-5 text-base outline-none focus:border-accent focus:bg-white/[0.06] transition-all text-white placeholder:text-white/10" 
                    required 
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={auditState.loading} 
                className="w-full py-7 bg-white text-black rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[12px] hover:bg-accent hover:text-white transition-all shadow-xl flex items-center justify-center space-x-4 group active:scale-95"
              >
                {auditState.loading ? (
                  <span className="flex items-center space-x-3">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Send size={22} /></motion.div>
                    <span>З'ЄДНАННЯ...</span>
                  </span>
                ) : (
                  <>
                    <span>Записатися на аудит в Telegram</span>
                    <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacts" className="py-20 px-6 border-t border-white/5 bg-dark">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="max-w-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-black text-sm">I</div>
              <h2 className="font-outfit text-3xl font-black tracking-tighter uppercase text-white">IGADSFLEX</h2>
            </div>
            <p className="text-sm text-white/30 font-light leading-relaxed mb-10 uppercase tracking-widest text-[10px]">
              Професійні системи Meta Ads для бізнесу. <br /> Тільки цифри. Тільки результат.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-20">
            <div className="space-y-6">
              <h4 className="text-accent text-[10px] font-black uppercase tracking-[0.3em]">Social</h4>
              <nav className="flex flex-col space-y-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                <a href="https://t.me/igadsflex" className="hover:text-white transition-colors">Telegram</a>
                <a href="https://www.instagram.com/yarovyi.vision/" className="hover:text-white transition-colors">Instagram</a>
                <a href="https://wa.me/4917662832957" className="hover:text-white transition-colors">WhatsApp</a>
              </nav>
            </div>
            <div className="space-y-6">
              <h4 className="text-accent text-[10px] font-black uppercase tracking-[0.3em]">Direct</h4>
              <nav className="flex flex-col space-y-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                <button onClick={() => scrollTo('offer')} className="text-left hover:text-white transition-colors">Запис</button>
                <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="text-left hover:text-white transition-colors">Вгору</button>
              </nav>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[8px] text-white/10 font-bold uppercase tracking-[0.4em] gap-4">
          <span>© {new Date().getFullYear()} IGADSFLEX / Ігор Яровий</span>
          <span>Performance & Growth Architecture</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
