import axios from "axios";
import { getPayPalAccessToken } from "./client";

export const capturePayment = async (orderId: string) => {
  const accessToken = await getPayPalAccessToken();

  const response = await axios.post(
    `${process.env.PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};
