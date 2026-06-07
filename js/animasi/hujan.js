const Hujan = (() => {
  let canvas, ctx, tetes = [], animId = null, intensitas = 150;

  function init(c, level = 'sedang') {
    canvas = c;
    ctx = canvas.getContext('2d');
    tetes = [];
    intensitas = level === 'lebat' ? 300 : level === 'ringan' ? 80 : 150;
    for (let i = 0; i < intensitas; i++) {
      tetes.push(buatTetes());
    }
  }

  function buatTetes(fromTop = false) {
    return {
      x: Math.random() * canvas.width,
      y: fromTop ? -10 : Math.random() * canvas.height,
      panjang: Math.random() * 15 + 10,
      kecepatan: Math.random() * 6 + 8,
      opacity: Math.random() * 0.4 + 0.2,
      sudut: 0.2,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(174, 214, 241, 0.6)';
    ctx.lineWidth = 1;

    tetes.forEach(t => {
      ctx.save();
      ctx.globalAlpha = t.opacity;
      ctx.beginPath();
      ctx.moveTo(t.x, t.y);
      ctx.lineTo(t.x + t.sudut * t.panjang, t.y + t.panjang);
      ctx.stroke();
      ctx.restore();

      t.x += t.sudut * t.kecepatan * 0.5;
      t.y += t.kecepatan;

      if (t.y > canvas.height + 20) {
        Object.assign(t, buatTetes(true));
      }
    });

    animId = requestAnimationFrame(draw);
  }

  function mulai(c, level) { init(c, level); if (animId) cancelAnimationFrame(animId); draw(); }
  function berhenti() { if (animId) { cancelAnimationFrame(animId); animId = null; } }

  return { mulai, berhenti };
})();