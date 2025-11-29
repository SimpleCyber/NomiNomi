import axios from "axios";

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

export const uploadToIPFS = async (file: File): Promise<string> => {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    throw new Error("Pinata API keys not set");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": `multipart/form-data;`,
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );

    return `ipfs://${res.data.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw error;
  }
};

export const uploadJSONToIPFS = async (json: any): Promise<string> => {
    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      throw new Error("Pinata API keys not set");
    }
  
    try {
      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        json,
        {
          headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_API_KEY,
          },
        }
      );
  
      return `ipfs://${res.data.IpfsHash}`;
    } catch (error) {
      console.error("Error uploading JSON to IPFS:", error);
      throw error;
    }
  };
