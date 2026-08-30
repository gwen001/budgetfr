const express = require("express");
const cors = require("cors");
const PDFParse = require("pdf-parse");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
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

app.listen(4000, () => console.log("Extractor running on 4000"));
