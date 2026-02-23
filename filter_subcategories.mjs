import fs from 'fs';
import { subCategories } from './frontend/src/assets/subCategories.js';
import { subCategoryAssets } from './frontend/src/assets/subCategoryAssets.js';

let newSubCategories = {};

for (let cat in subCategories) {
    let newItems = [];
    for (let sub of subCategories[cat]) {
        const formattedSub1 = sub.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const formattedSub2 = sub.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        const keys = Object.keys(subCategoryAssets);
        const matchKey = keys.find(k => k === formattedSub1 || k === formattedSub2 || k.replace(/s_|_s_/g, '_') === formattedSub2.replace(/s_|_s_/g, '_') || k.replace(/s$/, '') === formattedSub2.replace(/s$/, ''));

        if (matchKey) {
            newItems.push(sub);
        }
    }
    if (newItems.length > 0) {
        newSubCategories[cat] = newItems;
    } else {
        newSubCategories[cat] = [];
    }
}

console.log(JSON.stringify(newSubCategories, null, 4));
