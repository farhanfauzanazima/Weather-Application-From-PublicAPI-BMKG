// ============================================================
// Main — dropdown wilayah + fetch BMKG
// ============================================================

const WILAYAH_BASE = 'https://api-wilayah.alvirateam.com/api/v1';
const BMKG_BASE    = 'https://api.bmkg.go.id/publik/prakiraan-cuaca';

document.addEventListener('DOMContentLoaded', () => {
  AnimasiController.inisialisasiDefault();
  loadProvinsi();
});

async function loadProvinsi() {
  tampilkanDropdownLoading('Memuat daftar provinsi...');
  try {
    const res  = await fetch(`${WILAYAH_BASE}/provinces`);
    const json = await res.json();
    if (json.status !== 'success') throw new Error();
    const sel = document.getElementById('selProvinsi');
    sel.innerHTML = '<option value="">-- Pilih Provinsi --</option>';
    json.data.forEach(p => {
      sel.innerHTML += `<option value="${p.kode}">${p.nama}</option>`;
    });
  } catch {
    tampilkanError('Gagal memuat daftar provinsi.');
  } finally {
    sembunyikanDropdownLoading();
  }
}

async function onProvinsiChange() {
  const kode = document.getElementById('selProvinsi').value;
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
    if (json.status !== 'success') throw new Error();
    const sel = document.getElementById('selKabupaten');
    sel.innerHTML = '<option value="">-- Pilih Kabupaten/Kota --</option>';
    json.data.forEach(k => sel.innerHTML += `<option value="${k.kode}">${k.nama}</option>`);
    sel.disabled = false;
  } catch {
    tampilkanError('Gagal memuat kabupaten/kota.');
  } finally {
    sembunyikanDropdownLoading();
  }
}

async function onKabupatenChange() {
  const kode = document.getElementById('selKabupaten').value;
  resetDropdown('selKecamatan', '-- Pilih Kecamatan --');
  resetDropdown('selDesa',      '-- Pilih Desa/Kelurahan --');
  if (!kode) return;

  tampilkanDropdownLoading('Memuat kecamatan...');
  try {
    const res  = await fetch(`${WILAYAH_BASE}/districts?regency_id=${kode}`);
    const json = await res.json();
    if (json.status !== 'success') throw new Error();
    const sel = document.getElementById('selKecamatan');
    sel.innerHTML = '<option value="">-- Pilih Kecamatan --</option>';
    json.data.forEach(k => sel.innerHTML += `<option value="${k.kode}">${k.nama}</option>`);
    sel.disabled = false;
  } catch {
    tampilkanError('Gagal memuat kecamatan.');
  } finally {
    sembunyikanDropdownLoading();
  }
}

async function onKecamatanChange() {
  const kode = document.getElementById('selKecamatan').value;
  resetDropdown('selDesa', '-- Pilih Desa/Kelurahan --');
  if (!kode) return;

  tampilkanDropdownLoading('Memuat desa/kelurahan...');
  try {
    const res  = await fetch(`${WILAYAH_BASE}/villages?district_id=${kode}`);
    const json = await res.json();
    if (json.status !== 'success') throw new Error();
    const sel = document.getElementById('selDesa');
    sel.innerHTML = '<option value="">-- Pilih Desa/Kelurahan --</option>';
    json.data.forEach(d => sel.innerHTML += `<option value="${d.kode}">${d.nama}</option>`);
    sel.disabled = false;
  } catch {
    tampilkanError('Gagal memuat desa/kelurahan.');
  } finally {
    sembunyikanDropdownLoading();
  }
}

async function lihatCuaca() {
  const prov = document.getElementById('selProvinsi').value;
  const kab  = document.getElementById('selKabupaten').value;
  const kec  = document.getElementById('selKecamatan').value;
  const desa = document.getElementById('selDesa').value;

  if (!prov) { alert('Pilih provinsi terlebih dahulu.'); return; }
  if (!kab)  { alert('Pilih kabupaten/kota terlebih dahulu.'); return; }
  if (!kec)  { alert('Pilih kecamatan terlebih dahulu.'); return; }
  if (!desa) { alert('Pilih desa/kelurahan terlebih dahulu.'); return; }

  const hasil      = document.getElementById('hasil');
  const infoLokasi = document.getElementById('infoLokasi');

  infoLokasi.style.display = 'none';
  hasil.innerHTML = `
    <div class="loading-section">
      <div class="spinner-border" style="color:rgba(255,255,255,0.8);width:3rem;height:3rem;"></div>
      <div class="loading-text">Mengambil data cuaca dari BMKG...</div>
    </div>`;

  try {
    const res  = await fetch(`${BMKG_BASE}?adm4=${desa}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.data || !json.data[0]) throw new Error('Data cuaca kosong.');

    tampilkanLokasi(json.lokasi);
    renderCuaca(json.data[0].cuaca);

  } catch (err) {
    tampilkanError(err.message || 'Gagal mengambil data cuaca.');
  }
}

// ============================================================
// HELPERS UI
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