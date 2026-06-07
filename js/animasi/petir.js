const Petir = (() => {
  let canvas, ctx, animId = null, nextKilat = 0;

  function init(c) {
    canvas = c;
    ctx = canvas.getContext('2d');
    jadwalKilat();
  }

  function jadwalKilat() {
    nextKilat = Date.now() + Math.random() * 4000 + 2000;
  }

  function gambarKilat(x, y) {
    ctx.save();
    ctx.strokeStyle = 'rgba(200, 180, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#c8b4ff';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(x, y);
    let cx = x, cy = y;
    while (cy < canvas.height * 0.7) {
      cx += (Math.random() - 0.5) * 60;
      cy += Math.random() * 40 + 20;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // Flash layar sesaat
    ctx.fillStyle = 'rgba(200, 180, 255, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (Date.now() > nextKilat) {
      const x = Math.random() * canvas.width;
      gambarKilat(x, 0);
      setTimeout(() => {
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }, 120);
      jadwalKilat();
    }
    animId = requestAnimationFrame(draw);
  }

  function mulai(c) { init(c); if (animId) cancelAnimationFrame(animId); draw(); }
  function berhenti() { if (animId) { cancelAnimationFrame(animId); animId = null; } }

  return { mulai, berhenti };
})();