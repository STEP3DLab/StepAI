(function(){
  const ROOT=location.pathname.includes('/tests/')?'..':'.';
  const list=document.getElementById('bloglist');
  const articleBox=document.getElementById('article');
  let posts=[];let currentSlug=null;let prevFocus=null;let tocObs=null;let scrollHandler=null;let seoBackup=null;
  const bq=document.getElementById('bq');
  if(bq){const clone=bq.cloneNode(true);bq.parentNode.replaceChild(clone,bq);clone.addEventListener('input',e=>renderList(e.target.value));}

  function syncGet(url){
    const xhr=new XMLHttpRequest();
    try{xhr.open('GET',url,false);xhr.send(null);}catch{return null;}
    return xhr.status>=200?xhr.responseText:null;
  }

  try{
    const meta=JSON.parse(syncGet(`${ROOT}/data/posts.json`)||'[]');
    posts=meta.map(p=>{const md=syncGet(`${ROOT}/posts/${p.slug}.md`)||'';return {...p,tags:p.keywords||[],contentHtml:mdToHtml(md)};});
    window.__BLOG__POSTS=posts;renderList();initFromHash();
  }catch(e){console.error(e);window.__BLOG__POSTS=posts;}

  function renderList(q=''){
    if(!list) return;
    const res=posts.filter(p=>(p.title+' '+p.summary).toLowerCase().includes(q.toLowerCase()));
    list.innerHTML=res.map(p=>`<article class="post card pad"><div style="display:flex;align-items:center;justify-content:space-between"><time datetime="${p.date}">${p.date}</time></div><h3 style="margin:10px 0 4px 0">${p.title}</h3><div class="soft" style="font-size:14px">${p.summary}</div><div style="margin-top:10px"><button class="btn read" data-slug="${p.slug}">Читать ▸</button></div></article>`).join('');
  }
  list?.addEventListener('click',e=>{const slug=e.target.closest('.read')?.dataset.slug;if(slug){openReader(slug,e.target.closest('.post'));}});

  function openReader(slug,src,push=true){
    if(!articleBox)return;const post=posts.find(p=>p.slug===slug);if(!post)return;
    currentSlug=slug;prevFocus=src||document.activeElement;
    buildArticle(post);
    articleBox.hidden=false;document.body.classList.add('reading');
    const h1=articleBox.querySelector('h1');h1.setAttribute('tabindex','-1');h1.focus();
    scrollHandler=updateProgress;document.addEventListener('scroll',scrollHandler,{passive:true});
    document.addEventListener('keydown',keyHandler);
    updateSEO(post);
    if(push && location.protocol!=='file:'){try{history.pushState({post:slug},'',`#blog?post=${slug}`);}catch{}}
  }

  function closeReader(){
    articleBox.hidden=true;articleBox.innerHTML='';document.body.classList.remove('reading');
    document.removeEventListener('scroll',scrollHandler);document.removeEventListener('keydown',keyHandler);
    tocObs&&tocObs.disconnect();
    prevFocus&&prevFocus.focus();
    restoreSEO();
  }

  function buildArticle(post){
    articleBox.innerHTML=`<div class="progress"></div><article class="reader"><nav class="crumbs">Блог → <span data-cat>Статьи</span> → <span data-title>${post.title}</span></nav><header><h1>${post.title}</h1><div class="meta"><time datetime="${post.date}">${post.date}</time> · <span class="readtime"></span> · <span class="tags"></span><button class="share btn">Поделиться</button></div>${post.cover?`<figure class="hero"><picture><img loading="lazy" src="${post.cover}" alt="" /></picture></figure>`:''}</header><div class="layout"><aside class="toc" aria-label="Оглавление"><button class="toc-toggle" aria-expanded="false">Оглавление</button><ol hidden></ol></aside><div class="content"></div></div><footer class="post-nav"><button class="prev btn" disabled>← Предыдущая</button><button class="next btn" disabled>Следующая →</button></footer></article>`;
    const content=articleBox.querySelector('.content');
    content.innerHTML=sanitize(post.contentHtml||'');
    content.querySelectorAll('img').forEach(i=>i.loading='lazy');
    articleBox.querySelector('.tags').textContent=(post.tags||[]).join(', ');
    const rt=articleBox.querySelector('.readtime');rt.textContent=readTime(content.textContent);
    const tocList=articleBox.querySelector('.toc ol');
    const headings=[...content.querySelectorAll('h2,h3')];
    headings.forEach((h,i)=>{if(!h.id)h.id=slugify(h.textContent)+"-"+i;const a=document.createElement('a');a.href="#"+h.id;a.textContent=h.textContent;a.addEventListener('click',e=>{e.preventDefault();document.getElementById(h.id).scrollIntoView({behavior:'smooth'});});const li=document.createElement('li');li.appendChild(a);tocList.appendChild(li);});
    tocObs=new IntersectionObserver(ents=>{ents.forEach(ent=>{if(ent.isIntersecting){const id=ent.target.id;tocList.querySelectorAll('a').forEach(a=>a.setAttribute('aria-current','false'));const link=tocList.querySelector(`a[href="#${id}"]`);link&&link.setAttribute('aria-current','true');}})},{rootMargin:'-40% 0px -55% 0px'});
    headings.forEach(h=>tocObs.observe(h));
    const tocToggle=articleBox.querySelector('.toc-toggle');const tocOl=articleBox.querySelector('.toc ol');tocToggle.addEventListener('click',()=>{const ex=tocToggle.getAttribute('aria-expanded')==='true';tocToggle.setAttribute('aria-expanded',String(!ex));tocOl.hidden=ex;});
    const show=window.innerWidth>=1024;tocToggle.setAttribute('aria-expanded',String(show));tocOl.hidden=!show;
    updateNav(post);
    articleBox.querySelector('.share').addEventListener('click',()=>share(post));
    updateProgress();
  }

  function updateNav(post){
    const idx=posts.indexOf(post);const prev=posts[idx-1];const next=posts[idx+1];const prevBtn=articleBox.querySelector('.prev');const nextBtn=articleBox.querySelector('.next');if(prev){prevBtn.disabled=false;prevBtn.dataset.slug=prev.slug;}else prevBtn.disabled=true;if(next){nextBtn.disabled=false;nextBtn.dataset.slug=next.slug;}else nextBtn.disabled=true;
  }
  articleBox.addEventListener('click',e=>{if(e.target.classList.contains('prev')){const s=e.target.dataset.slug;if(s)openReader(s,null,true);}if(e.target.classList.contains('next')){const s=e.target.dataset.slug;if(s)openReader(s,null,true);}});

  function readTime(text){const words=text.trim().split(/\s+/).filter(Boolean).length;return `~${Math.max(1,Math.round(words/200))} мин чтения`;}
  function slugify(str){return str.toLowerCase().replace(/[^a-z0-9а-яё]+/g,'-').replace(/^-+|-+$/g,'');}
  function sanitize(html){const t=document.createElement('template');t.innerHTML=html;const allowed=['P','H2','H3','UL','OL','LI','FIGURE','IMG','FIGCAPTION','PRE','CODE','BLOCKQUOTE','TABLE','THEAD','TBODY','TR','TH','TD'];(function walk(node){[...node.children].forEach(c=>{if(!allowed.includes(c.tagName)){c.replaceWith(...c.childNodes);}else walk(c);});})(t.content);return t.innerHTML;}
  function mdToHtml(md){const lines=md.split(/\r?\n/);let html='';let inList=false;for(const line of lines){if(/^###\s+/.test(line)){if(inList){html+='</ul>';inList=false;}html+=`<h3>${line.replace(/^###\s+/,'')}</h3>`;}else if(/^##\s+/.test(line)){if(inList){html+='</ul>';inList=false;}html+=`<h2>${line.replace(/^##\s+/,'')}</h2>`;}else if(/^#\s+/.test(line)){if(inList){html+='</ul>';inList=false;}html+=`<h1>${line.replace(/^#\s+/,'')}</h1>`;}else if(/^[-*]\s+/.test(line)){if(!inList){html+='<ul>';inList=true;}html+=`<li>${line.replace(/^[-*]\s+/,'')}</li>`;}else if(line.trim()===''){if(inList){html+='</ul>';inList=false;}}else{if(inList){html+='</ul>';inList=false;}html+=`<p>${line}</p>`;}}if(inList)html+='</ul>';return html;}

  function updateProgress(){if(!articleBox)return;const bar=articleBox.querySelector('.progress');const content=articleBox.querySelector('.content');if(!bar||!content)return;const top=articleBox.offsetTop;const total=content.scrollHeight-window.innerHeight;const sc=window.scrollY-top;const p=Math.min(1,Math.max(0,sc/total));bar.style.transform=`scaleX(${p})`;}

  function share(post){const url=location.origin+location.pathname+`#blog?post=${post.slug}`;const data={title:post.title,text:post.summary,url};(async()=>{try{if(navigator.share){await navigator.share(data);}else{await navigator.clipboard.writeText(url);window.toast?toast('Ссылка скопирована'):null;}}catch{window.toast?toast('Не удалось поделиться'):null;}})();}

  function keyHandler(e){if(e.key==='Escape'){if(location.protocol==='file:'){closeReader();}else{history.back();}}if(e.key==='['){const s=articleBox.querySelector('.prev')?.dataset.slug;if(s)openReader(s,null,true);}if(e.key===']'){const s=articleBox.querySelector('.next')?.dataset.slug;if(s)openReader(s,null,true);}if(e.key==='Tab'){const f=[...articleBox.querySelectorAll('a,button,input,textarea,select,summary')].filter(el=>!el.disabled&&el.offsetParent!==null);if(!f.length)return;const first=f[0];const last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}

  function getSlugFromHash(){const m=location.hash.match(/\?post=([^&]+)/);return m?decodeURIComponent(m[1]):null;}
  function initFromHash(){const slug=getSlugFromHash();if(slug){openReader(slug,null,false);if(location.protocol!=='file:'){try{history.replaceState({post:slug},'',`#blog?post=${slug}`);}catch{}}}window.addEventListener('popstate',popHandler);}
  function popHandler(){if(location.protocol==='file:')return;const slug=getSlugFromHash();if(slug){openReader(slug,null,false);}else{closeReader();}}

  function setMeta(name,content){let m=document.querySelector(`meta[name="${name}"]`);if(!m){m=document.createElement('meta');m.setAttribute('name',name);document.head.appendChild(m);}m.setAttribute('content',content||'');}
  function setMetaProperty(prop,content){let m=document.querySelector(`meta[property="${prop}"]`);if(!m){m=document.createElement('meta');m.setAttribute('property',prop);document.head.appendChild(m);}m.setAttribute('content',content||'');}

  function updateSEO(post){
    if(!seoBackup){seoBackup={title:document.title,desc:document.querySelector('meta[name="description"]')?.content||'',keywords:document.querySelector('meta[name="keywords"]')?.content||'',ogTitle:document.querySelector('meta[property="og:title"]')?.content||'',ogDesc:document.querySelector('meta[property="og:description"]')?.content||'',ogImage:document.querySelector('meta[property="og:image"]')?.content||'',twTitle:document.querySelector('meta[name="twitter:title"]')?.content||'',twDesc:document.querySelector('meta[name="twitter:description"]')?.content||'',twImage:document.querySelector('meta[name="twitter:image"]')?.content||''};}
    document.title=`${post.title} — Step3D`;
    setMeta('description',post.summary||'');
    setMeta('keywords',(post.tags||[]).join(', '));
    setMetaProperty('og:title',post.title||'');
    setMetaProperty('og:description',post.summary||'');
    setMetaProperty('og:image',post.cover||'');
    setMeta('twitter:title',post.title||'');
    setMeta('twitter:description',post.summary||'');
    setMeta('twitter:image',post.cover||'');
  }
  function restoreSEO(){if(!seoBackup)return;document.title=seoBackup.title;setMeta('description',seoBackup.desc);setMeta('keywords',seoBackup.keywords);setMetaProperty('og:title',seoBackup.ogTitle);setMetaProperty('og:description',seoBackup.ogDesc);setMetaProperty('og:image',seoBackup.ogImage);setMeta('twitter:title',seoBackup.twTitle);setMeta('twitter:description',seoBackup.twDesc);setMeta('twitter:image',seoBackup.twImage);}
})();
