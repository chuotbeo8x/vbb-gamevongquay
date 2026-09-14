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
      let spinning=false;
      let rotation=0;
      let count=Number(sessionStorage.getItem('vbbTurns')||99);
      turns.textContent=count;

      const resultForIndex=index=>{
        if(index===1) return 'result-lucky-1.html';
        if(index===5) return 'result-lucky-2.html';
        return 'result-win.html';
      };

      function spin(){
        if(spinning) return;
        if(count<=0){ location.href='out-of-spins.html'; return; }
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
          location.href=resultForIndex(index);
        },4700);
      }

      spinBtn.addEventListener('click',spin);
      spinBtn.addEventListener('keydown',e=>{
        if(e.key==='Enter'||e.key===' '){ e.preventDefault(); spin(); }
      });
      if(back) back.addEventListener('click',()=>history.length>1?history.back():location.assign('index.html'));
    }
  };
})();
