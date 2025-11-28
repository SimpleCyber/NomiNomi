"use client";

import { MessageCircle, Mail, HelpCircle, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar />
      <div className="flex flex-col min-h-screen md:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-in-out">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="w-full max-w-[1200px] mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4 py-8">
              <h1 className="text-4xl font-bold text-[var(--foreground)]">How can we help you?</h1>
              <p className="text-[var(--muted)] text-lg max-w-2xl mx-auto">
                Search our knowledge base or contact our support team for assistance with your account, trading, or technical issues.
              </p>
            </div>

            {/* Quick Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border-color)] hover:border-blue-500/50 transition-colors group cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle size={24} />
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Live Chat</h3>
                <p className="text-[var(--muted)] mb-4">Chat with our support team in real-time for immediate assistance.</p>
                <span className="text-blue-500 font-medium text-sm">Start Chat →</span>
              </div>

              <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border-color)] hover:border-purple-500/50 transition-colors group cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4 group-hover:scale-110 transition-transform">
                  <Mail size={24} />
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Email Support</h3>
                <p className="text-[var(--muted)] mb-4">Send us an email and we'll get back to you within 24 hours.</p>
                <span className="text-purple-500 font-medium text-sm">Send Email →</span>
              </div>

              <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border-color)] hover:border-green-500/50 transition-colors group cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 mb-4 group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Documentation</h3>
                <p className="text-[var(--muted)] mb-4">Browse our detailed guides and tutorials to learn more.</p>
                <span className="text-green-500 font-medium text-sm">View Docs →</span>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] p-8">
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
                <HelpCircle className="text-[var(--muted)]" />
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-4">
                {[
                  { q: "How do I create an account?", a: "Click the 'Sign Up' button in the top right corner and follow the instructions to verify your email and identity." },
                  { q: "What are the trading fees?", a: "Our standard trading fee is 0.1% for both makers and takers. VIP users enjoy lower rates based on volume." },
                  { q: "Is my fund secure?", a: "Yes, we use industry-leading security measures including cold storage and multi-signature wallets to protect your assets." },
                  { q: "How can I deposit funds?", a: "Go to your Wallet page, select 'Deposit', and choose your preferred cryptocurrency or fiat payment method." }
                ].map((faq, idx) => (
                  <div key={idx} className="border-b border-[var(--border-color)] last:border-none pb-4 last:pb-0">
                    <h3 className="font-medium text-[var(--foreground)] mb-2">{faq.q}</h3>
                    <p className="text-sm text-[var(--muted)]">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] p-8">
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Send us a message</h2>
              <form className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]">Name</label>
                    <input type="text" className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors" placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]">Email</label>
                    <input type="email" className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors" placeholder="your@email.com" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">Subject</label>
                  <input type="text" className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors" placeholder="How can we help?" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">Message</label>
                  <textarea className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-[var(--foreground)] h-32 resize-none focus:outline-none focus:border-blue-500 transition-colors" placeholder="Describe your issue..."></textarea>
                </div>

                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
