import axios from "axios";
import { getPayPalAccessToken } from "./client";

export const createOrder = async (amount: string) => {
  const accessToken = await getPayPalAccessToken();

  const response = await axios.post(
    `${process.env.PAYPAL_API_BASE}/v2/checkout/orders`,
    {
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: "USD", value: amount } }],
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};
