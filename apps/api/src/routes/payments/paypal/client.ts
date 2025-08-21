import axios from "axios";

export const getPayPalAccessToken = async () => {
  const response = await axios.post(
    `${process.env.PAYPAL_API_BASE}/v1/oauth2/token`,
    new URLSearchParams({ grant_type: "client_credentials" }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
    }
  );

  return response.data.access_token;
};
