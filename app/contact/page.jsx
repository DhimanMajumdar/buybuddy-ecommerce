"use client";
import React, { useState } from "react";
import { Mail, MessageSquare, MapPin } from "lucide-react";
import toast from "react-hot-toast";

const ContactPage = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

    try {
      const res = await fetch("https://formspree.io/f/mykllajz", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (res.ok) {
        toast.success("Message sent 🚀");
        e.target.reset();
      } else {
        toast.error("Something went wrong ❌");
      }
    } catch (error) {
      toast.error("Network error ⚠️");
    }

    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="grid grid-cols-1 gap-x-12 gap-y-16 lg:grid-cols-2">

        {/* LEFT SIDE */}
        <div>
          <h2 className="text-base font-bold uppercase tracking-widest text-sky-600">
            Contact Us
          </h2>
          <h1 className="mt-4 text-4xl font-black text-gray-900 sm:text-6xl">
            Get in touch.
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            We're here to help you 24/7.
          </p>

          <div className="mt-12 space-y-8">
            <div className="flex gap-x-4">
              <Mail className="text-sky-600" />
              <p>dhiman.majumdar@hbwsl.com</p>
            </div>
            <div className="flex gap-x-4">
              <MessageSquare className="text-sky-600" />
              <p>Mail support available</p>
            </div>
            <div className="flex gap-x-4">
              <MapPin className="text-sky-600" />
              <p>Baner, Pune</p>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border">
          <form onSubmit={handleSubmit} className="space-y-6">

            <input type="hidden" name="_subject" value="New Contact Message 🚀" />

            <input
              type="text"
              name="name"
              required
              placeholder="Your Name"
              className="w-full px-4 py-3 rounded-xl ring-1 ring-gray-300 focus:ring-sky-500 outline-none"
            />

            <input
              type="email"
              name="email"
              required
              placeholder="Your Email"
              className="w-full px-4 py-3 rounded-xl ring-1 ring-gray-300 focus:ring-sky-500 outline-none"
            />

            <textarea
              name="message"
              required
              rows={4}
              placeholder="Your Message"
              className="w-full px-4 py-3 rounded-xl ring-1 ring-gray-300 focus:ring-sky-500 outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-sky-600 hover:bg-sky-700"
              }`}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ContactPage;