const fs = require('fs');
const files = fs.readdirSync('src/assets/subCategory_Photos');
let imports = '';
let mapObj = 'export const subCategoryAssets = {\n';
files.forEach(file => {
    if (file.match(/\.(png|jpe?g|svg)$/)) {
        let varName = file.replace(/[^a-zA-Z0-9]/g, '_');
        if (varName.match(/^[0-9]/)) varName = '_' + varName;
        imports += `import ${varName} from './subCategory_Photos/${file}';\n`;
        let key = file.substring(0, file.lastIndexOf('.'));
        mapObj += `    "${key}": ${varName},\n`;
    }
});
mapObj += '};\n';
fs.writeFileSync('src/assets/subCategoryAssets.js', imports + '\n' + mapObj);
