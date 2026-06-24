import { uploadToRafz } from "@/lib/scrapers/uploader";
import { ok, fail, badRequest } from "@/lib/response";

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!file || typeof file === "string") {
      return badRequest("Form field 'file' (video) is required");
    }
    if (!file.type?.startsWith("video/")) {
      return badRequest("Uploaded file must be a video");
    }

    const data = await uploadToRafz(file);
    return ok(data);
  } catch (error) {
    return fail(error.message);
  }
}
