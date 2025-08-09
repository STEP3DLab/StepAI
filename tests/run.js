const fs=require('fs');
const {JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync('tests/index.html','utf8');
const vc=new VirtualConsole();vc.sendTo(console);
const dom=new JSDOM(html,{runScripts:'dangerously',resources:'usable',url:'file://'+__dirname+'/',virtualConsole:vc,pretendToBeVisual:true});
const path=require('path');
dom.window.fetch=(url)=>{
  try{
    if(/^https?:/i.test(url)) return fetch(url);
    const p=path.join(__dirname,url);
    const buf=fs.readFileSync(p);
    return Promise.resolve(new Response(buf));
  }catch(e){return Promise.reject(e);}
};
dom.window.IntersectionObserver=class{constructor(){ }observe(){}unobserve(){}disconnect(){}};
dom.window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
dom.window.HTMLCanvasElement.prototype.getContext=()=>({});
const ls={};
Object.defineProperty(dom.window,'localStorage',{value:{getItem:k=>ls[k]||null,setItem:(k,v)=>{ls[k]=String(v);},removeItem:k=>{delete ls[k];},clear:()=>{for(const k in ls)delete ls[k];}}});
dom.window.addEventListener('load',()=>{console.log('DOM loaded');setTimeout(()=>{console.log('Tests done');},1000);});
