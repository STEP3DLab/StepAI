const fs=require('fs');
const {JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync('tests/index.html','utf8');
const vc=new VirtualConsole();vc.sendTo(console);
const dom=new JSDOM(html,{runScripts:'dangerously',resources:'usable',url:'http://localhost/StepAI/',virtualConsole:vc,pretendToBeVisual:true});
dom.window.addEventListener('load',()=>{console.log('DOM loaded');setTimeout(()=>{console.log('Tests done');},1000);});
