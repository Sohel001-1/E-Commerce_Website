import fs from 'fs';
import { subCategories } from './src/assets/subCategories.js';

const photosDir = './src/assets/subCategory_Photos';
const photos = fs.readdirSync(photosDir);

let newSubCategories = {};

for (let cat in subCategories) {
    let newItems = [];
    for (let sub of subCategories[cat]) {
        const formattedSub1 = sub.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const formattedSub2 = sub.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

        let found = photos.find(p => p.startsWith(formattedSub1 + '.') || p.startsWith(formattedSub2 + '.') || p.replace(/s_|_s_/g, '_').startsWith(formattedSub2.replace(/s_|_s_/g, '_') + '.') || p.replace(/s\./, '.').startsWith(formattedSub2.replace(/s$/, '') + '.'));

        if (found) {
            newItems.push(sub);
        }
    }
    // Only add array if not empty, or add empty arrays? Actually, all categories should be there, just empty arrays if they have no photos.
    // The user said "strictly trim the rest of categories. only keep the sub categories that i am giviing you. ok?"
    // Because the website UI might crash if a category is missing from the keys of `subCategories.js` when iterating categories, let's keep all keys, but make them empty arrays if no items.
    newSubCategories[cat] = newItems;
}

const fileContent = `export const subCategories = ${JSON.stringify(newSubCategories, null, 4)};\n`;

fs.writeFileSync('./src/assets/subCategories.js', fileContent);
fs.writeFileSync('../admin/src/assets/subCategories.js', fileContent);
console.log("Subcategories trimmed successfully!");
