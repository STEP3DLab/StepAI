(function(){
  // Reveal on scroll
  const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in');});},{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // Section highlight in nav
  const sections=['about','services','estimator','projects','blog','contact'];
  const navLinks=[...document.querySelectorAll('.nav a.link')];
  const secIO=new IntersectionObserver(ents=>{ents.forEach(ent=>{if(ent.isIntersecting){navLinks.forEach(a=>{const on=a.getAttribute('href')==='#'+ent.target.id;a.classList.toggle('active',on);a.setAttribute('aria-current',on?'page':'false');});}})},{rootMargin:'-40% 0px -55% 0px'});
  sections.forEach(id=>{const s=document.getElementById(id);if(s)secIO.observe(s);});

  // Mobile nav toggle with focus trap
  const navEl=document.querySelector('.nav'); const menuBtn=document.getElementById('menu');
  let navFocusables=[]; let lastFocused=null;
  function closeNav(){navEl.dataset.open='false';menuBtn.setAttribute('aria-expanded','false');document.removeEventListener('keydown',navKey);document.removeEventListener('click',navClick,true);lastFocused&&lastFocused.focus();}
  function openNav(){navEl.dataset.open='true';menuBtn.setAttribute('aria-expanded','true');navFocusables=[...navEl.querySelectorAll('.links a')];lastFocused=document.activeElement;navFocusables[0]?.focus();document.addEventListener('keydown',navKey);document.addEventListener('click',navClick,true);}
  function navKey(e){if(e.key==='Escape'){closeNav();return;}if(e.key==='Tab'){const f=document.activeElement;const i=navFocusables.indexOf(f);if(e.shiftKey){if(i<=0){e.preventDefault();navFocusables[navFocusables.length-1].focus();}}else{if(i===navFocusables.length-1){e.preventDefault();navFocusables[0].focus();}}}}
  function navClick(e){if(!navEl.contains(e.target))closeNav();}
  menuBtn?.addEventListener('click',()=>{navEl.dataset.open==='true'?closeNav():openNav();});
  navEl.querySelectorAll('.links a').forEach(a=>a.addEventListener('click',closeNav));

  // Telegram cover
  (function(){const a=document.getElementById('tgCover');if(!a)return;const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='1280' height='640'><rect width='100%' height='100%' fill='white'/><g fill='none' stroke='black' opacity='0.06'>${Array.from({length:64}).map((_,i)=>`<line x1='${i*20}' y1='0' x2='${i*20}' y2='640'/>`).join('')}${Array.from({length:32}).map((_,i)=>`<line x1='0' y1='${i*20}' x2='1280' y2='${i*20}'/>`).join('')}</g><text x='50%' y='50%' font-family='Arial,Helvetica,sans-serif' font-size='144' font-weight='700' fill='black' text-anchor='middle' dominant-baseline='central'>Step3D</text><text x='50%' y='62%' font-family='Arial,Helvetica,sans-serif' font-size='28' fill='black' text-anchor='middle'>Агрегатор 3D‑услуг • step3d.tech</text><text x='50%' y='74%' font-family='Arial,Helvetica,sans-serif' font-size='20' fill='black' text-anchor='middle'>#мечтай #учись #твори #вдохновляй</text></svg>`;const blob=new Blob([svg],{type:'image/svg+xml'});a.href=URL.createObjectURL(blob);})();

  // Theme toggle
  const root=document.documentElement; const themeBtn=document.getElementById('theme'); const key='theme-step3d';
  function apply(mode){const sysDark=window.matchMedia('(prefers-color-scheme: dark)').matches;const useDark=mode==='auto'?sysDark:(mode==='dark');root.classList.toggle('dark',useDark);root.dataset.theme=mode;if(themeBtn){themeBtn.textContent=mode==='dark'?'☾':mode==='light'?'☼':'◐';themeBtn.setAttribute('aria-label','Тема: '+mode);}updateThemeMeta();}
  function toggleTheme(){let mode=localStorage.getItem(key)||'auto';mode=mode==='auto'?'light':mode==='light'?'dark':'auto';localStorage.setItem(key,mode);apply(mode);toast('Тема: '+mode);}
  window.toggleTheme=toggleTheme;apply(localStorage.getItem(key)||'auto');
  themeBtn?.addEventListener('click',toggleTheme);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if((localStorage.getItem(key)||'auto')==='auto')apply('auto');});

  // Scroll progress + mobile CTA
  (function(){const bar=document.getElementById('progress');const cta=document.getElementById('cta');function onScroll(){const h=document.documentElement;const max=h.scrollHeight-h.clientHeight;const p=max>0?(h.scrollTop/max)*100:0;if(bar)bar.style.width=p+'%';if(cta)cta.hidden=h.scrollTop<420;}document.addEventListener('scroll',onScroll,{passive:true});onScroll();})();

  // Fetch data
  let projects=[]; let posts=[];
  const projEl=document.getElementById('proj');
  const blogEl=document.getElementById('bloglist');
  fetch('assets/data/projects.json').then(r=>r.json()).then(j=>{projects=j;window.PROJECTS=j;renderProjects();}).catch(()=>{renderProjects();});
  fetch('assets/data/blog.json').then(r=>r.json()).then(j=>{posts=j;window.POSTS=j;renderBlog();}).catch(()=>{renderBlog();});

  // Projects render + filter + modal
  let activeTag='Все'; let query='';
  function renderProjects(){if(!projEl)return;const res=(projects||[]).filter(p=>{const byTag=activeTag==='Все'||(p.tags||[]).includes(activeTag);const text=(p.title+' '+p.teaser+' '+(p.tags||[]).join(' ')).toLowerCase();const byQ=query?text.includes(query.toLowerCase()):true;return byTag&&byQ;});projEl.innerHTML=res.map(p=>`<div class="card project"><div class="img"><div style="position:absolute;inset:0;display:grid;place-items:center;color:rgba(0,0,0,.35)">▦</div></div><div class="pad" style="padding:var(--space-6)"><div class="badges">${(p.tags||[]).map(t=>`<span class="badge">${t}</span>`).join('')}</div><h3 style="margin:10px 0 4px 0">${p.title}</h3><div class="soft" style="font-size:14px">${p.teaser}</div><div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px"><span class="soft" style="font-size:12px">${p.kpi||''}</span><button class="btn more" data-id="${p.id}">Подробнее ▸</button></div></div></div>`).join('');}
  document.querySelectorAll('.tag').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.tag').forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeTag=btn.dataset.tag;renderProjects();}));
  document.getElementById('q')?.addEventListener('input',e=>{query=e.target.value;renderProjects();});
  projEl?.addEventListener('click',e=>{const id=e.target.closest('.more')?.dataset.id;if(!id)return;openModal(id,e.target);});

  const modal=document.getElementById('modal');const modalBody=document.getElementById('modalBody');const modalClose=modal?.querySelector('.modal__close');let modalPrev=null;function openModal(id,src){if(!modal||!modalBody||!modalClose)return;modalPrev=src;const data=projects.find(p=>p.id===id);if(!data){toast('Данные недоступны');return;}modalBody.innerHTML=`<h3>${data.title}</h3><p class="soft" style="margin:8px 0">${data.teaser||''}</p><div>${(data.kpi||[]).map(k=>`<div>• ${k}</div>`).join('')}</div><h4 style="margin-top:12px">Stack</h4><ul>${(data.stack||[]).map(s=>`<li>${s}</li>`).join('')}</ul><h4 style="margin-top:12px">Steps</h4><ol>${(data.steps||[]).map(s=>`<li>${s}</li>`).join('')}</ol>`;modal.hidden=false;setTimeout(()=>modalClose.focus(),0);document.addEventListener('keydown',modalKey);logger?.log('modal_open',{id});}
  function closeModal(){if(!modal)return;modal.hidden=true;document.removeEventListener('keydown',modalKey);modalPrev&&modalPrev.focus();}
  function modalKey(e){if(e.key==='Escape'){closeModal();}if(e.key==='Tab'){const f=[modalClose,...modalBody.querySelectorAll('a,button,input,textarea,select')];let i=f.indexOf(document.activeElement);if(e.shiftKey){if(i<=0){e.preventDefault();f[f.length-1].focus();}}else{if(i===f.length-1){e.preventDefault();f[0].focus();}}}}
  modal?.addEventListener('click',e=>{if(e.target.id==='modal'||e.target===modalClose)closeModal();});

  // Blog
  function renderBlog(q=''){if(!blogEl)return;blogEl.innerHTML=(posts||[]).filter(p=>(p.title+' '+p.excerpt).toLowerCase().includes(q.toLowerCase())).map(p=>`<article class="post card pad"><div style="display:flex;align-items:center;justify-content:space-between"><time datetime="${p.date}">${p.date}</time><span class="badge">Новое</span></div><h3 style="margin:10px 0 4px 0">${p.title}</h3><div class="soft" style="font-size:14px">${p.excerpt}</div><div style="margin-top:10px"><a class="btn" href="#blog">Читать ▸</a></div></article>`).join('');}
  renderBlog();
  document.getElementById('bq')?.addEventListener('input',e=>renderBlog(e.target.value));

  // Year & progress click
  const yEl=document.getElementById('y');if(yEl)yEl.textContent=new Date().getFullYear();
  document.getElementById('progress')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

  // Toast helper
  const toastBox=document.createElement('div');toastBox.id='toastBox';toastBox.setAttribute('aria-live','polite');document.body.appendChild(toastBox);
  function toast(msg){const t=document.createElement('div');t.className='toast';t.textContent=msg;toastBox.appendChild(t);setTimeout(()=>t.remove(),2600);} window.toast=toast;

  // Share API
  document.getElementById('share')?.addEventListener('click',async()=>{const data={title:'Step3D — агрегатор 3D‑услуг',text:'Посмотри Step3D: 3D‑моделирование, печать, сканирование, XR',url:location.href};try{if(navigator.share){await navigator.share(data);}else{await navigator.clipboard.writeText(location.href);toast('Ссылка скопирована');logger?.log('share_copy');}}catch{toast('Не удалось поделиться');}});

  // Copy buttons
  document.querySelectorAll('.copy').forEach(btn=>btn.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(btn.dataset.copy||'');toast('Скопировано');}catch{toast('Не удалось скопировать');}}));

  // Lead form
  const lead=document.getElementById('lead'); lead?.querySelectorAll('input,textarea').forEach(el=>{const k='lead_'+el.name;const v=localStorage.getItem(k);if(v)el.value=v;el.addEventListener('input',()=>localStorage.setItem(k,el.value));});
  document.getElementById('send')?.addEventListener('click',()=>{const fd=new FormData(lead);const payload=Object.fromEntries(fd.entries());toast('Заявка отправлена');logger?.log('lead_sent',payload);});

  // Update theme-color meta
  function updateThemeMeta(){const dark=document.documentElement.classList.contains('dark');document.querySelectorAll('meta[name="theme-color"]').forEach(m=>m.setAttribute('content',dark?'#0b0b0b':'#ffffff'));}
  window.updateThemeMeta=updateThemeMeta;

  // Print handler
  document.getElementById('print')?.addEventListener('click',()=>window.print());

  // Self-tests
  try{console.assert(document.querySelectorAll('.nav a.link').length>=6,'Nav links missing');console.assert(document.getElementById('kbarInput'),'kbar input missing');console.assert(document.getElementById('fx3d'),'fx3d missing');renderProjects();const projC=document.getElementById('proj');if(projC)console.assert(projC.children.length>=1,'Projects did not render');const priceEl=document.getElementById('price1');const volEl=document.getElementById('volume');if(priceEl&&volEl){const before=priceEl.textContent;volEl.value=String(+volEl.value+1);volEl.dispatchEvent(new Event('input'));console.assert(priceEl.textContent!==before,'Estimator did not update');}console.log('%cStep3D UI ready','color:green');}catch(e){console.warn('Self-tests failed:',e);}
})();
