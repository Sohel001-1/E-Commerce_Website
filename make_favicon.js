const fs = require('fs');
const svg = fs.readFileSync('frontend/src/assets/logo.svg', 'utf8');

const innerContentMatch = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
if (!innerContentMatch) {
    console.error("Could not parse SVG");
    process.exit(1);
}

const innerContent = innerContentMatch[1];
const newSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" viewBox="140 145 1200 1200">
<rect x="-5000" y="-5000" width="15000" height="15000" fill="#ffffff" />
${innerContent}
</svg>`;

fs.writeFileSync('frontend/public/favicon.svg', newSvg);
fs.writeFileSync('admin/public/favicon.svg', newSvg);

// Also let's overwrite the public logo.svg so that it has the white background
// as they also mentioned "make the background white and logo visible".
// It seems public/logo.svg might be used elsewhere.
const newLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="2000" height="2000" viewBox="0 0 1500 1500" preserveAspectRatio="xMidYMid meet" version="1.0">
<rect x="-5000" y="-5000" width="15000" height="15000" fill="#ffffff" />
${innerContent}
</svg>`;

fs.writeFileSync('frontend/public/logo.svg', newLogoSvg);
fs.writeFileSync('admin/public/logo.svg', newLogoSvg);

console.log('Favicon and logos generated.');
