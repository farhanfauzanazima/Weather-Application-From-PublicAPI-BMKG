const Matahari = (() => {
  let canvas, ctx, animId = null, sudut = 0;

  function init(c) {
    canvas = c;
    ctx = canvas.getContext('2d');
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sudut += 0.004;

    const cx = canvas.width * 0.75;
    const cy = canvas.height * 0.18;
    const r  = 55;
    const jumlahSinar = 14;

    // Cahaya luar (glow)
    const glow = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 3.5);
    glow.addColorStop(0, 'rgba(255, 220, 80, 0.18)');
    glow.addColorStop(1, 'rgba(255, 200, 50, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Sinar berputar
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(sudut);
    for (let i = 0; i < jumlahSinar; i++) {
      const angSinar = (i / jumlahSinar) * Math.PI * 2;
      const panjang  = r * (i % 2 === 0 ? 1.8 : 1.4);
      ctx.save();
      ctx.rotate(angSinar);
      ctx.strokeStyle = 'rgba(255, 220, 60, 0.35)';
      ctx.lineWidth = i % 2 === 0 ? 2.5 : 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(r * 1.05, 0);
      ctx.lineTo(panjang, 0);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // Bulatan matahari
    const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r);
    grad.addColorStop(0, 'rgba(255, 245, 150, 0.95)');
    grad.addColorStop(0.5, 'rgba(255, 200, 50, 0.85)');
    grad.addColorStop(1, 'rgba(255, 150, 20, 0.5)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    animId = requestAnimationFrame(draw);
  }

  function mulai(c) { init(c); if (animId) cancelAnimationFrame(animId); draw(); }
  function berhenti() { if (animId) { cancelAnimationFrame(animId); animId = null; } }

  return { mulai, berhenti };
})();