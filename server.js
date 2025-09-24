const express = require("express");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

const app = express();
const PORT = 8080;

// Statikus fájlok (admin, index, css, js, képek)
app.use(express.static(path.join(__dirname, "public")));

// történetek listázása + QR
app.get("/admin/list", async (req, res) => {
    const dir = path.join(__dirname, "tortenetek");

    fs.readdir(dir, async (err, files) => {
        if (err) {
            return res.status(500).json({ error: "Nem sikerült beolvasni a történeteket." });
        }

        // Saját IP-címedet állítsd be!
        const IP = "192.168.0.100";
        const stories = await Promise.all(
            files.filter(f => f.endsWith(".json")).map(async f => {
                const name = f.replace(".json", "");
                const filePath = path.join(dir, f);

                // JSON beolvasása a címhez
                let title = name;
                try {
                    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
                    if (jsonData.title) {
                        title = jsonData.title;
                    }
                } catch (e) {
                    console.error(`Hiba a JSON beolvasásakor: ${f}`, e);
                }

                // Nagy felbontású QR (600px)
                const url = `http://${IP}:${PORT}/?story=${name}`;
                const qr = await QRCode.toDataURL(url, { width: 600 });

                return { name, title, url, qr };
            })
        );

        res.json({ stories });
    });
});

// történet betöltése név alapján
app.get("/story/:name", (req, res) => {
    const storyName = req.params.name;
    const storyPath = path.join(__dirname, "tortenetek", storyName + ".json");

    fs.readFile(storyPath, "utf8", (err, data) => {
        if (err) {
            res.status(404).json({ error: "Nem található a történet!" });
        } else {
            try {
                res.json(JSON.parse(data));
            } catch (e) {
                res.status(500).json({ error: "Hibás JSON formátum!" });
            }
        }
    });
});

// szerver indítása
app.listen(PORT, () => {
    console.log(`Szerver fut: http://localhost:${PORT}`);
});
