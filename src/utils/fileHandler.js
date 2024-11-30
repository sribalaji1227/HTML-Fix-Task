const fs = require("fs-extra");
const path = require("path");
const AdmZip = require("adm-zip");
const { fixHTMLContent } = require("./htmlFixer");

exports.processHTMLFiles = async (zipFilePath, options = {}) => {
  const timestamp = Date.now();
  const extractDir = path.join("uploads", `${timestamp}`);
  const fixedDir = path.join("fixedFiles", `${timestamp}`);

  try {
    await fs.ensureDir(extractDir);
    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(extractDir, true);

    const htmlFiles = fs
      .readdirSync(extractDir)
      .filter((file) => file.endsWith(".html"));

    if (!htmlFiles.length) {
      throw new Error("No HTML files found in the uploaded ZIP.");
    }

    const firstFilePath = path.join(extractDir, htmlFiles[0]);
    const fixedHTML = await fixHTMLContent(firstFilePath);

    if (options.returnHtml) {
      return fixedHTML;
    }

    await fs.ensureDir(fixedDir);
    await fs.writeFile(path.join(fixedDir, htmlFiles[0]), fixedHTML);

    const outputZipPath = path.join(fixedDir, "fixed_html.zip");
    const outputZip = new AdmZip();
    outputZip.addLocalFolder(fixedDir);
    outputZip.writeZip(outputZipPath);

    return outputZipPath;
  } catch (error) {
    console.error("Error processing HTML files:", error.message);
    throw error;
  } finally {
    await exports.cleanUpTemporaryFiles([extractDir]);
  }
};

exports.cleanUpTemporaryFiles = async (paths) => {
  await Promise.all(paths.map((filePath) => fs.remove(filePath)));
};
