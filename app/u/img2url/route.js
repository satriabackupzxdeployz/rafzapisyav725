import { uploadToRafz } from "@/lib/scrapers/uploader";
import { ok, fail, badRequest } from "@/lib/response";

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!file || typeof file === "string") {
      return badRequest("Form field 'file' (image) is required");
    }
    if (!file.type?.startsWith("image/")) {
      return badRequest("Uploaded file must be an image");
    }

    const data = await uploadToRafz(file);
    return ok(data);
  } catch (error) {
    return fail(error.message);
  }
}
