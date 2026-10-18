// Renders public/og.png, the 1200×630 social preview image, from the anvil mark.
// The image is committed; run this again when the mark or the wording changes:
// node scripts/og-image.mjs
// Text uses the system's monospace font (JetBrains Mono when installed).
import { readFileSync } from 'node:fs';
import sharp from 'sharp';

const mark = readFileSync(new URL('../src/assets/anvil-mark.svg', import.meta.url), 'utf8')
	.replace(/^<svg[^>]*>/, '')
	.replace(/<\/svg>\s*$/, '');

// Colours are the --forge-* tokens from src/styles/theme.css.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
	<rect width="1200" height="630" fill="#16171a"/>
	<rect y="622" width="1200" height="8" fill="#f5922a"/>
	<g transform="translate(96 206) scale(9)">${mark}</g>
	<g font-family="JetBrains Mono, Consolas, DejaVu Sans Mono, monospace">
		<text x="448" y="300" fill="#f7f5f2" font-size="120" font-weight="800" letter-spacing="5">ANVIL</text>
		<text x="452" y="372" fill="#a8a29e" font-size="34">Plugin loader for</text>
		<text x="452" y="418" fill="#a8a29e" font-size="34">Europa Universalis IV</text>
		<text x="452" y="500" fill="#f5922a" font-size="28">anvil.happydwarf.dev</text>
	</g>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(
	new URL('../public/og.png', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
);
console.log('Wrote public/og.png');
