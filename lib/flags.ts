// Converts a 2-letter ISO 3166-1 alpha-2 code to the corresponding flag emoji
function isoToFlag(code: string): string {
  return [...code.toUpperCase()]
    .map(c => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('')
}

// England and Scotland use Unicode subdivision tag sequences, not standard ISO flags
const SUBDIVISION_FLAGS: Record<string, string> = {
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
}

const ISO_CODES: Record<string, string> = {
  Algeria: 'DZ',
  Argentina: 'AR',
  Australia: 'AU',
  Austria: 'AT',
  Belgium: 'BE',
  'Bosnia & Herzegovina': 'BA',
  Brazil: 'BR',
  Canada: 'CA',
  'Cape Verde': 'CV',
  Colombia: 'CO',
  Croatia: 'HR',
  'Curaçao': 'CW',
  'Czech Republic': 'CZ',
  'DR Congo': 'CD',
  Ecuador: 'EC',
  Egypt: 'EG',
  France: 'FR',
  Germany: 'DE',
  Ghana: 'GH',
  Haiti: 'HT',
  Iran: 'IR',
  Iraq: 'IQ',
  'Ivory Coast': 'CI',
  Japan: 'JP',
  Jordan: 'JO',
  Mexico: 'MX',
  Morocco: 'MA',
  Netherlands: 'NL',
  'New Zealand': 'NZ',
  Norway: 'NO',
  Panama: 'PA',
  Paraguay: 'PY',
  Portugal: 'PT',
  Qatar: 'QA',
  'Saudi Arabia': 'SA',
  Senegal: 'SN',
  'South Africa': 'ZA',
  'South Korea': 'KR',
  Spain: 'ES',
  Sweden: 'SE',
  Switzerland: 'CH',
  Tunisia: 'TN',
  Turkey: 'TR',
  USA: 'US',
  Uruguay: 'UY',
  Uzbekistan: 'UZ',
}

export function getFlag(country: string): string {
  if (SUBDIVISION_FLAGS[country]) return SUBDIVISION_FLAGS[country]
  const code = ISO_CODES[country]
  return code ? isoToFlag(code) : ''
}
