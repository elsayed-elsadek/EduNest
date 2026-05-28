
import React, { useState, memo } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Mail, MapPin, Phone } from 'lucide-react';
import axios from 'axios';
import { sendContact, type ContactData } from "../../services/contactService";
import toast from 'react-hot-toast';

const ContactUsSection: React.FC = memo(() => {
  const [form, setForm] = useState<ContactData>({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({}); 
    setLoading(true);

    const dataToSend = {
      name: form.name.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      message: form.message.trim() || null
    };

 
    try {
  const res = await sendContact(dataToSend as unknown as ContactData);
  
 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = res.data as any; 

  const successMsg = data?.apiResponse?.Status || "تم الإرسال بنجاح ✅";

  toast.success(successMsg, { position: "top-right" });
  setForm({ name: "", email: "", phone: "", message: "" });

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const apiResponse = err.response?.data;
        
        if (apiResponse?.errorMessages) {
          setFieldErrors(apiResponse.errorMessages);
          toast.error("Please check the input fields.", { position: "top-right" });
        } 
        else {
          const generalError = apiResponse?.message || "Something went wrong. Please try again later";
          toast.error(generalError, { position: "top-right" });
        }
      } else {
        toast.error("Unable to connect to the server. Please check your internet connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-gray-50">
   
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-12 sm:gap-16 items-start">

          {/* Left Side: Content and Info */}
          <div className="order-2 lg:order-1 h-[100%] grid content-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-base text-gray-600 mb-8 max-w-md">
              We are committed to processing the information in order to contact you and talk about your project.
            </p>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Mail className="w-5 h-5 text-gray-600" />
                <a href="mailto:example@teamwebflow.com" className="text-base text-gray-800 hover:text-[#0f5e8b] transition-colors">
                  EduNest123@gmail.com
                </a>
              </div>

              <div className="flex items-start space-x-4">
                <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                <address className="text-base text-gray-800 not-italic leading-relaxed">
                 Faculty of Computers & Information
                </address>
              </div>

              <div className="flex items-center space-x-4">
                <Phone className="w-5 h-5 text-gray-600" />
                <a href="tel:+441236547890" className="text-base text-gray-800 hover:text-[#0f5e8b] transition-colors">
                  01061965771
                </a>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="order-1 lg:order-2 p-6 sm:p-8 rounded-2xl bg-white shadow-sm border border-gray-100 w-full">
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              
              {/* Name */}
              <div>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  type="text"
                  placeholder="Name"
                  className={`w-full p-4 border rounded-2xl focus:ring-2 outline-none transition-all ${
                    fieldErrors.name ? 'border-red-500 focus:ring-red-100' : 'border-gray-200 focus:ring-[#0f5e8b]'
                  }`}
                />
                {fieldErrors.name && <p className="text-red-500 text-xs mt-1 ml-2">{fieldErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="Email"
                  className={`w-full p-4 border rounded-2xl focus:ring-2 outline-none transition-all ${
                    fieldErrors.email ? 'border-red-500 focus:ring-red-100' : 'border-gray-200 focus:ring-[#0f5e8b]'
                  }`}
                />
                {fieldErrors.email && <p className="text-red-500 text-xs mt-1 ml-2">{fieldErrors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  type="tel"
                  placeholder="Phone"
                  className={`w-full p-4 border rounded-2xl focus:ring-2 outline-none transition-all ${
                    fieldErrors.phone ? 'border-red-500 focus:ring-red-100' : 'border-gray-200 focus:ring-[#0f5e8b]'
                  }`}
                />
                {fieldErrors.phone && <p className="text-red-500 text-xs mt-1 ml-2">{fieldErrors.phone}</p>}
              </div>

              {/* Message */}
              <div>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Message"
                  rows={4}
                  className={`w-full p-4 border rounded-2xl focus:ring-2 outline-none resize-none transition-all ${
                    fieldErrors.message ? 'border-red-500 focus:ring-red-100' : 'border-gray-200 focus:ring-[#0f5e8b]'
                  }`}
                ></textarea>
                {fieldErrors.message && <p className="text-red-500 text-xs mt-1 ml-2">{fieldErrors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 text-white font-semibold rounded-2xl bg-[#0f5e8b] transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#0d4d72]'}`}
              >
                {loading ? 'Sending...' : 'Submit'}
              </button>

            </form>
          </div>
        </div>
      </div>
    </section>
  );
});

export default ContactUsSection;







