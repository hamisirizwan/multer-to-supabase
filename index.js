const { StorageClient } = require("@supabase/storage-js");
const fs = require("fs");

class UploadToStorage {
  constructor(SUPA_URL, SUPA_KEY) {
    if (!SUPA_URL || !SUPA_KEY) {
      throw new Error("missing supabase configs");
    }
    this.SUPA_URL = SUPA_URL;
    this.SUPA_KEY = SUPA_KEY;
  }

  bucket = new StorageClient(this.SUPA_URL, {
    apikey: this.SUPA_KEY,
    Authorization: `Bearer ${this.SUPA_KEY}`,
  });

  async singeleFileUpload(file, box) {
    //image from filesystem
    const fileBytes = fs.readFileSync(file.path);

    //upload to supabase bucket
    const uploaded = await this.bucket
      .from(box)
      .upload(`${file.path}`, fileBytes, {
        contentType: file.path.mimetype,
      });

    if (!uploaded.data) {
      fs.unlinkSync(file.path);
      throw new Error(uploaded.error.message);
    }

    //remove file from filesystem
    fs.unlinkSync(file.path);

    //save to prisma
    const file_url = `${process.env.SUPA_URL}/object/public/${box}/${uploaded.data.path}`;

    return file_url;
  }

  async multipleFileUpload(params) {}
}
