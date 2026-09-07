'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDown, Plus, MoveUpRight, Pause, Play, Check, FileText, Layers, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Scene from './scene';

const Arrow = () => <ArrowUpRight size={19} strokeWidth={1.5}/>;
const phrase = 'The world is complex. Work doesn’t have to be.';

export default function Home() {
  const root = useRef<HTMLElement>(null);
  const [loaded,setLoaded] = useState(false);
  const [progress,setProgress] = useState(0);
  const [sceneReady,setSceneReady] = useState(false);
  const [paused,setPaused] = useState(false);
  const onReady = useCallback(()=>setSceneReady(true),[]);
  useEffect(()=> { const media=window.matchMedia('(prefers-reduced-motion: reduce)'); setPaused(media.matches);const change=()=>setPaused(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
  useEffect(()=> {
    const start=performance.now();
    const interval=window.setInterval(()=>{
      const elapsed=performance.now()-start;
      setProgress(Math.min(sceneReady ? 100 : 93,Math.round(elapsed/19)));
      if ((elapsed>1900 && sceneReady) || elapsed>4200 || paused) {setProgress(100);setLoaded(true);window.clearInterval(interval);}
    },45);
    return()=>window.clearInterval(interval);
  },[sceneReady,paused]);
  useEffect(()=> {
    if(!loaded) return;
    let stop=()=>{},disposed=false;
    Promise.all([import('gsap'),import('gsap/ScrollTrigger'),import('lenis')]).then(([{gsap},{ScrollTrigger},{default:Lenis}])=>{
      if(disposed)return;
      gsap.registerPlugin(ScrollTrigger);
      const lenis = paused ? null : new Lenis({duration:1.15,smoothWheel:true,anchors:true});
      const tick=(time:number)=>lenis?.raf(time*1000);
      if(lenis){lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(tick);}
      const ctx=gsap.context(()=>{
        if(paused)return;
        gsap.fromTo('.hero-line > span',{yPercent:115,rotateX:-45},{yPercent:0,rotateX:0,duration:1.35,stagger:.13,ease:'power4.out',delay:.2});
        gsap.fromTo('.hero-art',{scale:.62,rotation:-24,opacity:0},{scale:1,rotation:0,opacity:1,duration:1.8,ease:'power3.out',delay:.05});
        gsap.fromTo('.site-header,.hero-top,.hero-bottom,.hero-caption',{y:20,opacity:0},{y:0,opacity:1,duration:1,stagger:.1,delay:.45});
        gsap.to('.hero h1',{y:-100,rotateX:12,scale:.96,transformOrigin:'left center',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
        gsap.fromTo('.manifesto-word',{color:'#434954'},{color:'#f0f2f6',stagger:.12,ease:'none',scrollTrigger:{trigger:'.manifesto-copy',start:'top 78%',end:'bottom 40%',scrub:.6}});
        gsap.fromTo('.intro-bottom',{y:65},{y:0,scrollTrigger:{trigger:'.intro-bottom',start:'top bottom',end:'top 65%',scrub:1}});
        gsap.to('.system-copy-first',{y:-55,opacity:0,scrollTrigger:{trigger:'.transformation',start:'top -20%',end:'top -65%',scrub:.7}});
        gsap.fromTo('.system-copy-last',{y:55,opacity:0},{y:0,opacity:1,scrollTrigger:{trigger:'.transformation',start:'top -55%',end:'top -95%',scrub:.7}});
        gsap.to('.system-progress-fill',{scaleY:1,ease:'none',scrollTrigger:{trigger:'.transformation',start:'top top',end:'bottom bottom',scrub:.3}});
        gsap.to('.system-label-before',{opacity:.2,scrollTrigger:{trigger:'.transformation',start:'top -35%',end:'top -80%',scrub:.5}});
        gsap.fromTo('.system-label-after',{opacity:.2},{opacity:1,scrollTrigger:{trigger:'.transformation',start:'top -35%',end:'top -80%',scrub:.5}});
        gsap.fromTo('.work-visual',{rotateX:14,rotateY:-5,scale:.84},{rotateX:0,rotateY:0,scale:1,scrollTrigger:{trigger:'.work-visual-wrap',start:'top 92%',end:'top 14%',scrub:1}});
        gsap.fromTo('.architecture-image',{scale:1.2,yPercent:-8},{scale:1,yPercent:5,scrollTrigger:{trigger:'.work-visual',start:'top bottom',end:'bottom top',scrub:1}});
        gsap.fromTo('.structo-interface',{y:100,rotateY:-12,rotateX:10},{y:-35,rotateY:0,rotateX:0,scrollTrigger:{trigger:'.work-visual',start:'top 75%',end:'bottom 25%',scrub:1}});
        gsap.utils.toArray<HTMLElement>('.approach-row').forEach(el=>gsap.fromTo(el,{rotateX:18,y:65},{rotateX:0,y:0,scrollTrigger:{trigger:el,start:'top 95%',end:'top 60%',scrub:.8}}));
        gsap.fromTo('.possibility-line.one',{xPercent:12},{xPercent:-12,scrollTrigger:{trigger:'.possibility',start:'top bottom',end:'bottom top',scrub:1}});
        gsap.fromTo('.possibility-line.two',{xPercent:-14},{xPercent:8,scrollTrigger:{trigger:'.possibility',start:'top bottom',end:'bottom top',scrub:1}});
        gsap.fromTo('.footer-wordmark',{yPercent:40,rotateX:45},{yPercent:0,rotateX:0,scrollTrigger:{trigger:'.site-footer',start:'top 70%',end:'bottom bottom',scrub:1}});
        gsap.to('.footer-asterisk',{rotation:150,scrollTrigger:{trigger:'.site-footer',start:'top bottom',end:'bottom bottom',scrub:1}});
      },root);
      const refresh=()=>ScrollTrigger.refresh();document.fonts.ready.then(refresh);window.addEventListener('load',refresh);ScrollTrigger.refresh();
      stop=()=>{ctx.revert();gsap.ticker.remove(tick);lenis?.destroy();window.removeEventListener('load',refresh);};
    });
    return()=>{disposed=true;stop();};
  },[loaded,paused]);

  return <main ref={root} className={`${loaded?'is-ready':''} ${paused?'motion-paused':''}`}>
    <a className="skip-link" href="#approach">Skip to content</a>
    <div className={`loader ${loaded?'loader-finished':''}`} aria-hidden={loaded} role="status" aria-label="Preparing the experience">
      <div className="loader-top"><span>EGEKVIST & SKOVSTED</span><span>INDEPENDENT MINDS.</span></div>
      <div className="loader-center"><span className="loader-symbol">&</span><p>Good things start with a little complexity.</p></div>
      <div className="loader-bottom"><span>MAKING ROOM FOR SIMPLE</span><span>{String(progress).padStart(3,'0')}%</span><Progress className="loader-progress" value={progress} aria-label="Loading experience"/></div>
    </div>
    <header className="site-header"><a className="wordmark" href="#top" aria-label="Egekvist & Skovsted home">Egekvist <span>& Skovsted</span><i>®</i></a><nav aria-label="Main navigation"><a href="#approach">Our approach</a><a href="#work">Selected work <sup>01</sup></a></nav><a className="contact-nav" href="mailto:mail@structo.dk">Let’s talk <span><Arrow/></span></a></header>
    <section className="hero" id="top"><div className="hero-top"><span className="eyebrow"><i className="status-dot"/> INDEPENDENT MINDS. INTELLIGENT SOFTWARE.</span><span className="edition">BUILT IN DENMARK. THINKING BEYOND.</span></div><div className="hero-art"><Scene kind="hero" paused={paused} onReady={onReady}/></div><h1 aria-label="Making complex work feel simple"><span className="hero-line"><span>Making complex</span></span><span className="hero-line"><span>work feel <em>simple.</em></span></span></h1><div className="hero-bottom"><p>We turn the work that slows the world down<br className="desktop-break"/> into software that moves it forward.</p><a className="circle-link" href="#approach"><span>SCROLL TO SIMPLIFY</span><i><ArrowDown size={20}/></i></a></div><div className="hero-caption"><span>HUMAN AMBITION × ARTIFICIAL INTELLIGENCE</span><span>01 — ∞</span></div></section>

    <section className="intro section-pad" id="approach"><div className="section-marker"><span className="eyebrow">01 / THE WAY WE SEE IT</span><Plus size={18}/></div><h2 className="manifesto-copy">{phrase.split(' ').map((word,i)=><span className="manifesto-word" key={i}>{word} </span>)}</h2><div className="intro-bottom"><span className="mini-asterisk" aria-hidden="true">✳</span><div><p>Too many brilliant minds are busy doing work that shouldn’t be hard.</p><p>We find the manual, the repetitive, the unnecessarily complex. Then we use AI to turn it into something remarkably simple. So people can get back to moving the world forward.</p></div></div></section>

    <section className="transformation" id="transformation"><div className="system-sticky"><div className="system-top"><span className="eyebrow">COMPLEXITY, RECONSIDERED.</span><span className="eyebrow">SCROLL TO TRANSFORM ↓</span></div><div className="system-copy"><div className="system-copy-first"><span className="small-index">[ BEFORE ]</span><h2>So much work.<br/>So little flow.</h2><p>Scattered information. Repeated tasks.<br/>Potential, waiting to be unlocked.</p></div><div className="system-copy-last"><span className="small-index">[ AFTER ]</span><h2>Everything<br/><em>falls into place.</em></h2><p>One intelligent system.<br/>A simpler way to move forward.</p></div></div><div className="system-art"><Scene kind="system" paused={paused}/></div><div className="system-progress"><span>01</span><div><i className="system-progress-fill"/></div><span>02</span></div><div className="system-bottom"><span className="system-label-before">FROM FRICTION</span><span className="system-bottom-line"/><span className="system-label-after">TO FLOW</span></div></div></section>

    <section className="work-section section-pad" id="work"><div className="section-marker"><span className="eyebrow">02 / IDEAS, OUT IN THE WORLD</span><span className="eyebrow">SELECTED WORK — 01</span></div><div className="work-heading"><h2>Less busywork.<br/><span>More possibility.</span></h2><p>A better way of working isn’t a distant idea.<br/>It’s something we’re building. Right now.</p></div><div className="work-visual-wrap"><div className="work-visual"><img className="architecture-image" src="/architecture.jpg" alt="Sculptural concrete architecture in sunlight against a blue sky" width="1536" height="1024" loading="lazy"/><div className="visual-brand"><span className="structo-icon">▥</span> structo<span className="visual-tag">INTELLIGENCE FOR THE BUILT WORLD</span></div><div className="structo-interface" aria-label="Illustrative Structo project overview"><div className="interface-top"><span><span className="structo-icon">▥</span> structo</span><span className="concept-label">PLATFORM CONCEPT</span></div><div className="interface-content"><span className="interface-kicker">DIT PROJEKT. SAMLET.</span><h3>Fra krav til klarhed.</h3><div className="interface-project"><Layers size={17}/><span>Projektoversigt</span><span className="project-status"><i/> Klar til overblik</span></div>{[['Lokalplaner','Find det relevante'],['Bygningsreglementet','Forstå kravene'],['Myndighedskrav','Arbejd videre']].map(([title,text])=><div className="interface-row" key={title}><FileText size={16}/><div><strong>{title}</strong><span>{text}</span></div><Check size={15}/></div>)}<div className="interface-ai"><Sparkles size={15}/><span>Mindre søgning. Mere sammenhæng.</span></div></div></div><span className="work-visual-bottom">A NEW PERSPECTIVE ON ARCHITECTURE.</span></div></div>
      <div className="work-details" lang="da"><div className="work-title"><span className="eyebrow">STRUCTO / AI TIL BYGGEBRANCHEN</span><h3>Brug mindre tid på regler.<br/><span>Mere tid på arkitektur.</span></h3><a href="https://structo.dk" target="_blank" rel="noreferrer" className="text-link">Oplev Structo <Arrow/></a></div><div className="work-description"><p>Structo hjælper arkitekter, bygningskonstruktører og andre rådgivere i byggebranchen med at bruge mindre tid på at finde og gennemgå regler og krav.</p><p>Platformen samler relevant information om et byggeprojekt og gør det lettere at finde, forstå og arbejde med blandt andet lokalplaner, bygningsreglementet og andre myndighedskrav.</p><p>Målet er enkelt: mindre tid på manuelt regelarbejde og mere tid på projektering, rådgivning og arkitektur.</p></div></div>
    </section>

    <section className="method section-pad"><div className="section-marker"><span className="eyebrow">03 / HOW CHANGE HAPPENS</span><Plus size={18}/></div><div className="method-heading"><h2>Big change.<br/>Simple beginnings.</h2><p>We don’t start with technology.<br/>We start with something worth solving.</p></div><div className="approach-list">{[{n:'01',title:'Find the friction.',description:'The spreadsheets. The endless searching. The “there must be a better way.” That’s where we begin.',tag:'SEE THE OPPORTUNITY'},{n:'02',title:'Rethink the work.',description:'We bring human understanding and artificial intelligence together to build a better way through.',tag:'BUILD WITH INTELLIGENCE'},{n:'03',title:'Make room for more.',description:'Less effort on the repetitive. More energy for the remarkable. Software that gives ambition room to grow.',tag:'UNLOCK HUMAN POTENTIAL'}].map(item=><article className="approach-row" key={item.n}><span className="approach-number">/{item.n}</span><div><h3>{item.title}</h3><p>{item.description}</p></div><span className="approach-tag">{item.tag}</span><MoveUpRight size={28} strokeWidth={1}/></article>)}</div></section>

    <section className="possibility"><span className="eyebrow">LESS OF WHAT HOLDS US BACK. MORE OF WHAT MOVES US.</span><div className="possibility-lines" aria-label="Less friction. More future."><div className="possibility-line one" aria-hidden="true">Less friction. <span>Less friction.</span></div><div className="possibility-line two" aria-hidden="true"><span>More future.</span> More future.</div></div><p>We believe the next revolution is a quieter one.<br/>Work that just works. People free to do more.<br/>A world moving forward, one simple idea at a time.</p><span className="possibility-footnote">THAT’S THE FUTURE WE’RE BUILDING.</span></section>

    <footer id="contact" className="site-footer"><div className="footer-top"><span className="eyebrow"><i className="status-dot"/> GOOD CONVERSATIONS BUILD GREAT THINGS.</span><a href="#top" className="back-top">BACK TO TOP ↑</a></div><div className="footer-callout"><h2>Complex challenge?<br/><a href="mailto:mail@structo.dk">Let’s make it simple.<ArrowUpRight strokeWidth={1}/></a></h2><span className="footer-asterisk" aria-hidden="true">✳</span></div><div className="footer-contact"><a href="mailto:mail@structo.dk">mail@structo.dk <Arrow/></a><p>Independent minds.<br/>Building a simpler tomorrow.</p></div><div className="footer-wordmark" aria-label="Egekvist & Skovsted">Egekvist <span>&</span> Skovsted<span className="footer-reg">®</span></div><div className="footer-bottom"><span>© {new Date().getFullYear()} EGEKVIST & SKOVSTED</span><span>MADE OF CURIOSITY. POWERED BY AI.</span><button onClick={()=>setPaused(!paused)} aria-pressed={paused}>{paused?<Play size={12}/>:<Pause size={12}/>} MOTION {paused?'OFF':'ON'}</button></div></footer>
    <noscript><style>{'.loader{display:none}.hero-line>span{transform:none!important;opacity:1!important}.system-copy-last{display:none}'}</style></noscript>
  </main>
}
