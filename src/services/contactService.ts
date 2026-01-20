import axios from "axios";
import type { AxiosResponse } from "axios";



export interface ContactData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const BASE_URL = "https://blake-glottologic-carlee.ngrok-free.dev/api/v1/save-contact-message";

export const sendContact = (data: ContactData): Promise<AxiosResponse<unknown>> => {
  return axios.post(BASE_URL, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
