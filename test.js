const fs = require("fs");
const axios = require("axios");
const { createCanvas } = require("canvas");
const GIFEncoder = require("gifencoder");

const encoder = new GIFEncoder(600, 800);
encoder.createReadStream().pipe(fs.createWriteStream("output.gif"));

encoder.start();
encoder.setRepeat(0); // Loop forever
encoder.setDelay(100); // 100ms delay
encoder.setQuality(64);
encoder.setTransparent(0x00ff00); // Yeşil arkaplanı şeffaf yap (veya farklı bir renk)

async function fetchImage(url) {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return response.data;
}

(async () => {
    const baseUrl = "https://s.namemc.com/3d/skin/body.png";
    const angles = [0, 45, 90, 135, 180, 225, 270, 315]; // Test açılar

    for (const angle of angles) {
        const url = `${baseUrl}?id=73bcc5db50f015a4&model=slim&theta=${angle}&phi=15&width=600&height=800`;
        const buffer = await fetchImage(url);

        const canvas = createCanvas(600, 800);
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.src = buffer;
        await new Promise((resolve) => (img.onload = resolve));

        ctx.drawImage(img, 0, 0, 600, 800);
        encoder.addFrame(ctx);
    }

    encoder.finish();
    console.log("GIF oluşturuldu!");
})();
