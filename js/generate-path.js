import fs from 'fs';
import path from 'path';


const imageDir = './image';
const outputFile = './regionImages.json'

const result = {};

if (fs.existsSync(imageDir)) {
    const regions = fs.readdirSync(imageDir);

    regions.forEach(region => {
        const regionPath = path.join(imageDir, region);

        if (fs.statSync(regionPath).isDirectory()) {
            const file = fs.readdirSync(regionPath)
            .filter(file => /\.(jpe?g|jpg|png|)$/i.test(file))
            .map(file => `../image/${region}/${file}`);

            result[region] = file;
        }
    });

    fs.writeFileSync(outputFile, JSON.stringify(result, null, 4));
    console.log('✅ Список изображений успешно обновлен в regionImages.json');
} else {
    console.error('❌ Папка с изображениями не найдена!');
}
console.log(imageDir, outputFile, result);
