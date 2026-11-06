/**
 * Tally Embed URLs Configuration per Language / Locale
 *
 * Masing-masing bahasa memiliki form pendaftaran Tally tersendiri.
 */

export const DEFAULT_TALLY_URLS: Record<string, string> = {
  // 1. Spanyol (es-ES)
  'es-ES': 'https://tally.so/embed/VppxbJ?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1',

  // 2. Inggris (en-US)
  'en-US': 'https://tally.so/embed/yXX7jB?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1',

  // 3. Jepang (ja-JP)
  'ja-JP': 'https://tally.so/embed/2jjRDV?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1',

  // 4. Prancis (fr-FR)
  'fr-FR': 'https://tally.so/embed/ArrQjk?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1',


  // 6. Arab (ar-SA)
  'ar-SA': 'https://tally.so/embed/vXXWzA?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1',

  // 7. Korsel / Korea (ko-KR)
  'ko-KR': 'https://tally.so/embed/7XXPPL?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1',


  // 9. Portugis (pt-PT)
  'pt-PT': 'https://tally.so/embed/gbbOON?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1',

  // 10. Indonesia (id-ID) - Form Asli Bawaan
  'id-ID': 'https://tally.so/embed/WJJ1dv?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1',


  // Mandarin (zh-CN)
  'zh-CN': 'https://tally.so/embed/ArzAvB?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1',

  // Rusia (ru-RU)
  'ru-RU': 'https://tally.so/embed/o99xv1?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1',
};

/**
 * Mendapatkan URL Embed Tally yang sesuai dengan bahasa aktif saat ini
 */
export function getTallyEmbedUrl(locale?: string, customOverrides?: Record<string, string>): string {
  const currentLocale = locale || 'id-ID';

  // 1. Cek override kustom dari konfigurasi database admin jika ada
  if (customOverrides && customOverrides[currentLocale] && customOverrides[currentLocale].trim()) {
    return customOverrides[currentLocale].trim();
  }

  // 2. Gunakan URL bawaan yang telah dipetakan
  if (DEFAULT_TALLY_URLS[currentLocale]) {
    return DEFAULT_TALLY_URLS[currentLocale];
  }

  // 3. Fallback jika tidak ditemukan
  if (currentLocale.startsWith('id')) {
    return DEFAULT_TALLY_URLS['id-ID'];
  }
  return DEFAULT_TALLY_URLS['en-US'] || DEFAULT_TALLY_URLS['id-ID'];
}
