const AnimasiController = (() => {
  let canvas, modulAktif = [];

  const TEMA_CSS = {
    'pagi-cerah'    : 'css/tema/pagi-cerah.css',
    'siang-cerah'   : 'css/tema/siang-cerah.css',
    'sore-cerah'    : 'css/tema/sore-cerah.css',
    'malam-cerah'   : 'css/tema/malam-cerah.css',
    'berawan'       : 'css/tema/berawan.css',
    'hujan'         : 'css/tema/hujan.css',
    'badai'         : 'css/tema/badai.css',
  };

  // Tentukan periode waktu dari jam lokal
  function getPeriode(jam) {
    if (jam >= 5  && jam < 10) return 'pagi';
    if (jam >= 10 && jam < 15) return 'siang';
    if (jam >= 15 && jam < 18) return 'sore';
    return 'malam';
  }

  // Tentukan kategori cuaca dari kode BMKG
  function getKategori(weatherCode) {
    const c = parseInt(weatherCode);
    if (isNaN(c)) return 'cerah';
    if (c === 0 || c === 1)              return 'cerah';
    if (c === 2 || c === 3 || c === 4)  return 'berawan';
    if (c === 10 || c === 45)            return 'berkabut';
    if (c >= 17 && c <= 29)             return 'badai';
    if (c >= 60 && c <= 69)             return 'hujan-ringan';
    if (c >= 70 && c <= 79)             return 'hujan-lebat';
    if (c >= 80 && c <= 89)             return 'hujan';
    if (c >= 90)                         return 'badai';
    return 'cerah';
  }

  // Hentikan semua animasi aktif
  function hentikanSemua() {
    modulAktif.forEach(m => m.berhenti());
    modulAktif = [];
  }

  // Ganti tema CSS
  function gantiTema(tema) {
    const link = document.getElementById('temaLink');
    if (link && TEMA_CSS[tema]) link.href = TEMA_CSS[tema];
  }

  // Resize canvas agar full screen
  function resizeCanvas() {
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // Inisialisasi canvas
  function initCanvas() {
    canvas = document.getElementById('animasiCanvas');
    resizeCanvas();
    window.addEventListener('resize', () => {
      resizeCanvas();
      // Restart animasi setelah resize agar partikel menyesuaikan ukuran
      if (modulAktif.length > 0) terapkan(kondisiTerakhir);
    });
  }

  let kondisiTerakhir = null;

  // Fungsi utama — panggil ini setelah dapat data BMKG
  function terapkan(kondisi) {
    kondisiTerakhir = kondisi;
    hentikanSemua();

    const { weatherCode, jamLokal } = kondisi;
    const jam      = jamLokal !== undefined ? jamLokal : new Date().getHours();
    const periode  = getPeriode(jam);
    const kategori = getKategori(weatherCode);

    // Pilih tema + animasi berdasarkan kombinasi periode + kategori
    if (kategori === 'badai') {
      gantiTema('badai');
      Awan.mulai(canvas, 8, 'rgba(40,40,60,0.5)');
      Hujan.mulai(canvas, 'lebat');
      Petir.mulai(canvas);
      modulAktif = [Awan, Hujan, Petir];

    } else if (kategori === 'hujan-lebat') {
      gantiTema('hujan');
      Awan.mulai(canvas, 7, 'rgba(60,80,100,0.4)');
      Hujan.mulai(canvas, 'lebat');
      modulAktif = [Awan, Hujan];

    } else if (kategori === 'hujan' || kategori === 'hujan-ringan') {
      gantiTema('hujan');
      Awan.mulai(canvas, 5, 'rgba(80,100,120,0.35)');
      Hujan.mulai(canvas, kategori === 'hujan-ringan' ? 'ringan' : 'sedang');
      modulAktif = [Awan, Hujan];

    } else if (kategori === 'berawan' || kategori === 'berkabut') {
      gantiTema('berawan');
      Awan.mulai(canvas, periode === 'malam' ? 4 : 6,
        periode === 'malam' ? 'rgba(50,60,80,0.4)' : 'rgba(200,210,220,0.3)');
      modulAktif = [Awan];

    } else {
      // Cerah — tergantung periode
      if (periode === 'malam') {
        gantiTema('malam-cerah');
        Bintang.mulai(canvas);
        modulAktif = [Bintang];

      } else if (periode === 'pagi') {
        gantiTema('pagi-cerah');
        Matahari.mulai(canvas);
        modulAktif = [Matahari];

      } else if (periode === 'sore') {
        gantiTema('sore-cerah');
        Awan.mulai(canvas, 2, 'rgba(255,150,80,0.2)');
        modulAktif = [Awan];

      } else {
        gantiTema('siang-cerah');
        Matahari.mulai(canvas);
        modulAktif = [Matahari];
      }
    }
  }

  // Jalankan animasi default berdasarkan jam sekarang (sebelum data BMKG)
  function inisialisasiDefault() {
    initCanvas();
    const jam = new Date().getHours();
    terapkan({ weatherCode: 1, jamLokal: jam });
  }

  // Helper publik: dapatkan kelas CSS card berdasarkan jam + weatherCode
  function getKelasCard(weatherCode, jamLokal) {
    const jam      = jamLokal !== undefined ? jamLokal : new Date().getHours();
    const periode  = getPeriode(jam);
    const kategori = getKategori(weatherCode);

    if (kategori === 'badai')                          return 'card-badai';
    if (kategori === 'hujan-lebat' || kategori === 'hujan' || kategori === 'hujan-ringan') {
      return periode === 'malam' ? 'card-hujan-malam' : 'card-hujan';
    }
    if (kategori === 'berawan' || kategori === 'berkabut') {
      return periode === 'malam' ? 'card-berawan-malam' : 'card-berawan';
    }
    // Cerah
    if (periode === 'malam') return 'card-malam-cerah';
    if (periode === 'pagi')  return 'card-pagi-cerah';
    if (periode === 'sore')  return 'card-sore-cerah';
    return 'card-siang-cerah';
  }

  return { terapkan, inisialisasiDefault, getKelasCard };
})();