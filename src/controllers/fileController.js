const { processHTMLFiles } = require("../utils/fileHandler");

exports.processUploadedFile = async (req, res) => {
  const uploadedFile = req.file;

  if (!uploadedFile) {
    return res.status(400).json({ error: "No file uploaded!" });
  }

  try {
    const fixedHTML = await processHTMLFiles(uploadedFile.path, {
      returnHtml: true,
    });
    res.setHeader("Content-Type", "text/html");
    res.send(fixedHTML);
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Failed to process the uploaded file." });
  }
};
