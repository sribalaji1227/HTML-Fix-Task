const fs = require("fs-extra");
const { parseDocument } = require("htmlparser2");
const { DomUtils } = require("htmlparser2");
const { render } = require("dom-serializer");
const prettier = require("prettier");

exports.fixHTMLContent = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const root = parseDocument(content);

    // Add missing attributes to <img> tags dynamically
    const fixImages = (node) => {
      DomUtils.filter((child) => child.name === "img", node, true).forEach(
        (img, index) => {
          img.attribs = img.attribs || {};
          img.attribs.src ||= `https://picsum.photos/seed/image${index}/200/300`;
          img.attribs.alt ||= `Sample Image ${index}`;
          img.attribs.loading ||= "lazy";
        }
      );
    };

    //Fix structural accessibility and empty `id` attribute issues dynamically
    const fixStructure = (node) => {
      const childrenToRemove = [];

      node.children?.forEach((child, index) => {
        if (
          child.name === "div" &&
          child.children?.length === 1 &&
          child.children[0].name === "ul"
        ) {
          const ulElement = child.children[0];
          DomUtils.appendChild(node, ulElement);
          childrenToRemove.push(index);
        }
        if (
          child.name === "a" &&
          child.children?.some((ch) => ch.name === "img")
        ) {
          const imgChild = child.children.find((ch) => ch.name === "img");
          DomUtils.appendChild(node, imgChild);
        }
        if (
          child.name === "div" &&
          (!child.children || !child.children.length)
        ) {
          childrenToRemove.push(index);
        }
        if (
          child.name === "footer" &&
          (!child.attribs || !child.attribs.role)
        ) {
          child.attribs = { ...child.attribs, role: "contentinfo" };
        }
        if (
          child.attribs &&
          typeof child.attribs.id === "string" &&
          child.attribs.id.trim() === ""
        ) {
          delete child.attribs.id;
        }
        fixStructure(child);
      });

      // Remove redundant nodes
      childrenToRemove.reverse().forEach((index) => {
        node.children.splice(index, 1);
      });
    };

    fixImages(root);
    fixStructure(root);

    const fixedHTML = prettier.format(render(root), { parser: "html" });
    return fixedHTML;
  } catch (error) {
    console.error("Error fixing HTML content:", error.message);
    throw error;
  }
};
