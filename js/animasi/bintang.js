const Bintang = (() => {
  let canvas, ctx, stars = [], animId = null;

  function init(c) {
    canvas = c;
    ctx = canvas.getContext('2d');
    stars = [];
    const jumlah = Math.floor((canvas.width * canvas.height) / 4000);
    for (let i = 0; i < jumlah; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.75,
        r: Math.random() * 1.5 + 0.3,
        alpha: Math.random(),
        delta: (Math.random() * 0.008 + 0.002) * (Math.random() < 0.5 ? 1 : -1),
        warna: Math.random() < 0.1 ? '#ffd0a0' : '#ffffff',
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.alpha += s.delta;
      if (s.alpha > 1) { s.alpha = 1; s.delta *= -1; }
      if (s.alpha < 0.1) { s.alpha = 0.1; s.delta *= -1; }

      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = s.warna;
      ctx.shadowColor = s.warna;
      ctx.shadowBlur = s.r * 3;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    animId = requestAnimationFrame(draw);
  }

  function mulai(c) { init(c); if (animId) cancelAnimationFrame(animId); draw(); }
  function berhenti() { if (animId) { cancelAnimationFrame(animId); animId = null; } }

  return { mulai, berhenti };
})();