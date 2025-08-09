(function(){
  const KEY='step3d-logs';
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[]}}
  function save(arr){localStorage.setItem(KEY,JSON.stringify(arr));}
  function log(ev,data={}){const arr=load();arr.push({t:Date.now(),ev,data});if(arr.length>200)arr.shift();save(arr);}
  function exportLogs(){const blob=new Blob([localStorage.getItem(KEY)||'[]'],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='logs.json';a.click();}
  function clearLogs(){localStorage.removeItem(KEY);}
  window.logger={log,exportLogs,clearLogs};
  log('page_view',{url:location.pathname+location.hash});
})();
