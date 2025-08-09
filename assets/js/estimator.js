(function(){
  const est=document.getElementById('estimator');
  if(!est) return;

  // Основные коэффициенты расчёта
  const COEFS={
    tech:{
      FDM:{rate_cm3_time:0.04, hourly:350, setup:150, min_order:400}, // FDM настройки
      SLA:{rate_cm3_time:0.06, hourly:700, setup:300, min_order:800}, // SLA настройки
      SLS:{rate_cm3_time:0.05, hourly:900, setup:500, min_order:1500} // SLS настройки
    },
    layer:{
      FDM:{"0.3":0.8,"0.2":1.0,"0.1":1.6},
      SLA:{"0.1":1.0,"0.05":1.7},
      SLS:{"0.15":1.0,"0.1":1.3}
    },
    material:{
      PLA:{density:1.24,cost_g:1.8,k:1.0,tech:["FDM"]},
      ABS:{density:1.04,cost_g:2.0,k:1.1,tech:["FDM"]},
      PETG:{density:1.27,cost_g:2.2,k:1.1,tech:["FDM"]},
      Resin:{density:1.10,cost_g:6.0,k:1.6,tech:["SLA"]},
      PA12:{density:1.01,cost_g:5.0,k:1.5,tech:["SLS"]},
      TPU:{density:1.21,cost_g:2.8,k:1.2,tech:["FDM"]}
    },
    support:{none:0,light:80,normal:150,heavy:300},
    post:{none:0,sand:0.15,paint:0.35},
    shell_k_approx:0.12
  };

  // режим ввода
  let mode='volume';
  const modeBtns=document.querySelectorAll('.mode');
  const modeBlocks={
    volume:document.getElementById('mode-volume'),
    dims:document.getElementById('mode-dims'),
    weight:document.getElementById('mode-weight')
  };
  modeBtns.forEach(btn=>btn.addEventListener('click',()=>{
    mode=btn.dataset.mode;
    modeBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    Object.values(modeBlocks).forEach(b=>b.hidden=true);
    modeBlocks[mode].hidden=false;
    calc();
  }));

  // технология
  let tech='FDM';
  const techBtns=document.querySelectorAll('.tech');
  techBtns.forEach(btn=>btn.addEventListener('click',()=>{
    tech=btn.dataset.tech;
    techBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    populateMaterials();
    populateLayers();
    calc();
  }));

  const materialEl=document.getElementById('material');
  const layerEl=document.getElementById('layer');

  function populateMaterials(){
    materialEl.innerHTML='';
    for(const name in COEFS.material){
      const m=COEFS.material[name];
      if(m.tech.includes(tech)){
        const o=document.createElement('option');
        o.value=name;o.textContent=name;materialEl.appendChild(o);
      }
    }
  }
  function populateLayers(){
    layerEl.innerHTML='';
    for(const l in COEFS.layer[tech]){
      const o=document.createElement('option');
      o.value=l;o.textContent=l;layerEl.appendChild(o);
    }
  }

  // элементы формы
  const volumeEl=document.getElementById('volume');
  const weightEl=document.getElementById('weight');
  const dimxEl=document.getElementById('dimx');
  const dimyEl=document.getElementById('dimy');
  const dimzEl=document.getElementById('dimz');
  const formEl=document.getElementById('form');
  const shellEl=document.getElementById('shell');
  const infillEl=document.getElementById('infill');
  const supportEl=document.getElementById('support');
  const postEl=document.getElementById('post');
  const qtyEl=document.getElementById('qty');
  const rushEl=document.getElementById('rush');
  const price1El=document.getElementById('price1');
  const pricetotalEl=document.getElementById('pricetotal');
  const timeEl=document.getElementById('time');
  const breakdownEl=document.getElementById('breakdown');

  function rf(n){return n.toLocaleString('ru-RU');}

  function getDensity(){
    const m=COEFS.material[materialEl.value];
    return m?m.density:1;
  }

  function calcVolume(){
    if(mode==='volume') return +volumeEl.value||0;
    if(mode==='weight') return (+weightEl.value||0)/getDensity();
    if(mode==='dims'){
      const x=+dimxEl.value||0,y=+dimyEl.value||0,z=+dimzEl.value||0;
      const box=x*y*z/1000; // мм^3 → см^3
      const wall=+shellEl.value||0;
      const shell=COEFS.shell_k_approx*Math.pow(box,2/3)*(wall/10);
      const effInfill=formEl.value==='solid'?100:(+infillEl.value||0);
      const inf=(effInfill/100)*(box-shell);
      return shell+inf;
    }
    return 0;
  }

  function calc(){
    const density=getDensity();
    const volume=calcVolume();
    const weight=volume*density;

    if(mode!=='volume') volumeEl.value=volume.toFixed(2);
    if(mode!=='weight') weightEl.value=weight.toFixed(1);

    const mat=COEFS.material[materialEl.value];
    const techCfg=COEFS.tech[tech];
    const layerK=COEFS.layer[tech][layerEl.value];
    const time_h=volume*techCfg.rate_cm3_time*layerK;
    const material_cost=weight*mat.cost_g*mat.k;
    const machine_cost=time_h*techCfg.hourly;
    const support_cost=COEFS.support[supportEl.value];
    const post_cost=(material_cost+machine_cost)*COEFS.post[postEl.value];
    const setup_cost=techCfg.setup;
    const subtotal=material_cost+machine_cost+support_cost+post_cost+setup_cost;
    const qty=+qtyEl.value||1;
    const total_pre=Math.ceil(subtotal*qty*(rushEl.checked?1.3:1)/10)*10;
    const minTotal=techCfg.min_order*qty;
    const total=Math.max(total_pre,minTotal);
    const price1=total/qty;

    const baseDays=Math.max(1,Math.ceil(time_h/8));
    const standardDays=baseDays+1;
    const rushDays=Math.max(1,Math.ceil(baseDays/2));

    price1El.textContent=`≈ ${rf(Math.round(price1))} ₽`;
    pricetotalEl.textContent=`≈ ${rf(Math.round(total))} ₽`;
    timeEl.textContent=`${standardDays} дн / срочно: ${rushDays} дн`;

    breakdownEl.innerHTML=`\n<li>Материал: ${rf(Math.round(material_cost))} ₽</li>\n<li>Время станка: ${rf(Math.round(machine_cost))} ₽</li>\n<li>Поддержки: ${rf(Math.round(support_cost))} ₽</li>\n<li>Постобработка: ${rf(Math.round(post_cost))} ₽</li>\n<li>Настройка/старт: ${rf(Math.round(setup_cost))} ₽</li>\n`;
  }

  [volumeEl,weightEl,dimxEl,dimyEl,dimzEl,formEl,shellEl,infillEl,supportEl,postEl,qtyEl].forEach(el=>el.addEventListener('input',calc));
  layerEl.addEventListener('change',calc);
  materialEl.addEventListener('change',calc);
  rushEl.addEventListener('change',calc);
  document.getElementById('print').addEventListener('click',()=>window.print());

  populateMaterials();
  populateLayers();
  calc();
})();

