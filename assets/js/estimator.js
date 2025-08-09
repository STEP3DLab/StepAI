(function(){
  const rateTech={FDM:8,SLA:68,SLS:105};
  const kMaterial={PLA:1,ABS:1.1,PETG:1.2,Resin:1.3};
  const kLayer={'0.1':1.2,'0.2':1,'0.3':0.8};
  let tech='FDM',material='PLA',layer='0.2',vol=50,infill=20,rush=false;
  const priceEl=document.getElementById('price');
  function rf(n){return n.toLocaleString('ru-RU');}
  function calc(){const price=vol*rateTech[tech]*kMaterial[material]*kLayer[layer]*(1+infill/100)*(rush?1.3:1);priceEl.textContent=`≈ ${rf(Math.round(price))} ₽`;logger?.log('calc_change',{tech,material,layer,vol,infill,rush});}
  document.querySelectorAll('[data-tech]').forEach(btn=>btn.addEventListener('click',()=>{tech=btn.dataset.tech;document.querySelectorAll('[data-tech]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');calc();}));
  document.getElementById('material').addEventListener('change',e=>{material=e.target.value;calc();});
  document.getElementById('layer').addEventListener('change',e=>{layer=e.target.value;calc();});
  document.getElementById('vol').addEventListener('input',e=>{vol=+e.target.value;document.getElementById('volv').textContent=vol;calc();});
  document.getElementById('infill').addEventListener('input',e=>{infill=+e.target.value;document.getElementById('infillv').textContent=infill;calc();});
  document.getElementById('rush').addEventListener('change',e=>{rush=e.target.checked;calc();});
  calc();
})();
