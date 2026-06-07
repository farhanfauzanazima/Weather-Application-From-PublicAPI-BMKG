// ============================================================
// BMKG Cuaca + api-wilayah.alvirateam.com
// Dropdown bertingkat: Provinsi → Kabupaten → Kecamatan → Desa
// ============================================================

const WILAYAH_BASE = 'https://api-wilayah.alvirateam.com/api/v1';
const BMKG_BASE    = 'https://api.bmkg.go.id/publik/prakiraan-cuaca';

// ============================================================
// INISIALISASI — load provinsi saat halaman buka
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  loadProvinsi();
});

// ============================================================
// LOAD PROVINSI
// ============================================================
async function loadProvinsi() {
  tampilkanDropdownLoading('Memuat daftar provinsi...');
  try {
    const res  = await fetch(`${WILAYAH_BASE}/provinces`);
    const json = await res.json();

    if (json.status !== 'success') throw new Error('Gagal memuat provinsi');

    const sel = document.getElementById('selProvinsi');
    sel.innerHTML = '<option value="">-- Pilih Provinsi --</option>';
    json.data.forEach(p => {
      sel.innerHTML += `<option value="${p.kode}">${p.nama}</option>`;
    });

  } catch (err) {
    console.error(err);
    tampilkanError('Gagal memuat daftar provinsi. Coba refresh halaman.');
  } finally {
    sembunyikanDropdownLoading();
  }
}

// ============================================================
// EVENT: Provinsi dipilih → load kabupaten
// ============================================================
async function onProvinsiChange() {
  const kode = document.getElementById('selProvinsi').value;

  // Reset level bawah
  resetDropdown('selKabupaten', '-- Pilih Kabupaten/Kota --');
  resetDropdown('selKecamatan', '-- Pilih Kecamatan --');
  resetDropdown('selDesa',      '-- Pilih Desa/Kelurahan --');
  document.getElementById('hasil').innerHTML = '';
  document.getElementById('infoLokasi').style.display = 'none';

  if (!kode) return;

  tampilkanDropdownLoading('Memuat kabupaten/kota...');
  try {
    const res  = await fetch(`${WILAYAH_BASE}/regencies?province_id=${kode}`);
    const json = await res.json();

    if (json.status !== 'success') throw new Error('Gagal memuat kabupaten');

    const sel = document.getElementById('selKabupaten');
    sel.innerHTML = '<option value="">-- Pilih Kabupaten/Kota --</option>';
    json.data.forEach(k => {
      sel.innerHTML += `<option value="${k.kode}">${k.nama}</option>`;
    });
    sel.disabled = false;

  } catch (err) {
    console.error(err);
    tampilkanError('Gagal memuat kabupaten/kota.');
  } finally {
    sembunyikanDropdownLoading();
  }
}

// ============================================================
// EVENT: Kabupaten dipilih → load kecamatan
// ============================================================
async function onKabupatenChange() {
  const kode = document.getElementById('selKabupaten').value;

  resetDropdown('selKecamatan', '-- Pilih Kecamatan --');
  resetDropdown('selDesa',      '-- Pilih Desa/Kelurahan --');

  if (!kode) return;

  tampilkanDropdownLoading('Memuat kecamatan...');
  try {
    const res  = await fetch(`${WILAYAH_BASE}/districts?regency_id=${kode}`);
    const json = await res.json();

    if (json.status !== 'success') throw new Error('Gagal memuat kecamatan');

    const sel = document.getElementById('selKecamatan');
    sel.innerHTML = '<option value="">-- Pilih Kecamatan --</option>';
    json.data.forEach(k => {
      sel.innerHTML += `<option value="${k.kode}">${k.nama}</option>`;
    });
    sel.disabled = false;

  } catch (err) {
    console.error(err);
    tampilkanError('Gagal memuat kecamatan.');
  } finally {
    sembunyikanDropdownLoading();
  }
}

// ============================================================
// EVENT: Kecamatan dipilih → load desa
// ============================================================
async function onKecamatanChange() {
  const kode = document.getElementById('selKecamatan').value;

  resetDropdown('selDesa', '-- Pilih Desa/Kelurahan --');

  if (!kode) return;

  tampilkanDropdownLoading('Memuat desa/kelurahan...');
  try {
    const res  = await fetch(`${WILAYAH_BASE}/villages?district_id=${kode}`);
    const json = await res.json();

    if (json.status !== 'success') throw new Error('Gagal memuat desa');

    const sel = document.getElementById('selDesa');
    sel.innerHTML = '<option value="">-- Pilih Desa/Kelurahan --</option>';
    json.data.forEach(d => {
      sel.innerHTML += `<option value="${d.kode}">${d.nama}</option>`;
    });
    sel.disabled = false;

  } catch (err) {
    console.error(err);
    tampilkanError('Gagal memuat desa/kelurahan.');
  } finally {
    sembunyikanDropdownLoading();
  }
}

// ============================================================
// TOMBOL LIHAT CUACA
// ============================================================
async function lihatCuaca() {
  const provinsi  = document.getElementById('selProvinsi');
  const kabupaten = document.getElementById('selKabupaten');
  const kecamatan = document.getElementById('selKecamatan');
  const desa      = document.getElementById('selDesa');

  // Validasi semua dropdown sudah dipilih
  if (!provinsi.value) {
    alert('Silakan pilih provinsi terlebih dahulu.'); return;
  }
  if (!kabupaten.value) {
    alert('Silakan pilih kabupaten/kota terlebih dahulu.'); return;
  }
  if (!kecamatan.value) {
    alert('Silakan pilih kecamatan terlebih dahulu.'); return;
  }
  if (!desa.value) {
    alert('Silakan pilih desa/kelurahan terlebih dahulu.'); return;
  }

  // kode desa = adm4 untuk BMKG, contoh: "32.06.24.2002"
  const adm4 = desa.value;
  await fetchCuacaBMKG(adm4);
}

// ============================================================
// FETCH CUACA BMKG
// ============================================================
async function fetchCuacaBMKG(adm4) {
  const hasil      = document.getElementById('hasil');
  const infoLokasi = document.getElementById('infoLokasi');

  infoLokasi.style.display = 'none';
  hasil.innerHTML = `
    <div class="loading-section">
      <div class="spinner-border" style="color:rgba(255,255,255,0.8);width:3rem;height:3rem;"></div>
      <div class="loading-text">Mengambil data cuaca dari BMKG...</div>
    </div>
  `;

  try {
    const res = await fetch(`${BMKG_BASE}?adm4=${adm4}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} — data tidak ditemukan di BMKG`);

    const json = await res.json();
    if (!json.data || !json.data[0]) throw new Error('Data cuaca kosong untuk wilayah ini.');

    tampilkanLokasi(json.lokasi);
    renderCuaca(json.data[0].cuaca);

  } catch (err) {
    console.error(err);
    tampilkanError(err.message);
  }
}

// ============================================================
// TAMPILKAN LOKASI
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

// ============================================================
// RENDER CUACA
// ============================================================
function renderCuaca(cuacaPerHari) {
  const hasil = document.getElementById('hasil');
  let html = '';

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
  const arah = jam.wd && jam.wd_to ? `${jam.wd} → ${jam.wd_to}` : (jam.wd || '-');
  return `
    <div class="cuaca-card ${getCuacaKelas(jam.weather)}">
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
function resetDropdown(id, placeholder) {
  const sel = document.getElementById(id);
  sel.innerHTML = `<option value="">${placeholder}</option>`;
  sel.disabled = true;
}

function tampilkanDropdownLoading(teks) {
  const el = document.getElementById('dropdownLoading');
  document.getElementById('dropdownLoadingText').textContent = teks;
  el.style.display = 'flex';
}

function sembunyikanDropdownLoading() {
  document.getElementById('dropdownLoading').style.display = 'none';
}

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

function getCuacaKelas(code) {
  const c = parseInt(code);
  if (c === 0 || c === 1) return 'cerah';
  if (c === 2 || c === 3) return 'berawan';
  if (c >= 60 && c <= 99) return 'hujan';
  if (c >= 17 && c <= 29) return 'badai';
  return 'berawan';
}

function getEmojiCuaca(code) {
  const map = {
    0:'🌑', 1:'☀️', 2:'⛅', 3:'☁️', 4:'☁️',
    10:'🌫️', 17:'⛈️', 45:'🌫️', 60:'🌦️',
    61:'🌧️', 63:'🌧️', 80:'🌦️', 95:'⛈️', 97:'⛈️'
  };
  return map[parseInt(code)] || '🌡️';
}

function tampilkanError(pesan) {
  document.getElementById('hasil').innerHTML = `
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="error-card">
          <div style="font-size:3rem;margin-bottom:1rem;">🌧️</div>
          <h5 style="color:#fff;margin-bottom:.5rem;">Gagal Memuat Data</h5>
          <p style="color:rgba(255,255,255,.75);margin:0;">${pesan}</p>
        </div>
      </div>
    </div>`;
}