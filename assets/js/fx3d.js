(function(){
  const cv=document.getElementById('fx3d'); if(!cv) return; const ctx=cv.getContext('2d');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches; let running=false,t=0,mx=0,my=0;
  function resize(){cv.width=window.innerWidth;cv.height=Math.max(360,window.innerHeight*0.6);} window.addEventListener('resize',resize,{passive:true});resize();
  window.addEventListener('mousemove',e=>{const r=cv.getBoundingClientRect();mx=(e.clientX-r.left)/r.width-0.5;my=(e.clientY-r.top)/r.height-0.5;},{passive:true});
  function proj(x,y,z,s){const f=3;const k=s/(z+f);return [x*k,y*k];}
  function draw(dt){t+=dt;const w=cv.width,h=cv.height,s=Math.min(w,h)/2.3;ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(w/2,h/2);ctx.globalAlpha=.6;ctx.lineWidth=1;ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue('--fg')||'#000';const R=1.15,r=.42,U=36,V=18;const rx=t*.6+my*1.2,ry=t*.4+mx*1.2,rz=t*.2;for(let i=0;i<=U;i++){ctx.beginPath();for(let j=0;j<=V;j++){const u=i/U*Math.PI*2,v=j/V*Math.PI*2;let x=(R+r*Math.cos(v))*Math.cos(u);let y=(R+r*Math.cos(v))*Math.sin(u);let z=r*Math.sin(v);let X=x,Y=y*Math.cos(rx)-z*Math.sin(rx),Z=y*Math.sin(rx)+z*Math.cos(rx);let X2=X*Math.cos(ry)+Z*Math.sin(ry),Y2=Y,Z2=-X*Math.sin(ry)+Z*Math.cos(ry);let X3=X2*Math.cos(rz)-Y2*Math.sin(rz),Y3=X2*Math.sin(rz)+Y2*Math.cos(rz),Z3=Z2;const p=proj(X3,Y3,Z3,s);if(j===0)ctx.moveTo(p[0],p[1]);else ctx.lineTo(p[0],p[1]);}ctx.stroke();}for(let j=0;j<=V;j++){ctx.beginPath();for(let i=0;i<=U;i++){const u=i/U*Math.PI*2,v=j/V*Math.PI*2;let x=(R+r*Math.cos(v))*Math.cos(u);let y=(R+r*Math.cos(v))*Math.sin(u);let z=r*Math.sin(v);let X=x,Y=y*Math.cos(rx)-z*Math.sin(rx),Z=y*Math.sin(rx)+z*Math.cos(rx);let X2=X*Math.cos(ry)+Z*Math.sin(ry),Y2=Y,Z2=-X*Math.sin(ry)+Z*Math.cos(ry);let X3=X2*Math.cos(rz)-Y2*Math.sin(rz),Y3=X2*Math.sin(rz)+Y2*Math.cos(rz),Z3=Z2;const p=proj(X3,Y3,Z3,s);if(i===0)ctx.moveTo(p[0],p[1]);else ctx.lineTo(p[0],p[1]);}ctx.stroke();}ctx.restore();}
  function frame(){if(!running||reduce||document.hidden)return;draw(0.012);requestAnimationFrame(frame);} 
  const io=new IntersectionObserver((ents)=>{ents.forEach(ent=>{running=ent.isIntersecting; if(running&&!document.hidden){requestAnimationFrame(frame);}});});
  io.observe(cv);
  document.addEventListener('visibilitychange',()=>{if(running&&!document.hidden)requestAnimationFrame(frame);});
})();
