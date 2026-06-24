import { uploadToCatbox } from "@/lib/scrapers/uploader";
import { ok, fail, badRequest } from "@/lib/response";

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!file || typeof file === "string") {
      return badRequest("Form field 'file' is required");
    }

    const data = await uploadToCatbox(file);
    return ok(data);
  } catch (error) {
    return fail(error.message);
  }
}
