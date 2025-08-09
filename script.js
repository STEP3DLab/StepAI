    // Reveal on scroll
    const io = new IntersectionObserver((entries)=>{ entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in') }) }, {threshold:.12});
    document.querySelectorAll('.reveal').forEach(el=> io.observe(el));

    // Section highlight in nav
    const sections=['about','services','estimator','projects','blog','contact'];
    const navLinks=[...document.querySelectorAll('.nav a.link')];
    const secIO=new IntersectionObserver((ents)=>{ ents.forEach(ent=>{ if(ent.isIntersecting){ navLinks.forEach(a=>{ const on=a.getAttribute('href')==='#'+ent.target.id; a.classList.toggle('active',on); a.setAttribute('aria-current',on?'page':'false'); }); } }) }, {rootMargin:'-40% 0px -55% 0px'});
    sections.forEach(id=>{ const s=document.getElementById(id); if(s) secIO.observe(s); });

    // Mobile nav toggle
    const navEl=document.querySelector('.nav'); const menuBtn=document.getElementById('menu');
    menuBtn?.addEventListener('click',()=>{ const open=navEl?.dataset.open==='true'; if(navEl){ navEl.dataset.open=String(!open); } menuBtn.setAttribute('aria-expanded',String(!open)); });
    document.querySelectorAll('.nav .links a').forEach(a=> a.addEventListener('click',()=>{ if(navEl){ navEl.dataset.open='false'; } menuBtn?.setAttribute('aria-expanded','false'); }));

    // 3D Canvas in hero (interactive wireframe torus)
    (function(){
      const cv=document.getElementById('fx3d'); if(!cv) return; const ctx=cv.getContext('2d');
      const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      function resize(){ cv.width=window.innerWidth; cv.height=Math.max(360,window.innerHeight*0.6); }
      window.addEventListener('resize',resize,{passive:true}); resize();
      let t=0,mx=0,my=0; window.addEventListener('mousemove',e=>{ const r=cv.getBoundingClientRect(); mx=(e.clientX-r.left)/r.width-0.5; my=(e.clientY-r.top)/r.height-0.5; },{passive:true});
      function proj(x,y,z,s){ const f=3; const k=s/(z+f); return [x*k,y*k]; }
      function draw(dt){ t+=dt; const w=cv.width,h=cv.height,s=Math.min(w,h)/2.3; ctx.clearRect(0,0,w,h); ctx.save(); ctx.translate(w/2,h/2); ctx.globalAlpha=.6; ctx.lineWidth=1; ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue('--fg')||'#000'; const R=1.15,r=.42,U=36,V=18; const rx=t*.6+my*1.2,ry=t*.4+mx*1.2,rz=t*.2; for(let i=0;i<=U;i++){ ctx.beginPath(); for(let j=0;j<=V;j++){ const u=i/U*Math.PI*2,v=j/V*Math.PI*2; let x=(R+r*Math.cos(v))*Math.cos(u); let y=(R+r*Math.cos(v))*Math.sin(u); let z=r*Math.sin(v); let X=x,Y=y*Math.cos(rx)-z*Math.sin(rx),Z=y*Math.sin(rx)+z*Math.cos(rx); let X2=X*Math.cos(ry)+Z*Math.sin(ry),Y2=Y,Z2=-X*Math.sin(ry)+Z*Math.cos(ry); let X3=X2*Math.cos(rz)-Y2*Math.sin(rz),Y3=X2*Math.sin(rz)+Y2*Math.cos(rz),Z3=Z2; const p=proj(X3,Y3,Z3,s); if(j===0) ctx.moveTo(p[0],p[1]); else ctx.lineTo(p[0],p[1]); } ctx.stroke(); }
        for(let j=0;j<=V;j++){ ctx.beginPath(); for(let i=0;i<=U;i++){ const u=i/U*Math.PI*2,v=j/V*Math.PI*2; let x=(R+r*Math.cos(v))*Math.cos(u); let y=(R+r*Math.cos(v))*Math.sin(u); let z=r*Math.sin(v); let X=x,Y=y*Math.cos(rx)-z*Math.sin(rx),Z=y*Math.sin(rx)+z*Math.cos(rx); let X2=X*Math.cos(ry)+Z*Math.sin(ry),Y2=Y,Z2=-X*Math.sin(ry)+Z*Math.cos(ry); let X3=X2*Math.cos(rz)-Y2*Math.sin(rz),Y3=X2*Math.sin(rz)+Y2*Math.cos(rz),Z3=Z2; const p=proj(X3,Y3,Z3,s); if(i===0) ctx.moveTo(p[0],p[1]); else ctx.lineTo(p[0],p[1]); } ctx.stroke(); } ctx.restore(); }
      function frame(){ if(reduce||document.hidden){ draw(0); return; } draw(0.012); requestAnimationFrame(frame); }
      document.addEventListener('visibilitychange',()=>{ if(!document.hidden) requestAnimationFrame(frame); }); frame();
    })();

    // Telegram cover (Step3D logo)
    (function(){ const a=document.getElementById('tgCover'); if(!a) return; const svg=`
<svg xmlns='http://www.w3.org/2000/svg' width='1280' height='640'>
  <rect width='100%' height='100%' fill='white'/>
  <g fill='none' stroke='black' opacity='0.06'>
    ${Array.from({length:64}).map((_,i)=>`<line x1='${i*20}' y1='0' x2='${i*20}' y2='640'/>`).join('')}
    ${Array.from({length:32}).map((_,i)=>`<line x1='0' y1='${i*20}' x2='1280' y2='${i*20}'/>`).join('')}
  </g>
  <text x='50%' y='50%' font-family='Inter,Arial,Helvetica,sans-serif' font-size='144' font-weight='700' fill='black' text-anchor='middle' dominant-baseline='central'>Step3D</text>
  <text x='50%' y='62%' font-family='Inter,Arial,Helvetica,sans-serif' font-size='28' fill='black' text-anchor='middle'>Агрегатор 3D‑услуг • step3d.tech</text>
  <text x='50%' y='74%' font-family='Inter,Arial,Helvetica,sans-serif' font-size='20' fill='black' text-anchor='middle'>#мечтай  #учись  #твори  #вдохновляй</text>
</svg>`; const blob=new Blob([svg],{type:'image/svg+xml'}); const url=URL.createObjectURL(blob); a.href=url; })();

    // Theme toggle (auto → light → dark)
    (function(){ const root=document.documentElement; const btn=document.getElementById('theme'); const key='theme-step3d'; function apply(mode){ const sysDark=window.matchMedia('(prefers-color-scheme: dark)').matches; const useDark=mode==='auto'?sysDark:(mode==='dark'); root.classList.toggle('dark',useDark); root.dataset.theme=mode; if(btn){ btn.textContent=mode==='dark'?'☾':mode==='light'?'☼':'◐'; btn.setAttribute('aria-label','Тема: '+mode); } }
      let mode=localStorage.getItem(key)||'auto'; apply(mode); window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{ if((localStorage.getItem(key)||'auto')==='auto') apply('auto'); }); btn?.addEventListener('click',()=>{ mode=mode==='auto'?'light':mode==='light'?'dark':'auto'; localStorage.setItem(key,mode); apply(mode); updateThemeMeta(); toast('Тема: '+mode); }); })();

    // Scroll progress + mobile CTA
    (function(){ const bar=document.getElementById('progress'); const cta=document.getElementById('cta'); function onScroll(){ const h=document.documentElement; const max=h.scrollHeight-h.clientHeight; const p=max>0?(h.scrollTop/max)*100:0; bar.style.width=p+'%'; cta.hidden=h.scrollTop<420; } document.addEventListener('scroll',onScroll,{passive:true}); onScroll(); })();

    // Estimator (basic)
    const RATES={FDM:8,SLA:68,SLS:105}; let tech='FDM'; let vol=50; let rush=false; const priceEl=document.getElementById('price'); const volEl=document.getElementById('vol'); const volValEl=document.getElementById('volv'); const rushEl=document.getElementById('rush');
    function rf(n){return n.toLocaleString('ru-RU')} function calc(){ const base=vol*RATES[tech]; const k=rush?1.3:1; priceEl.textContent=`≈ ${rf(Math.round(base*k))} ₽`; }
    document.querySelectorAll('[data-tech]').forEach(btn=> btn.addEventListener('click',()=>{ tech=btn.getAttribute('data-tech'); document.querySelectorAll('[data-tech]').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); calc(); }));
    volEl.addEventListener('input',e=>{ vol=+e.target.value; volValEl.textContent=vol; calc(); }); rushEl.addEventListener('change',e=>{ rush=e.target.checked; calc(); }); calc();

    // Projects data & rendering
    const PROJECTS=[
      {id:'kawasaki',title:'Композиционный обвес для Kawasaki Puccetti Racing (с Umatex/Росатом)',teaser:'Инжиниринг, CAD и прототипирование элементов обвеса под реальные нагрузки.',tags:['Дизайн','CAD','Печать'],kpi:'Снижение веса на 18%'},
      {id:'bot',title:'Step3D Bot — чат‑бот для заказа 3D‑услуг',teaser:'Интерфейс в Telegram, автооценка и маршрутизация задач.',tags:['VR/AR','Реверс','CAD'],kpi:'КП за 1–2 минуты'},
      {id:'xr',title:'Step3D XR — лаборатория VR/AR/MR‑решений',teaser:'Интерактивные демо‑стенды, обучение и промышленный маркетинг.',tags:['VR/AR','Дизайн']},
      {id:'reverse',title:'Реверс‑инжиниринг точных деталей',teaser:'Скан → CAD по облаку → анализ отклонений. Полная 2D/3D‑документация.',tags:['Реверс','Сканирование','CAD']},
      {id:'fdm',title:'FDM‑серия корпусов для электроники',teaser:'Стабильная мелкосерия на нескольких принтерах, сборка и постобработка.',tags:['Печать','Дизайн']},
      {id:'sla',title:'SLA‑мастер‑модели с высокой детализацией',teaser:'Гладкая поверхность, тонкие стенки, готово под силиконовые формы.',tags:['Печать']}
    ];
    let activeTag='Все'; let query=''; const projEl=document.getElementById('proj');
    function renderProjects(){ const res=PROJECTS.filter(p=>{ const byTag=activeTag==='Все'||p.tags.includes(activeTag); const text=(p.title+' '+p.teaser+' '+p.tags.join(' ')).toLowerCase(); const byQ=query?text.includes(query.toLowerCase()):true; return byTag&&byQ; }); projEl.innerHTML=res.map(p=>`<div class="card project"><div class="img"><div style="position:absolute;inset:0;display:grid;place-items:center;color:rgba(0,0,0,.35)">▦</div></div><div class="pad" style="padding:var(--space-6)"><div class="badges">${p.tags.map(t=>`<span class="badge">${t}</span>`).join('')}</div><h3 style="margin:10px 0 4px 0">${p.title}</h3><div class="soft" style="font-size:14px">${p.teaser}</div><div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px"><span class="soft" style="font-size:12px">${p.kpi??''}</span><a class="btn" href="#contact">Подробнее ▸</a></div></div></div>`).join(''); }
    document.querySelectorAll('.tag').forEach(btn=> btn.addEventListener('click',()=>{ document.querySelectorAll('.tag').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); activeTag=btn.getAttribute('data-tag'); renderProjects(); }));
    document.getElementById('q').addEventListener('input',e=>{ query=e.target.value; renderProjects(); }); renderProjects();

    // Blog
    const POSTS=[
      {id:'cp-fast',title:'Как мы сокращаем путь к КП до 1–2 минут',date:'2024‑07‑19',excerpt:'AI‑модуль Step3D_system автоматически оценивает трудоёмкость, подбирает исполнителей и формирует прозрачное КП. Рассказываем архитектуру и гайдлайны.'},
      {id:'fdm-vs-sla',title:'FDM vs SLA: когда и что выбирать',date:'2024‑08‑05',excerpt:'Сравниваем стоимость на см³, качество поверхности и сроки. Пару практических правил, чтобы не переплачивать.'},
      {id:'reverse-practice',title:'Реверс‑инжиниринг: от скана до CAD',date:'2024‑08‑12',excerpt:'Пайплайн: скан → очистка → совмещение → NURBS/CAD → отклонения → выпуск КД. Советы по точности и материалам.'}
    ];
    const blogEl=document.getElementById('bloglist');
    function renderBlog(qb=''){ blogEl.innerHTML=POSTS.filter(p=> (p.title+' '+p.excerpt).toLowerCase().includes(qb.toLowerCase())).map(p=>`<article class="post card pad"><div style="display:flex;align-items:center;justify-content:space-between"><time datetime="${p.date}">${p.date}</time><span class="badge">Новое</span></div><h3 style="margin:10px 0 4px 0">${p.title}</h3><div class="soft" style="font-size:14px">${p.excerpt}</div><div style="margin-top:10px"><a class="btn" href="#blog">Читать ▸</a></div></article>`).join(''); }
    renderBlog(); document.getElementById('bq').addEventListener('input',e=> renderBlog(e.target.value));

    // Year & misc
    document.getElementById('y').textContent=new Date().getFullYear();
    document.getElementById('progress').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

    // Toast helper
    function toast(msg){ const t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>{t.remove();},2600); }

    // Share API
    document.getElementById('share')?.addEventListener('click',async()=>{ const data={title:'Step3D — агрегатор 3D‑услуг',text:'Посмотри Step3D: 3D‑моделирование, печать, сканирование, XR',url:location.href}; try{ if(navigator.share){ await navigator.share(data); } else { await navigator.clipboard.writeText(location.href); toast('Ссылка скопирована'); } }catch{ toast('Не удалось поделиться'); }});

    // Copy buttons
    document.querySelectorAll('.copy').forEach(btn=> btn.addEventListener('click',async()=>{ try{ await navigator.clipboard.writeText(btn.dataset.copy||''); toast('Скопировано'); }catch{ toast('Не удалось скопировать'); } }));

    // Persist lead form + submit
    const lead=document.getElementById('lead');
    lead?.querySelectorAll('input,textarea').forEach(el=>{ const k='lead_'+el.name; const v=localStorage.getItem(k); if(v) el.value=v; el.addEventListener('input',()=>localStorage.setItem(k,el.value)); });
    document.getElementById('send').addEventListener('click',()=>{ const fd=new FormData(document.getElementById('lead')); const payload=Object.fromEntries(fd.entries()); toast('Заявка отправлена'); console.log('Lead:',payload); });

    // Update theme-color meta on theme change
    function updateThemeMeta(){ const dark=document.documentElement.classList.contains('dark'); document.querySelectorAll('meta[name="theme-color"]').forEach(m=> m.setAttribute('content',dark?'#0b0b0b':'#ffffff')); }

    // Print handler
    document.getElementById('print')?.addEventListener('click',()=> window.print());

    // Command palette (kbar) logic
    (function(){
      const kbar=document.getElementById('kbar'); const input=document.getElementById('kbarInput'); const list=document.getElementById('kbarList'); const btn=document.getElementById('searchBtn'); const btnMobile=document.getElementById('ctaSearch');
      let items=[]; let sel=0;
      function build(){ items=[
        {title:'О нас',href:'#about',type:'Раздел'},
        {title:'Услуги',href:'#services',type:'Раздел'},
        {title:'Калькулятор',href:'#estimator',type:'Раздел'},
        {title:'Проекты',href:'#projects',type:'Раздел'},
        {title:'Блог',href:'#blog',type:'Раздел'},
        {title:'Контакты',href:'#contact',type:'Раздел'},
        {title:'3D‑моделирование (CAD)',href:'#services',type:'Услуга'},
        {title:'3D‑сканирование',href:'#services',type:'Услуга'},
        {title:'3D‑печать',href:'#services',type:'Услуга'},
        {title:'Реверс‑инжиниринг',href:'#services',type:'Услуга'},
        {title:'Промышленный дизайн',href:'#services',type:'Услуга'},
        {title:'Моушен‑дизайн',href:'#services',type:'Услуга'},
        {title:'VR/AR/MR',href:'#services',type:'Услуга'},
        {title:'Курсы ДПО (РГСУ)',href:'#services',type:'Услуга'}
      ].concat(PROJECTS.map(p=>({title:p.title,sub:p.teaser,href:'#projects',type:'Проект'}))).concat(POSTS.map(p=>({title:p.title,sub:p.excerpt,href:'#blog',type:'Пост'}))); }
      function open(){ build(); kbar.hidden=false; input.value=''; render(''); setTimeout(()=>input.focus(),0); }
      function close(){ kbar.hidden=true; }
      function render(q){ const qq=q.toLowerCase().trim(); sel=0; const view=items.map(it=>{ const hay=(it.title+' '+(it.sub||'')).toLowerCase(); let score=!qq?2:hay.includes(qq)?1+(it.title.toLowerCase().startsWith(qq)?1:0):0; return {...it,score}; }).filter(i=>i.score>0).sort((a,b)=>b.score-a.score).slice(0,10); list.innerHTML=view.map((i,idx)=>`<div class="kbar__item${idx===0?' active':''}" data-href="${i.href}" tabindex="0"><div><div>${i.title}</div>${i.sub?`<div class='soft' style='font-size:12px'>${i.sub}</div>`:''}</div><div class="kbar__type">${i.type}</div></div>`).join('')||'<div class="kbar__item">Ничего не найдено</div>'; }
      function onKey(e){ if((e.key==='k'&&(e.metaKey||e.ctrlKey))|| (e.key==='/'&&e.target.tagName!=='INPUT'&&e.target.tagName!=='TEXTAREA')){ e.preventDefault(); open(); return; } if(kbar.hidden) return; if(e.key==='Escape'){ close(); return; } const els=[...list.querySelectorAll('.kbar__item[data-href]')]; if(!els.length) return; if(e.key==='ArrowDown'){ e.preventDefault(); sel=(sel+1)%els.length; els.forEach((el,i)=>el.classList.toggle('active',i===sel)); return; } if(e.key==='ArrowUp'){ e.preventDefault(); sel=(sel-1+els.length)%els.length; els.forEach((el,i)=>el.classList.toggle('active',i===sel)); return; } if(e.key==='Home'){ e.preventDefault(); sel=0; els.forEach((el,i)=>el.classList.toggle('active',i===sel)); return; } if(e.key==='End'){ e.preventDefault(); sel=els.length-1; els.forEach((el,i)=>el.classList.toggle('active',i===sel)); return; } if(e.key==='Enter'){ e.preventDefault(); const href=els[sel].getAttribute('data-href'); if(href){ location.hash=href; } close(); } }
      input.addEventListener('input',e=>render(e.target.value)); list.addEventListener('click',e=>{ const el=e.target.closest('.kbar__item'); if(!el) return; const href=el.getAttribute('data-href'); if(href){ location.hash=href; } close(); });
      document.addEventListener('keydown',onKey); btn?.addEventListener('click',open); btnMobile?.addEventListener('click',open); kbar.addEventListener('click',e=>{ if(e.target.id==='kbar') close(); });
      kbar.addEventListener('keydown',(e)=>{ if(kbar.hidden) return; if(e.key==='Tab'){ const focusables=[input,...kbar.querySelectorAll('.kbar__item')]; let i=focusables.indexOf(document.activeElement); i=e.shiftKey?(i-1+focusables.length)%focusables.length:(i+1)%focusables.length; focusables[i].focus?.(); e.preventDefault(); }});
    })();

    // ---- Self-tests (non-blocking) ----
    try{ console.assert(document.querySelectorAll('.nav a.link').length>=6,'Nav links missing'); renderProjects(); console.assert(document.getElementById('proj').children.length>=1,'Projects did not render'); console.assert(document.getElementById('kbarInput'),'kbar input missing'); console.assert(document.getElementById('fx3d'),'fx3d missing'); const before=priceEl.textContent; volEl.value=String(+volEl.value+1); volEl.dispatchEvent(new Event('input')); console.assert(priceEl.textContent!==before,'Estimator did not update'); console.log('%cStep3D UI ready','color:green'); }catch(e){ console.warn('Self-tests failed:',e); }

