const axios = require("axios");
const FormData = require("form-data");

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

/**
 * Send an image to the AgriVerse AI service
 * and return the disease prediction.
 */
const predictDisease = async (fileBuffer, fileName = "image.jpg") => {
  const form = new FormData();

  form.append("file", fileBuffer, {
    filename: fileName,
    contentType: "image/jpeg",
  });

  const response = await axios.post(
    `${AI_SERVICE_URL}/predict`,
    form,
    {
      headers: {
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 120000,
    }
  );

  return response.data;
};

module.exports = {
  predictDisease,
};