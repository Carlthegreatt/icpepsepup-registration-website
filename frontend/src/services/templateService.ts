import fs from "fs";
import path from "path";

export async function getTemplateHtml(id: string) {
  if (!id) {
    throw new Error("Missing template ID");
  }

  if (id.includes("..")) {
    throw new Error("Invalid template ID");
  }

  const filePath = path.join(process.cwd(), "public", "templates", id);

  try {
    const html = fs.readFileSync(filePath, "utf-8");
    return html;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error("Template not found");
    }
    throw new Error("Failed to read template file");
  }
}

// Implement other template-related service functions here, such as listTemplates, createTemplate, updateTemplate, deleteTemplate, etc, if there is
