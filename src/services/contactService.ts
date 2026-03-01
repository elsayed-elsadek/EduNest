
import api from "./api";
import type { AxiosResponse } from "axios";

export interface ContactData {
  name: string;
  email: string;
  phone: string;
  message: string;
}


const ENDPOINT = "api/v1/contact/save-message";

export const sendContact = (data: ContactData): Promise<AxiosResponse<unknown>> => {
 
  return api.post(ENDPOINT, data);
};