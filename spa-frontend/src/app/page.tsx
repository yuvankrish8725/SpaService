"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Star, 
  HeartHandshake, 
  ShieldCheck, 
  ChevronRight,
  Phone,
  Mail,
  MapPin
} from "lucide-react";

interface SpaCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  duration: string;
  price: number;
  description: string;
  popular?: boolean;
}

const CATEGORIES: SpaCategory[] = [
  { id: "massage", name: "Massage Therapies", description: "Deep relaxation & muscle relief", icon: "💆" },
  { id: "facial", name: "Facials & Skin Care", description: "Radiant, nourishing skin treatments", icon: "✨" },
  { id: "body", name: "Body Scrubs & Wraps", description: "Exfoliation and full body detox", icon: "🌿" },
  { id: "hydro", name: "Hydrotherapy & Sauna", description: "Thermal baths & soothing steam", icon: "🧖" },
];

const SERVICES: ServiceItem[] = [
  {
    id: "s1",
    name: "Swedish Aromatherapy Massage",
    category: "massage",
    duration: "60 mins",
    price: 65,
    description: "Gentle, flowing strokes combined with organic essential oils to relieve everyday stress.",
    popular: true
  },
  {
    id: "s2",
    name: "Deep Tissue Muscle Recovery",
    category: "massage",
    duration: "90 mins",
    price: 95,
    description: "Targeted firm pressure targeting deep muscle layers and chronic tension points.",
    popular: true
  },
  {
    id: "s3",
    name: "Hydra-Glow Signature Facial",
    category: "facial",
    duration: "60 mins",
    price: 75,
    description: "Deep cleansing, gentle chemical exfoliation, and intense hyaluronic hydration.",
    popular: true
  },
  {
    id: "s4",
    name: "Organic Herbal Body Polish",
    category: "body",
    duration: "45 mins",
    price: 55,
    description: "Dead sea salt scrub infused with botanical extracts leaving skin silky smooth."
  },
  {
    id: "s5",
    name: "Detox Thermal Mud Wrap",
    category: "body",
    duration: "60 mins",
    price: 80,
    description: "Mineral-rich volcanic mud wrap to eliminate toxins and nourish dry skin."
  },
  {
    id: "s6",
    name: "Hot Stone Therapy",
    category: "massage",
    duration: "75 mins",
    price: 90,
    description: "Heated volcanic stones placed along meridian lines to ease muscle stiffness."
  }
];

const TIME_SLOTS = [
  "09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM", "03:30 PM", "05:00 PM", "06:30 PM"
];

export default function SpaHomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [bookingService, setBookingService] = useState<ServiceItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("2026-08-20");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", notes: "" });

  const filteredServices = selectedCategory === "all"
    ? SERVICES
    : SERVICES.filter(s => s.category === selectedCategory);

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime) {
      alert("Please select a time slot");
      return;
    }
    setBookingSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 font-sans">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-serif text-xl shadow-sm">
              🌿
            </div>
            <div>
              <span className="text-2xl font-serif tracking-tight font-semibold text-stone-900">Serene Haven</span>
              <span className="block text-xs uppercase tracking-widest text-emerald-800 font-medium">Spa & Wellness</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <a href="#services" className="hover:text-emerald-700 transition">Services</a>
            <a href="#about" className="hover:text-emerald-700 transition">About Us</a>
            <a href="#why-us" className="hover:text-emerald-700 transition">Experience</a>
            <a href="#contact" className="hover:text-emerald-700 transition">Contact</a>
          </nav>

          <button 
            onClick={() => {
              setBookingService(SERVICES[0]);
              setBookingSuccess(false);
            }}
            className="px-5 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-medium transition shadow-sm hover:shadow"
          >
            Book Appointment
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Rejuvenate Mind, Body & Soul
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-stone-900 leading-tight">
              Holistic Luxury <br />
              <span className="italic text-emerald-800">Spa Sanctuary</span>
            </h1>
            <p className="text-lg text-stone-600 max-w-lg leading-relaxed">
              Step into an oasis of calm. Our certified holistic therapists blend ancient healing rituals with modern wellness care for an unforgettable retreat.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="#services"
                className="px-7 py-3.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-base font-medium shadow-md transition inline-flex items-center gap-2"
              >
                Explore Treatments
                <ChevronRight className="w-4 h-4" />
              </a>
              <a
                href="#about"
                className="px-7 py-3.5 rounded-full bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 text-base font-medium transition"
              >
                Our Philosophy
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-stone-200">
              <div>
                <p className="text-2xl font-serif font-bold text-emerald-900">100%</p>
                <p className="text-xs text-stone-500 font-medium">Organic Botanical Oils</p>
              </div>
              <div>
                <p className="text-2xl font-serif font-bold text-emerald-900">4.9 ★</p>
                <p className="text-xs text-stone-500 font-medium">Over 2,500 Reviews</p>
              </div>
              <div>
                <p className="text-2xl font-serif font-bold text-emerald-900">15+</p>
                <p className="text-xs text-stone-500 font-medium">Expert Therapists</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl bg-gradient-to-tr from-emerald-900/10 to-stone-200/50 p-6 border border-stone-200 shadow-xl flex flex-col justify-end relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-15"></div>
              <div className="relative z-10 bg-white/95 backdrop-blur rounded-2xl p-6 shadow-lg border border-stone-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-emerald-800 font-bold">Today's Special Retreat</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">Save 20%</span>
                </div>
                <h3 className="font-serif text-xl font-semibold text-stone-900">Full Bloom Aromatherapy & Facial</h3>
                <p className="text-sm text-stone-600">Includes 60-minute hot oil body massage + 30-minute rose quartz revitalizing facial.</p>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-2xl font-serif font-bold text-stone-900">$120</span>
                    <span className="text-sm text-stone-400 line-through ml-2">$150</span>
                  </div>
                  <button 
                    onClick={() => {
                      setBookingService(SERVICES[0]);
                      setBookingSuccess(false);
                    }}
                    className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-semibold hover:bg-emerald-900 transition"
                  >
                    Quick Reserve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories & Services Catalog */}
      <section id="services" className="py-20 bg-white border-y border-stone-200 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold">Treatment Menu</span>
            <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 font-normal">Indulge in Tailored Wellness</h2>
            <p className="text-stone-600 text-sm">Every treatment is personalized using therapeutic organic herbs and tailored pressure techniques.</p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-5 py-2.5 rounded-full text-xs font-medium transition ${
                selectedCategory === "all"
                  ? "bg-emerald-800 text-white shadow"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              All Treatments
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? "bg-emerald-800 text-white shadow"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map(service => (
              <div 
                key={service.id}
                className="rounded-2xl border border-stone-200 p-6 bg-white hover:border-emerald-700/40 hover:shadow-lg transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-serif text-xl font-semibold text-stone-900 group-hover:text-emerald-800 transition">
                      {service.name}
                    </h3>
                    {service.popular && (
                      <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-stone-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-stone-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      {service.duration}
                    </span>
                    <span className="text-xl font-serif font-bold text-stone-900">
                      ${service.price}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setBookingService(service);
                      setBookingSuccess(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-emerald-800 text-white text-xs font-semibold transition"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {bookingService && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setBookingService(null)}
              className="absolute top-6 right-6 text-stone-400 hover:text-stone-700 text-xl font-bold"
            >
              ✕
            </button>

            {!bookingSuccess ? (
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-800 font-bold">Schedule Appointment</span>
                <h3 className="text-2xl font-serif font-semibold text-stone-900 mt-1 mb-2">
                  {bookingService.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-stone-600 mb-6 pb-4 border-b border-stone-100">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-emerald-700" /> {bookingService.duration}</span>
                  <span className="font-bold text-emerald-900 text-base">${bookingService.price}</span>
                </div>

                <form onSubmit={handleBookSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Select Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-2">Select Time Slot</label>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2 text-xs font-medium rounded-lg border transition ${
                            selectedTime === slot
                              ? "bg-emerald-800 text-white border-emerald-800"
                              : "border-stone-200 hover:border-stone-400 text-stone-700"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="Jane Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-700"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        placeholder="+1 555-0199"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-700"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-700"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-3.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm transition shadow-md"
                  >
                    Confirm Booking (${bookingService.price})
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-900">Appointment Reserved!</h3>
                <p className="text-sm text-stone-600">
                  Thank you, <span className="font-semibold text-stone-900">{formData.name}</span>. We have scheduled your <span className="font-semibold">{bookingService.name}</span> on <span className="font-semibold">{selectedDate}</span> at <span className="font-semibold">{selectedTime}</span>.
                </p>
                <div className="bg-stone-50 rounded-2xl p-4 text-xs text-stone-500 text-left space-y-1">
                  <p>• Confirmation email sent to <span className="font-medium text-stone-800">{formData.email}</span></p>
                  <p>• Payment can be settled on-site at the reception desk.</p>
                </div>
                <button
                  onClick={() => setBookingService(null)}
                  className="w-full py-3 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium transition"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Why Choose Serene Haven */}
      <section id="why-us" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold">The Serene Standard</span>
          <h2 className="text-3xl sm:text-4xl font-serif text-stone-900">Why Guests Choose Us</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-stone-900">Certified Holistic Therapists</h3>
            <p className="text-sm text-stone-600">Every practitioner has over 500+ clinical hours and international certifications in therapeutic massage.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-stone-900">100% Organic Ingredients</h3>
            <p className="text-sm text-stone-600">Pure, cold-pressed essential oils, Himalayan crystal salts, and cruelty-free organic botanical skincare.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-stone-900">Private Sanctuary Suites</h3>
            <p className="text-sm text-stone-600">Acoustically isolated suites equipped with heated therapy tables, chromotherapy, and rain showers.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-stone-900 text-stone-300 py-16 px-6 border-t border-stone-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌿</span>
              <span className="text-2xl font-serif text-white tracking-tight">Serene Haven Spa</span>
            </div>
            <p className="text-sm text-stone-400 max-w-sm">
              Your neighborhood sanctuary for mindful relaxation, deep tissue restoration, and radiant skin wellness.
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Hours</h4>
            <p className="text-stone-400">Monday - Friday: 9am - 8pm</p>
            <p className="text-stone-400">Saturday - Sunday: 8am - 9pm</p>
          </div>

          <div className="space-y-3 text-sm">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Contact</h4>
            <p className="text-stone-400 flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-500" /> +1 (555) 234-5678</p>
            <p className="text-stone-400 flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-500" /> hello@serenehaven.com</p>
            <p className="text-stone-400 flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" /> 124 Lotus Avenue, Suite 400</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-stone-800 flex flex-col sm:flex-row justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 Serene Haven Spa Services. All rights reserved.</p>
          <p>Connected to Spring Boot 3 & Aiven Cloud PostgreSQL</p>
        </div>
      </footer>
    </div>
  );
}
