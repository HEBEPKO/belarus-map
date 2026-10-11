// const regionImages = {
//     BYMI: ['../image/BYMI/1.JPG', '../image/BYMI/2.JPG', '../image/BYMI/3.JPG', '../image/BYMI/4.JPG'],
//     BYBR: ['../image/BYBR/IMG_1337.JPG', '../image/BYBR/IMG_1341.JPG', '../image/BYBR/IMG_1370.JPG', '../image/BYBR/VWBJ6999.JPG'],
//     BYHR: ['../image/BYHR/IMG_1335 (3).JPG', '../image/BYHR/IMG_1337 (3).JPG', '../image/BYHR/IMG_1341 (1).JPG', '../image/BYHR/IMG_5763.JPG'],
//     BYVI: ['../image/BYVI/IMG_1072.JPG', '../image/BYVI/IMG_1073.JPG', '../image/BYVI/IMG_1082.JPG', '../image/BYVI/IMG_1331.JPG'],
//     BYHO: ['../image/BYHO/IMG_1058.JPG', '../image/BYHO/IMG_1063 (1).JPG', '../image/BYHO/IMG_1066 (3).JPG', '../image/BYHO/IMG_1071.JPG'],
//     BYMA: ['../image/BYMA/IMG_1380.JPG', '../image/BYMA/IMG_1386 (2).JPG', '../image/BYMA/IMG_1392 (3).JPG', '../image/BYMA/IMG_1394.JPG'],
// };

const currentImageIndices = {
  BYHR: 0,
  BYBR: 0,
  BYVI: 0,
  BYHO: 0,
  BYMA: 0,
  BYMI: 0,
  BYHM: 0,
};
const SVG_NS = "http://www.w3.org/2000/svg";

fetch("./regionImages.json")
  .then(response => response.json())
  .then(regionImages => {
    console.log("Автоматически загруженные картинки:", regionImages);
    function createSvgPatterns(regionImages) {
      console.log("=== ЗАПУСК ГЕНЕРАЦИИ КАРТЫ ===");

      const svg = document.getElementById("belarus-map");
      if (!svg) {
        console.error("ОШИБКА: Тег <svg id='belarus-map'> не найден в HTML!");
        return;
      }
      console.log("1. Контейнер <svg> успешно найден.");

      const mapConfig = window.simplemaps_countrymap_mapdata;
      if (!mapConfig) {
        console.error(
          "ОШИБКА: Данные карты (window.simplemaps_countrymap_mapdata) не найдены! Проверьте файл js/map.js",
        );
        return;
      }
      console.log("2. Объект конфигурации из js/map.js успешно прочитан.");

      let defs = svg.querySelector("defs");
      if (!defs) {
        defs = document.createElementNS(SVG_NS, "defs");
        svg.insertBefore(defs, svg.firstChild);
      }

      const regions = Object.keys(regionImages);
      console.log(`3. Начинаем цикл сборки для ${regions.length} регионов...`);

      regions.forEach((regionId) => {
        const bbox = mapConfig.state_bbox_array[regionId];
        const pathData = mapConfig.paths[regionId];

        if (!bbox) {
          console.warn(
            `Предупреждение: Нет bbox координат для региона ${regionId}`,
          );
          return;
        }

        const patternId = `img-pattern-${regionId}`;
        let pattern = document.getElementById(patternId);
        if (!pattern) {
          pattern = document.createElementNS(SVG_NS, "pattern");
          pattern.setAttribute("id", patternId);
          defs.appendChild(pattern);
        }

        const width = bbox.x2 - bbox.x;
        const height = bbox.y2 - bbox.y;

        pattern.setAttribute("patternUnits", "userSpaceOnUse");
        pattern.setAttribute("x", bbox.x.toString());
        pattern.setAttribute("y", bbox.y.toString()); // Исправлено на bbox.y
        pattern.setAttribute("width", width.toString());
        pattern.setAttribute("height", height.toString());

        let image = pattern.querySelector("image");
        if (!image) {
          image = document.createElementNS(SVG_NS, "image");
          image.setAttribute("id", `img-${regionId}`);
          pattern.appendChild(image);
        }

        image.setAttribute(
          "href",
          regionImages[regionId][currentImageIndices[regionId]],
        );
        image.setAttribute("width", width.toString());
        image.setAttribute("height", height.toString());
        image.setAttribute("preserveAspectRatio", "xMidYMid slice");

        // Создаем путь региона
        let regionPath = document.getElementById(`region-${regionId}`);
        if (!regionPath) {
          regionPath = document.createElementNS(SVG_NS, "path");
          regionPath.setAttribute("id", `region-${regionId}`);
          regionPath.setAttribute("data-region", regionId);
          svg.appendChild(regionPath);
        }

        if (pathData) {
          regionPath.setAttribute("d", pathData);
        } else {
          regionPath.setAttribute(
            "d",
            `M ${bbox.x} ${bbox.y} L ${bbox.x2} ${bbox.y} L ${bbox.x2} ${bbox.y2} L ${bbox.x} ${bbox.y2} Z`,
          );
        }

        regionPath.setAttribute("fill", `url(#${patternId})`);
        regionPath.setAttribute("class", "region");

        console.log(`-> Регион ${regionId} успешно добавлен в SVG.`);
      });

      console.log("4. Все регионы собраны. Переходим к кликам.");
      initMapClicks(svg);
    }

    function initMapClicks(svg) {
      Object.keys(regionImages).forEach((regionId) => {
        const regionPath = document.getElementById(`region-${regionId}`);
        if (!regionPath) return;

        const cleanPath = regionPath.cloneNode(true);
        regionPath.replaceWith(cleanPath);

        cleanPath.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          changeRegionImage(regionId);
        });
      });
      console.log("=== СБОРКА КАРТЫ УСПЕШНО ЗАВЕРШЕНА ===");
    }

    function changeRegionImage(regionId) {
      const images = regionImages[regionId];
      if (!images || images.length === 0) return;

      currentImageIndices[regionId] =
        (currentImageIndices[regionId] + 1) % images.length;
      const nextImageUrl = images[currentImageIndices[regionId]];
      const svgImageElement = document.getElementById(`img-${regionId}`);

      if (svgImageElement) {
        svgImageElement.setAttribute("href", nextImageUrl);
        console.log(`Область ${regionId} изменена на: ${nextImageUrl}`);
      }
    }
    // Безопасный запуск после полной отрисовки всех скриптов
    createSvgPatterns(regionImages);
  })

  .catch(error => console.error("Ошибка загрузки данных картинок:", error));

