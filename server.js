const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const QRCode = require("qrcode");

const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "tortenetek"));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// történetek listázása + QR
app.get("/admin/list", async (req, res) => {
    const dir = path.join(__dirname, "tortenetek");

    fs.readdir(dir, async (err, files) => {
        if (err) {
            return res.status(500).json({ error: "Nem sikerült beolvasni a történeteket." });
        }

        const stories = await Promise.all(files
            .filter(f => f.endsWith(".json"))
            .map(async f => {
                const name = f.replace(".json", "");
                const IP = "192.168.0.100"; // a laptop IP-je a helyi hálózaton
                const url = `http://${IP}:${PORT}/?story=${name}`;
                const qr = await QRCode.toDataURL(url, { width: 600 }); // 600 px széles QR
                return { name, url, qr };
            })
        );

        res.json({ stories });
    });
});

app.post("/admin/upload", upload.single("storyFile"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Nem érkezett fájl!" });
    }
    res.json({ message: "Fájl feltöltve!", filename: req.file.originalname });
});

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

app.listen(PORT, () => {
    console.log(`Szerver fut: http://localhost:${PORT}`);
});
