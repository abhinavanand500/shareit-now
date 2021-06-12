const File = require("./models/file");
const fs = require("fs");
const connectDB = require("./config/db");
connectDB();
async function fetchData() {
    // 24 hours =
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const files = await File.find({ createdAt: { $lt: pastDate } });
    if (files.length) {
        for (const file in files) {
            try {
                fs.unlinkSync(file.path);
                await file.remove();
                console.log(`Succesfully deleted ${file.filename}`);
            } catch (r) {
                console.log("Error while deleting file");
            }
        }
    }
}
fetchData().then(() => {
    process.exit();
});
