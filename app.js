(()=>{
  const q=s=>document.querySelector(s);
  document.addEventListener('click',e=>{
    const el=e.target.closest('[data-href]');
    if(el) location.href=el.dataset.href;
  });

  // Tự động phát nhạc nền và đồng bộ nút âm thanh cho các trang con (rules, missions, gifts)
  function initSubpageAudio(){
    if(document.body.classList.contains('home-page')) return;
    const soundBtn = q('#soundBtn');
    const soundIcon = q('#soundIcon');
    const bgmEl = q('#bgmAudio') || new Audio('assets/nhacnen.mp3');
    bgmEl.loop = true;
    bgmEl.volume = 0.45;

    let bgmMuted = localStorage.getItem('vbb_bgm_muted') === 'true';
    if(soundIcon){
      soundIcon.src = bgmMuted ? 'assets/ic-speak-mute.svg' : 'assets/ic-speak.svg';
      soundIcon.alt = bgmMuted ? 'Bật nhạc nền' : 'Tắt nhạc nền';
    }

    function playBgm(){
      if(bgmMuted) return;
      const p = bgmEl.play();
      if(p && p.catch){
        p.catch(()=>{
          const unlock = ()=>{
            if(!bgmMuted) bgmEl.play().catch(()=>{});
            ['click', 'touchstart', 'pointerdown', 'mousedown', 'keydown'].forEach(evt => {
              window.removeEventListener(evt, unlock, true);
            });
          };
          ['click', 'touchstart', 'pointerdown', 'mousedown', 'keydown'].forEach(evt => {
            window.addEventListener(evt, unlock, { once: true, capture: true });
          });
        });
      }
    }

    playBgm();

    if(soundBtn){
      soundBtn.addEventListener('click', (e)=>{
        e.stopPropagation();
        bgmMuted = !bgmMuted;
        localStorage.setItem('vbb_bgm_muted', bgmMuted ? 'true' : 'false');
        if(soundIcon){
          soundIcon.src = bgmMuted ? 'assets/ic-speak-mute.svg' : 'assets/ic-speak.svg';
          soundIcon.alt = bgmMuted ? 'Bật nhạc nền' : 'Tắt nhạc nền';
        }
        if(bgmMuted){
          bgmEl.pause();
        } else {
          bgmEl.play().catch(()=>{});
        }
      });
    }

    const backBtn = q('#backBtn');
    if(backBtn && !backBtn.dataset.href){
      backBtn.addEventListener('click', ()=>{
        if(history.length > 1){
          history.back();
        } else {
          location.href = 'home.html';
        }
      });
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initSubpageAudio);
  } else {
    initSubpageAudio();
  }

  const ITEMS = [
    { id: '20k', name: 'E-voucher 20.000 VNĐ', img: 'assets/item-20k.png', type: 'win' },
    { id: 'la', name: 'Lá may mắn', subName: 'Chúc bạn may mắn lần sau', img: 'assets/item-la.png', type: 'lucky' },
    { id: '50k', name: 'E-voucher 50.000 VNĐ', img: 'assets/item-50k.png', type: 'win' },
    { id: '100k', name: 'E-voucher 100.000 VNĐ', img: 'assets/item-100k.png', type: 'win' },
    { id: '200k', name: 'E-voucher 200.000 VNĐ', img: 'assets/item-200k.png', type: 'win' },
    { id: 'ngoisao', name: 'Ngôi sao may mắn', subName: 'Chúc bạn may mắn lần sau', img: 'assets/item-ngoisao.png', type: 'lucky' },
  ];

  window.VBB={
    loading(){
      setTimeout(()=>location.href='home.html',2500);
    },
    home(){
      const wheel=q('#wheel');
      const wheelItems=q('#wheelItems');
      const pointer=q('#wheelPointer');
      const spinBtn=q('#spinBtn');
      const turns=q('#turns');
      const back=q('#backBtn');
      const modal=q('#resultModal');
      const resultBg=q('#resultBg');
      const closeBtn=q('#resultClose');

      // Modal sub-variants
      const modalWin=q('#modalWin');
      const resultVoucherVal=q('#resultVoucherVal');
      const resultVoucherImg=q('#resultVoucherImg');

      const modalLucky=q('#modalLucky');
      const resultLuckyImg=q('#resultLuckyImg');
      const resultLuckyText=q('#resultLuckyText');

      const modalOut=q('#modalOut');
      const reloadTurnsBtn=q('#reloadTurnsBtn');

      const soundBtn=q('#soundBtn');
      const soundIcon=q('#soundIcon');

      // Khởi tạo hệ thống âm thanh cho các ngữ cảnh
      const bgmEl = q('#bgmAudio');
      const sounds = {
        bgm: bgmEl || new Audio('assets/nhacnen.mp3'),
        spin: new Audio('assets/banhxequay.mp3'),
        win: new Audio('assets/chienthang.mp3'),
        lucky: new Audio('assets/mayman.mp3'),
        out: new Audio('assets/hetluot.mp3')
      };

      sounds.bgm.loop = true;
      sounds.bgm.volume = 0.45;
      sounds.spin.volume = 0.85;
      sounds.win.volume = 0.95;
      sounds.lucky.volume = 0.9;
      sounds.out.volume = 0.9;

      // Nút loa chỉ tắt/bật riêng NHẠC NỀN (BGM), không tắt hiệu ứng âm thanh (SFX)
      let bgmMuted = localStorage.getItem('vbb_bgm_muted') === 'true';

      function updateSoundIcon(){
        if(soundIcon){
          soundIcon.src = bgmMuted ? 'assets/ic-speak-mute.svg' : 'assets/ic-speak.svg';
          soundIcon.alt = bgmMuted ? 'Bật nhạc nền' : 'Tắt nhạc nền';
        }
      }
      updateSoundIcon();

      // Phát hiệu ứng âm thanh (luôn phát bình thường kể cả khi tắt nhạc nền)
      function playSound(audio, startTime = 0){
        if(!audio) return;
        try {
          audio.currentTime = startTime;
          const p = audio.play();
          if(p && p.catch) p.catch(()=>{});
        } catch(e){}
      }

      function stopSound(audio){
        if(!audio) return;
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch(e){}
      }

      function startBgm(){
        if(bgmMuted) return;
        const p = sounds.bgm.play();
        if(p && p.catch){
          p.catch(()=>{
            // Trình duyệt chặn autoplay khi người dùng chưa tương tác:
            // Tự động phát ngay lập tức khi người dùng vừa chạm/click bất kỳ điểm nào trên màn hình
            const unlock = ()=>{
              if(!bgmMuted) sounds.bgm.play().catch(()=>{});
              ['click', 'touchstart', 'pointerdown', 'mousedown', 'keydown'].forEach(evt => {
                window.removeEventListener(evt, unlock, true);
              });
            };
            ['click', 'touchstart', 'pointerdown', 'mousedown', 'keydown'].forEach(evt => {
              window.addEventListener(evt, unlock, { once: true, capture: true });
            });
          });
        }
      }

      // Tự động kích hoạt nhạc nền ngay khi vừa vào trang
      startBgm();

      // Nút loa: chỉ bật/tắt nhạc nền
      if(soundBtn){
        soundBtn.addEventListener('click', (e)=>{
          e.stopPropagation();
          bgmMuted = !bgmMuted;
          localStorage.setItem('vbb_bgm_muted', bgmMuted ? 'true' : 'false');
          updateSoundIcon();
          if(bgmMuted){
            sounds.bgm.pause();
          } else {
            sounds.bgm.play().catch(()=>{});
          }
        });
      }

      let currentItems = [...ITEMS];
      let spinning = false;
      let rotation = 0;
      let count = 10; // Luôn khởi tạo 10 lượt mới mỗi lần mở hoặc F5 lại trang

      if(turns) turns.textContent = count;

      if(turns){
        turns.style.cursor = 'pointer';
        turns.title = 'Bấm để nạp lại 10 lượt quay';
        turns.addEventListener('click', (e)=>{
          if(count <= 0){
            e.stopPropagation();
            count = 10;
            turns.textContent = count;
          }
        });
      }

      function renderWheelItems(items, animate = false){
        if(!wheelItems) return;
        wheelItems.innerHTML = '';
        items.forEach((item, idx)=>{
          const itemEl = document.createElement('div');
          itemEl.className = 'wheel-item' + (animate ? ' spawning' : '');
          const img = document.createElement('img');
          img.src = item.img;
          img.alt = item.name;
          itemEl.appendChild(img);
          wheelItems.appendChild(itemEl);
        });

        if(animate){
          setTimeout(()=>{
            wheelItems.querySelectorAll('.wheel-item').forEach(el=>el.classList.remove('spawning'));
          }, 800);
        }
      }

      function shuffleItems(animate = true){
        // Xáo trộn ngẫu nhiên thứ tự 6 item cho 6 ô vòng quay
        const arr = [...ITEMS];
        for(let i = arr.length - 1; i > 0; i--){
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        currentItems = arr;
        renderWheelItems(currentItems, animate);
      }

      // Khởi tạo hiển thị ban đầu
      renderWheelItems(currentItems, false);

      function showResult(item, type){
        // Bánh xe đã dừng -> Dừng tiếng bánh xe quay
        stopSound(sounds.spin);

        if(modalWin) modalWin.classList.remove('active');
        if(modalLucky) modalLucky.classList.remove('active');
        if(modalOut) modalOut.classList.remove('active');

        if(type === 'out' || !item){
          // Modal 4: Hết lượt quay (Dùng bg-rattiec.png có sẵn chữ RẤT TIẾC)
          if(resultBg) resultBg.src = 'assets/bg-rattiec.png';
          if(modalOut) modalOut.classList.add('active');
          playSound(sounds.out); // Âm thanh tiếc nuối khi hết lượt
        } else if(item.type === 'win'){
          // Modal 1: Trúng Voucher (Dùng bg-qua.png có sẵn chữ CHÚC MỪNG)
          if(resultBg) resultBg.src = 'assets/bg-qua.png';
          if(resultVoucherVal) resultVoucherVal.textContent = item.name;
          if(resultVoucherImg){
            resultVoucherImg.src = item.img;
            resultVoucherImg.alt = item.name;
          }
          if(modalWin) modalWin.classList.add('active');
          playSound(sounds.win); // Âm thanh chiến thắng chúc mừng nhận quà
        } else if(item.type === 'lucky'){
          // Modal 2 & 3: Lá may mắn & Ngôi sao (Dùng bg-thongbao.png trơn sáng bóng)
          if(resultBg) resultBg.src = 'assets/bg-thongbao.png';
          if(resultLuckyImg){
            resultLuckyImg.src = item.img;
            resultLuckyImg.alt = item.name;
          }
          if(resultLuckyText){
            resultLuckyText.textContent = item.subName || 'Chúc bạn may mắn lần sau';
          }
          if(modalLucky) modalLucky.classList.add('active');
          // Xử lý bỏ qua 1.5s khoảng lặng đầu file mayman.mp3 để âm thanh may mắn phát ngay tức thì
          const LUCKY_SOUND_OFFSET = 1.5;
          playSound(sounds.lucky, LUCKY_SOUND_OFFSET);
        }

        if(modal){
          modal.classList.add('show');
          modal.setAttribute('aria-hidden','false');
        }
        if(closeBtn && typeof closeBtn.focus === 'function'){
          try { closeBtn.focus(); } catch(e){}
        }
      }

      function hideResult(){
        spinning = false;
        // Dừng âm thanh kết quả để không đè lên lượt quay kế tiếp
        ['win', 'lucky', 'out'].forEach(k => stopSound(sounds[k]));

        if(modal){
          modal.classList.remove('show');
          modal.setAttribute('aria-hidden','true');
        }
        if(spinBtn) spinBtn.focus();

        // Sau mỗi lần quay xong đóng popup: Tự động random gọi item mới ra vòng quay!
        setTimeout(()=>{
          shuffleItems(true);
        }, 150);
      }

      function spin(){
        if(spinning) return;
        if(modal && modal.classList.contains('show')) return;
        if(count <= 0){
          showResult(null, 'out');
          return;
        }

        // Xử lý loại bỏ đoạn trễ đầu file banhxequay.mp3:
        // Tua qua 1.2s khoảng lặng đầu file để âm thanh bánh xe quay phát ra ngay tức thì khi bấm
        const SPIN_SOUND_OFFSET = 1.2; // Độ trễ bỏ qua (giây)
        const SPIN_DURATION_SEC = +(18.2 - SPIN_SOUND_OFFSET).toFixed(1); // ~17 giây khớp chuẩn tới nốt cuối
        const SPIN_ROUNDS = 22;       // 22 vòng quay tốc độ cao rồi giảm tốc mượt mà

        // Bắt đầu quay: Dừng âm thanh cũ, phát tiếng bánh xe quay tức thì
        ['win', 'lucky', 'out'].forEach(k => stopSound(sounds[k]));
        playSound(sounds.spin, SPIN_SOUND_OFFSET);

        spinning = true;
        count--;
        if(turns) turns.textContent = count;

        // Chọn ngẫu nhiên segment trúng thưởng (0..5)
        const targetIndex = Math.floor(Math.random() * 6);
        const wonItem = currentItems[targetIndex];

        // Tính góc quay chính xác để pointer (ở đỉnh 12h, 0deg) chỉ đúng segment targetIndex
        const currentAngle = rotation % 360;
        const targetDeg = (360 - (targetIndex * 60)) % 360;
        const needed = (targetDeg - currentAngle + 360) % 360;
        rotation += 360 * SPIN_ROUNDS + needed;

        if(pointer) pointer.classList.add('ticking');
        if(wheel){
          wheel.style.transition = `transform ${SPIN_DURATION_SEC}s cubic-bezier(.12, .85, .15, 1)`;
          wheel.style.transform = `rotate(${rotation}deg)`;
        }

        setTimeout(()=>{
          if(pointer) pointer.classList.remove('ticking');
        }, (SPIN_DURATION_SEC - 0.6) * 1000);

        setTimeout(()=>{
          spinning = false;
          showResult(wonItem, wonItem ? wonItem.type : 'win');
        }, SPIN_DURATION_SEC * 1000);
      }

      if(spinBtn){
        spinBtn.addEventListener('click', spin);
        spinBtn.addEventListener('keydown', e=>{
          if(e.key==='Enter'||e.key===' '){ e.preventDefault(); spin(); }
        });
      }

      if(closeBtn) closeBtn.addEventListener('click', hideResult);

      if(modal){
        modal.addEventListener('click', e=>{
          if(e.target===modal || e.target.classList.contains('result-backdrop')) hideResult();
        });
      }

      document.addEventListener('keydown', e=>{
        if(e.key==='Escape' && modal && modal.classList.contains('show')) hideResult();
      });

      if(back) back.addEventListener('click', ()=>history.length>1?history.back():location.assign('index.html'));

      if(reloadTurnsBtn){
        reloadTurnsBtn.addEventListener('click', ()=>{
          count = 10;
          if(turns) turns.textContent = count;
          hideResult();
        });
      }

      window.VBB.shuffleItems = shuffleItems;
      window.VBB.showResult = showResult;
      window.VBB.sounds = sounds;
      window.VBB.getBgmMuted = () => bgmMuted;
      window.VBB.testModal = (variant) => {
        if(variant === 'win') showResult(ITEMS[0], 'win');
        else if(variant === 'leaf') showResult(ITEMS[1], 'lucky');
        else if(variant === 'star') showResult(ITEMS[5], 'lucky');
        else if(variant === 'out') showResult(null, 'out');
      };

      window.VBB.resetTurns = (val = 10) => {
        count = val;
        if(turns) turns.textContent = count;
      };
    }
  };
})();
