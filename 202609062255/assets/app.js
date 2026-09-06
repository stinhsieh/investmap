/* 投資地圖 DongBook · 共用互動：進度條 / 回頂部 / scroll-spy / 手機卡片表 / 行動清單記進度 / 複製提示詞 */
(function(){
  "use strict";

  /* 進度條（動態插入，頁面不用放 markup）*/
  var bar=document.createElement('div'); bar.className='progressbar'; document.body.appendChild(bar);

  /* 回頂部按鈕 */
  var top=document.createElement('button'); top.className='totop'; top.type='button';
  top.setAttribute('aria-label','回到頂端'); top.textContent='↑'; document.body.appendChild(top);
  top.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});

  function onScroll(){
    var h=document.documentElement;
    var sc=h.scrollTop||document.body.scrollTop||0;
    var max=(h.scrollHeight-h.clientHeight)||1;
    bar.style.width=(sc/max*100)+'%';
    top.classList.toggle('show', sc>500);
  }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  /* scroll-spy：捲到哪一章，第二層導覽自動高亮 */
  var r2=[].slice.call(document.querySelectorAll('.topnav .row.r2 a[href^="#"]'));
  var map={}; r2.forEach(function(a){ map[a.getAttribute('href').slice(1)]=a; });
  var secs=[]; Object.keys(map).forEach(function(id){var s=document.getElementById(id); if(s)secs.push(s);});
  if(window.IntersectionObserver && secs.length){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting) return;
        var a=map[e.target.id]; if(!a) return;
        r2.forEach(function(x){x.classList.remove('here');});
        a.classList.add('here');
        /* 只橫向捲動導覽列本身，不影響頁面捲動 */
        var row=a.parentElement;
        row.scrollLeft = a.offsetLeft - row.clientWidth/2 + a.clientWidth/2;
      });
    },{rootMargin:'-45% 0px -50% 0px',threshold:0});
    secs.forEach(function(s){io.observe(s);});
  }

  /* 手機卡片式表格：自動把表頭文字補成每格的 data-label（不必手動標）*/
  [].slice.call(document.querySelectorAll('table')).forEach(function(t){
    var rows=t.rows; if(!rows || !rows.length) return;
    var headRow=rows[0], heads=[];
    for(var i=0;i<headRow.cells.length;i++) heads.push(headRow.cells[i].textContent.trim());
    var isHeader=!!headRow.querySelector('th');
    if(isHeader) headRow.classList.add('thr');
    for(var r=(isHeader?1:0); r<rows.length; r++){
      var cells=rows[r].cells;
      for(var c=0;c<cells.length;c++){ if(heads[c]) cells[c].setAttribute('data-label',heads[c]); }
    }
    t.classList.add('cardify');
  });

  /* 行動清單進度＋記住（key 前綴由 <body data-todo-prefix> 提供，全帳號唯一）*/
  var PREFIX=document.body.getAttribute('data-todo-prefix')||'';
  var boxes=[].slice.call(document.querySelectorAll('.todo input'));
  var prog=document.getElementById('prog');
  function upd(){var d=0;boxes.forEach(function(b){if(b.checked)d++});if(prog)prog.textContent=d+' / '+boxes.length;}
  boxes.forEach(function(b){
    try{ if(PREFIX && localStorage.getItem(PREFIX+b.dataset.k)==='1') b.checked=true; }catch(e){}
    b.addEventListener('change',function(){
      try{ if(PREFIX) localStorage.setItem(PREFIX+b.dataset.k, b.checked?'1':'0'); }catch(e){}
      upd();
    });
  });
  upd();

  /* 複製提示詞按鈕（AI 顧問頁）*/
  function fallbackCopy(text,done){
    try{var ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';
      document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);done();}catch(e){}
  }
  [].slice.call(document.querySelectorAll('.copy')).forEach(function(btn){
    btn.addEventListener('click',function(){
      var pre=btn.parentElement.querySelector('pre'); if(!pre) return;
      var text=pre.innerText;
      function done(){var o='複製提示詞';btn.textContent='✓ 已複製';btn.classList.add('done');
        setTimeout(function(){btn.textContent=o;btn.classList.remove('done');},1600);}
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(done,function(){fallbackCopy(text,done);});
      } else { fallbackCopy(text,done); }
    });
  });
})();
