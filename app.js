(()=>{
  const q=s=>document.querySelector(s);
  document.addEventListener('click',e=>{
    const el=e.target.closest('[data-href]');
    if(el) location.href=el.dataset.href;
  });

  window.VBB={
    loading(){
      setTimeout(()=>location.href='home.html',2500);
    },
    home(){
      const wheel=q('#wheel');
      const pointer=q('#wheelPointer');
      const spinBtn=q('#spinBtn');
      const turns=q('#turns');
      const back=q('#backBtn');
      const modal=q('#resultModal');
      const resultBg=q('#resultBg');
      const closeBtn=q('#resultClose');
      let spinning=false;
      let rotation=0;
      let count=Number(sessionStorage.getItem('vbbTurns')||99);
      turns.textContent=count;

      const resultForIndex=index=>{
        if(index===1||index===5) return 'lucky';
        return 'win';
      };

      function showResult(type){
        const src=type==='win'
          ? 'assets/bg-qua.png'
          : type==='lucky'
            ? 'assets/bg-rattiec.png'
            : 'assets/bg-thongbao.png';
        resultBg.src=src;
        modal.classList.add('show');
        modal.setAttribute('aria-hidden','false');
        closeBtn.focus();
      }

      function hideResult(){
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden','true');
        spinBtn.focus();
      }

      function spin(){
        if(spinning||modal.classList.contains('show')) return;
        if(count<=0){ showResult('out'); return; }
        spinning=true;
        count--;
        sessionStorage.setItem('vbbTurns',String(count));
        turns.textContent=count;

        const index=Math.floor(Math.random()*8);
        const segment=360/8;
        const target=360-(index*segment+segment/2);
        rotation+=360*6+target;

        pointer.classList.add('ticking');
        wheel.style.transform=`rotate(${rotation}deg)`;

        setTimeout(()=>pointer.classList.remove('ticking'),4300);
        setTimeout(()=>{
          spinning=false;
          showResult(resultForIndex(index));
        },4700);
      }

      spinBtn.addEventListener('click',spin);
      spinBtn.addEventListener('keydown',e=>{
        if(e.key==='Enter'||e.key===' '){ e.preventDefault(); spin(); }
      });
      closeBtn.addEventListener('click',hideResult);
      modal.addEventListener('click',e=>{
        if(e.target===modal||e.target.classList.contains('result-backdrop')) hideResult();
      });
      document.addEventListener('keydown',e=>{
        if(e.key==='Escape'&&modal.classList.contains('show')) hideResult();
      });
      if(back) back.addEventListener('click',()=>history.length>1?history.back():location.assign('index.html'));
    }
  };
})();
