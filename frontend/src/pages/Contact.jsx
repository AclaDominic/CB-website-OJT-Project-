import React, { useState, useEffect } from "react";
import api from "../lib/axios";
import bgHeader from "../assets/bg-header-about-us.png";
import {
  Facebook,
  Linkedin,
  Instagram,
  Twitter,
  Youtube,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [officeInfo, setOfficeInfo] = useState({});

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get("/api/page-contents?page=contact");
        const data = response.data;
        const info = data.find((item) => item.section_name === "office_info");
        if (info) {
          try {
            const parsed = JSON.parse(info.content);
            // Normalize data structure for backward compatibility
            setOfficeInfo({
              address: parsed.address || "",
              email:
                typeof parsed.email === "string"
                  ? { value: parsed.email, visible: true }
                  : parsed.email || { value: "", visible: true },
              mobile:
                typeof parsed.mobile === "string"
                  ? { value: parsed.mobile, visible: true }
                  : parsed.mobile || { value: "", visible: true },
              landline:
                typeof parsed.landline === "string"
                  ? { value: parsed.landline, visible: false }
                  : parsed.landline || { value: "", visible: false },
              socials: Array.isArray(parsed.socials) ? parsed.socials : [],
            });
          } catch (e) {
            // Fallback for legacy text
            setOfficeInfo({
              address: info.content,
              email: { value: "", visible: true },
              mobile: { value: "", visible: true },
              landline: { value: "", visible: false },
              socials: [],
            });
          }
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };
    fetchContent();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await api.post("/api/inquiries", formData);
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const getSocialIcon = (platform) => {
    switch (platform) {
      case "facebook":
        return <Facebook className="w-5 h-5" />;
      case "linkedin":
        return <Linkedin className="w-5 h-5" />;
      case "instagram":
        return <Instagram className="w-5 h-5" />;
      case "twitter":
        return <Twitter className="w-5 h-5" />;
      case "youtube":
        return <Youtube className="w-5 h-5" />;
      case "whatsapp":
        return <MessageCircle className="w-5 h-5" />;
      case "viber":
        return <Phone className="w-5 h-5" />;
      default:
        return <MessageCircle className="w-5 h-5" />;
    }
  };

  const getSocialColor = (platform) => {
    switch (platform) {
      case "facebook":
        return "bg-blue-100 text-blue-600 hover:bg-blue-200";
      case "linkedin":
        return "bg-blue-100 text-blue-700 hover:bg-blue-200";
      case "instagram":
        return "bg-pink-100 text-pink-600 hover:bg-pink-200";
      case "twitter":
        return "bg-sky-100 text-sky-500 hover:bg-sky-200";
      case "youtube":
        return "bg-red-100 text-red-600 hover:bg-red-200";
      case "whatsapp":
        return "bg-green-100 text-green-600 hover:bg-green-200";
      case "viber":
        return "bg-purple-100 text-purple-600 hover:bg-purple-200";
      default:
        return "bg-gray-100 text-gray-600 hover:bg-gray-200";
    }
  };

  return (
    <div className="font-sans bg-slate-50 overflow-hidden relative min-h-screen">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white/50 to-green-50/80"></div>
        <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[40%] bg-blue-100/40 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-[30%] -left-[15%] w-[50%] h-[35%] bg-green-100/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute top-[55%] left-[20%] w-[45%] h-[25%] bg-blue-50/50 rounded-full blur-[90px]"></div>
        <div className="absolute bottom-[5%] -right-[5%] w-[55%] h-[30%] bg-green-100/30 rounded-full blur-[110px]"></div>
        <div className="absolute top-[45%] -right-[10%] w-[40%] h-[30%] bg-blue-100/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute -bottom-[5%] -left-[10%] w-[40%] h-[25%] bg-blue-100/20 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[15%] right-[25%] w-[45%] h-[20%] bg-green-50/40 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative w-full h-[280px] sm:h-[340px] lg:h-[390px] xl:h-[440px] flex items-center justify-center overflow-hidden transition-all duration-500">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url(${bgHeader})`,
            backgroundPosition: 'center 60%',
            clipPath: 'url(#heroClipPath)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80"></div>
          <div className="absolute inset-0 bg-[#0a1128]/30 mix-blend-multiply"></div>
        </div>

        <div className="relative z-20 text-center text-white px-6 max-w-6xl -mt-8 sm:-mt-12 lg:-mt-16 transition-all">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 tracking-tight drop-shadow-xl text-white">
            Contact Us
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl font-normal text-gray-100 max-w-2xl mx-auto leading-relaxed drop-shadow-md opacity-90">
            Get in touch for quotations, strategic inquiries, and project partnerships.
          </p>
        </div>

                {/* Seamless Responsive Border & ClipPath definition */}
        <svg
          className="absolute inset-0 w-full h-full z-10 pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="50%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#8bc34a" />
            </linearGradient>
            <clipPath id="heroClipPath" clipPathUnits="objectBoundingBox">
              <path d="M0,0 L1,0 L1,0.7 Q0.33,1.15 0,0.85 Z" />
            </clipPath>
          </defs>
          <path
            d="M0,85 Q33,115 100,70"
            stroke="url(#curveGradient)"
            strokeWidth="10"
            fill="none"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.05)] border border-gray-50 transition-all duration-300">
              <div className="text-center md:text-left mb-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Send us a Message</h2>
                <div className="w-20 h-1.5 bg-green-500 mx-auto md:mx-0 rounded-full"></div>
              </div>

              {status === "success" && (
                <div className="bg-green-50 border border-green-100 text-green-700 px-6 py-4 rounded-xl mb-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-medium text-sm">Message sent successfully! We will get back to you soon.</p>
                </div>
              )}
              {status === "error" && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold">!</span>
                  </div>
                  <p className="font-medium text-sm">Something went wrong. Please try again.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-300 outline-none placeholder:text-gray-300"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-300 outline-none placeholder:text-gray-300"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Project Inquiry"
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-300 outline-none placeholder:text-gray-300"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Your Message
                  </label>
                  <textarea
                    required
                    rows="5"
                    placeholder="Tell us about your project..."
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-300 outline-none placeholder:text-gray-300 resize-none"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {status === "sending" ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-10 w-2 bg-teal-500 rounded-full"></div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Office Information
              </h2>
            </div>

            <div className="grid gap-6">
              {/* Address Card */}
              <div className="group bg-white p-8 rounded-[2rem] shadow-[0_10px_30px_-15px_rgba(0,0,0,0.06)] border border-gray-100 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Primary Office</p>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">Location</h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                      {officeInfo.address || "Loading..."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-6">
                {officeInfo.email?.visible && officeInfo.email?.value && (
                  <div className="group bg-white p-8 rounded-[2rem] shadow-[0_10px_30px_-15px_rgba(0,0,0,0.06)] border border-gray-100 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1">
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 flex-shrink-0">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Digital Inquiry</p>
                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">Email Us</h3>
                        <p className="text-gray-600 text-sm font-medium">{officeInfo.email.value}</p>
                      </div>
                    </div>
                  </div>
                )}

                {(officeInfo.mobile?.visible || officeInfo.landline?.visible) && (
                  <div className="group bg-white p-8 rounded-[2rem] shadow-[0_10px_30px_-15px_rgba(0,0,0,0.06)] border border-gray-100 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1">
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 flex-shrink-0">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Voice Support</p>
                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">Call Us</h3>
                        <div className="space-y-1">
                          {officeInfo.mobile?.visible && officeInfo.mobile?.value && (
                            <p className="text-gray-600 text-sm font-medium">{officeInfo.mobile.value}</p>
                          )}
                          {officeInfo.landline?.visible && officeInfo.landline?.value && (
                            <p className="text-gray-600 text-sm font-medium">{officeInfo.landline.value}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Media Card */}
              {officeInfo.socials && officeInfo.socials.some((s) => s.visible && s.value) && (
                <div className="group bg-white p-8 rounded-[2rem] shadow-[0_10px_30px_-15px_rgba(0,0,0,0.06)] border border-gray-100 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1 h-4 bg-teal-500 rounded-full"></div>
                      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Connect With Us</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {officeInfo.socials
                        .filter((s) => s.visible && s.value)
                        .map((social, index) => (
                          <a
                            key={index}
                            href={
                              social.value.startsWith("http")
                                ? social.value
                                : `https://${social.value}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm ${getSocialColor(social.platform)}`}
                            title={social.platform}
                          >
                            {getSocialIcon(social.platform)}
                          </a>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
