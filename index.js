const sharp = require("sharp");
const GIF = require("./gif2");
const axios = require("axios");

const phi = 15;
const id = "73bcc5db50f015a4"; // NameMC user ID
const width = 600;
const height = 800;
const model = "slim";
const startTheta = 60;
const frameSkip = 5;
const gifSpeed = 3 / 100;
const baseUrl = "https://s.namemc.com/3d/skin/body.png";
const time = 180 //0 = default - 180 recommended
const reserve = true
// Generate angles
const frameAngles = Array.from({ length: Math.ceil(360 / frameSkip) }, (_, i) => i * frameSkip);

// Find closest pivot angle
let pivot = frameAngles.includes(startTheta)
    ? startTheta
    : frameAngles.reduce((prev, curr) =>
        Math.abs(curr - startTheta) < Math.abs(prev - startTheta) ? curr : prev
    );

const pivotIndex = frameAngles.indexOf(pivot);
let angles = frameAngles.slice(pivotIndex).concat(frameAngles.slice(0, pivotIndex));
if (reserve) angles = [...angles].reverse().slice(1, -1)
// Function to fetch an image as a buffer (RAM caching)
async function fetchImage(angle) {
    const url = `${baseUrl}?id=${id}&model=${model}&time=${time}&theta=${angle}&phi=${phi}&width=${width}&height=${height}`;

    try {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        return response.data; // Return buffer
    } catch (error) {
        console.error(`Failed to fetch image for angle ${angle}:`, error.message);
        return null;
    }
}

(async () => {
    let processes = [];

    // Fetch all images into RAM
    for (const angle of angles) {
        console.log("Fetching image for angle", angle);
        const buffer = await fetchImage(angle);
        if (buffer) {
            if (buffer) {
                const processed = sharp(buffer).flatten({ background: { r: 1, g: 1, b: 1, alpha: 1 }, })

                processes.push(processed);
            }
        }
    }

    if (processes.length === 0) {
        console.error("No frames were loaded. Exiting...");
        return;
    }

    console.log("Creating GIF...");
    const image = await GIF.createGif({
        gifEncoderOptions: { highWaterMark: 64, dispose: 2 },
        quality: 60,
        delay: gifSpeed * 1000,
        transparent: 0x01010101
    })

        .addFrame(processes)
        .toSharp();

    await image.toFile("./frames.gif");
    console.log("GIF created successfully!");
})();
