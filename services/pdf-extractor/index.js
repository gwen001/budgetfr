const express = require("express");
const cors = require("cors");
const PDFParse = require("pdf-parse");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.post("/extract", async (req, res) => {
    try {
        const { storagePath } = req.body;

        const { data: fileData } = await supabase.storage
        .from("bulletins")
        .download(storagePath);

        const buffer = Buffer.from(await fileData.arrayBuffer());
        const parsed = await PDFParse(buffer);

        res.json({ success: true, text: parsed.text });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Extractor running on ${PORT}`));
