const Awan = (() => {
  let canvas, ctx, awanList = [], animId = null;

  function init(c, jumlah = 5, warna = 'rgba(255,255,255,0.15)') {
    canvas = c;
    ctx = canvas.getContext('2d');
    awanList = [];
    for (let i = 0; i < jumlah; i++) {
      awanList.push(buatAwan(warna, true));
    }
  }

  function buatAwan(warna, acak = false) {
    const lebar = Math.random() * 200 + 120;
    return {
      x: acak ? Math.random() * canvas.width : canvas.width + lebar,
      y: Math.random() * canvas.height * 0.45 + 20,
      lebar,
      tinggi: Math.random() * 40 + 30,
      kecepatan: Math.random() * 0.3 + 0.1,
      warna,
      alpha: Math.random() * 0.3 + 0.1,
    };
  }

  function gambarAwan(a) {
    ctx.save();
    ctx.globalAlpha = a.alpha;
    ctx.fillStyle = a.warna;
    ctx.shadowColor = a.warna;
    ctx.shadowBlur = 20;

    const x = a.x, y = a.y, w = a.lebar, h = a.tinggi;
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.ellipse(x - w * 0.2, y + h * 0.1, w * 0.35, h * 0.4, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.2, y + h * 0.1, w * 0.3, h * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    awanList.forEach(a => {
      gambarAwan(a);
      a.x -= a.kecepatan;
      if (a.x < -a.lebar) {
        Object.assign(a, buatAwan(a.warna, false));
      }
    });
    animId = requestAnimationFrame(draw);
  }

  function mulai(c, jumlah, warna) {
    init(c, jumlah, warna);
    if (animId) cancelAnimationFrame(animId);
    draw();
  }
  function berhenti() { if (animId) { cancelAnimationFrame(animId); animId = null; } }

  return { mulai, berhenti };
})();