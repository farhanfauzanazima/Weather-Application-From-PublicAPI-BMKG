// ============================================================
// Render card dan data cuaca
// ============================================================

function tampilkanLokasi(lokasi) {
  const el = document.getElementById('infoLokasi');
  document.getElementById('namaLokasi').textContent =
    [lokasi.desa, lokasi.kecamatan, lokasi.kotkab, lokasi.provinsi]
      .filter(Boolean).join(', ');
  document.getElementById('koordinat').textContent =
    `${lokasi.lat?.toFixed(4)}, ${lokasi.lon?.toFixed(4)} | ${lokasi.timezone}`;
  el.style.display = 'block';
}

function renderCuaca(cuacaPerHari) {
  const hasil = document.getElementById('hasil');
  let html = '';

  // Ambil cuaca jam pertama hari ini untuk animasi background
  const cuacaSekarang = cuacaPerHari[0]?.[0];
  if (cuacaSekarang) {
    const jamLokal = parseInt(cuacaSekarang.local_datetime?.split(' ')[1] || '12');
    AnimasiController.terapkan({
      weatherCode: cuacaSekarang.weather,
      jamLokal,
    });
  }

  cuacaPerHari.forEach((hariData, i) => {
    if (!hariData || hariData.length === 0) return;
    html += `
      <div class="mb-4">
        <div class="hari-header">${formatLabelHari(hariData[0].local_datetime, i)}</div>
        <div class="row g-3">
          ${hariData.map(jam => `
            <div class="col-6 col-md-4 col-lg-3">${buatKartuCuaca(jam)}</div>
          `).join('')}
        </div>
      </div>`;
  });

  hasil.innerHTML = html || '<p class="text-white text-center">Tidak ada data cuaca.</p>';
}

function buatKartuCuaca(jam) {
  // Ambil jam dari local_datetime untuk menentukan tema card
  const jamAngka = parseInt(jam.local_datetime?.split(' ')[1]?.split(':')[0] || '12');
  const kelasCard = AnimasiController.getKelasCard(jam.weather, jamAngka);
  const arah = jam.wd && jam.wd_to ? `${jam.wd} → ${jam.wd_to}` : (jam.wd || '-');

  return `
    <div class="cuaca-card ${kelasCard}">
      <div class="waktu-badge">🕐 ${formatWaktu(jam.local_datetime)}</div>
      <div class="cuaca-icon-fallback">${getEmojiCuaca(jam.weather)}</div>
      <div class="cuaca-desc">${jam.weather_desc || '-'}</div>
      <div class="suhu-utama">${jam.t ?? '-'}<span>°C</span></div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">💧 Kelembaban</div>
          <div class="info-value">${jam.hu ?? '-'}%</div>
        </div>
        <div class="info-item">
          <div class="info-label">💨 Angin</div>
          <div class="info-value">${jam.ws ?? '-'} m/s</div>
        </div>
        <div class="info-item">
          <div class="info-label">🧭 Arah</div>
          <div class="info-value">${arah}</div>
        </div>
        <div class="info-item">
          <div class="info-label">👁️ Visibilitas</div>
          <div class="info-value">${jam.vs_text || '-'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">☁️ Awan</div>
          <div class="info-value">${jam.tcc ?? '-'}%</div>
        </div>
        <div class="info-item">
          <div class="info-label">🌧️ Curah Hujan</div>
          <div class="info-value">${jam.tp ?? 0} mm</div>
        </div>
      </div>
    </div>`;
}

// ============================================================
// HELPERS
// ============================================================
function formatWaktu(str) {
  if (!str) return '-';
  const p = str.split(' ');
  return p.length < 2 ? str : p[1].substring(0, 5);
}

function formatLabelHari(str, i) {
  const hari  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  if (!str) return i === 0 ? 'Hari Ini' : i === 1 ? 'Besok' : `Hari ke-${i+1}`;
  const dt = new Date(str.replace(' ', 'T'));
  if (isNaN(dt)) return i === 0 ? 'Hari Ini' : i === 1 ? 'Besok' : `Hari ke-${i+1}`;
  const label = i === 0 ? 'Hari Ini' : i === 1 ? 'Besok' : i === 2 ? 'Lusa' : hari[dt.getDay()];
  return `${label} — ${hari[dt.getDay()]}, ${dt.getDate()} ${bulan[dt.getMonth()]}`;
}

function getEmojiCuaca(code) {
  const map = {
    0:'🌑', 1:'☀️', 2:'⛅', 3:'☁️', 4:'☁️',
    10:'🌫️', 17:'⛈️', 45:'🌫️', 60:'🌦️',
    61:'🌧️', 63:'🌧️', 80:'🌦️', 95:'⛈️', 97:'⛈️'
  };
  return map[parseInt(code)] || '🌡️';
}