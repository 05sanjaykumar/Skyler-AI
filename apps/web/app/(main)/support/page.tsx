'use client'
import React, { useState } from 'react';
import { ChevronDown, MessageSquare, BookOpen, ChevronUp, Mail } from 'lucide-react';

const faqData = [
  {
    question: "How do I reset my password?",
    answer: "You can reset your password by navigating to the login page and clicking 'Forgot Password'. Follow the instructions sent to your registered email address.",
  },
  {
    question: "Where can I find my invoice history?",
    answer: "Your invoice history is available in your account dashboard under the 'Billing' or 'Invoices' section. You can view, download, and print all past invoices from there.",
  },
  {
    question: "Is there a knowledge base or documentation?",
    answer: "Yes, our comprehensive knowledge base is a great resource. You can find it by clicking the 'Knowledge Base' link on this page or by visiting our main documentation portal.",
  },
  {
    question: "How can I contact the support team directly?",
    answer: "The best way to contact our team is by using the 'Submit a Ticket' form below. For urgent matters, you can find our phone number in the contact details at the bottom of the page.",
  },
  {
    question: "What are your support hours?",
    answer: "Our support team is available from 9 AM to 5 PM EST, Monday through Friday. We strive to respond to all inquiries within 24 business hours.",
  },
];

const App = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [formStatus, setFormStatus] = useState('');

  const toggleFaq = (index:any) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e:any) => {
    e.preventDefault();
    setFormStatus('Submitting...');

    setTimeout(() => {
      setFormStatus('Thank you! Your ticket has been submitted. We will get back to you shortly.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="bg-background font-sans antialiased text-foreground">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <header className="text-center mb-12 lg:mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            How can we help?
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Find answers to common questions or get in touch with our team.
          </p>
        </header>

        {/* Support Options Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          {/* FAQ Card */}
          <div className=" p-8 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 card-foreground text-foreground">
            <div className="flex justify-center items-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mx-auto mb-4">
              <MessageSquare size={24} />
            </div>
            <h2 className="text-xl font-bold text-center ">Frequently Asked Questions</h2>
            <p className="mt-2 text-center text-gray-500">
              Browse our most common questions to find a quick solution.
            </p>
            <div className="mt-6 flex justify-center">
              <a href="#faq" className="text-blue-600 font-medium hover:underline flex items-center">
                View FAQs
                <ChevronDown size={16} className="ml-1" />
              </a>
            </div>
          </div>

          {/* Knowledge Base Card */}
          <div className="card-foreground text-foreground  p-8 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex justify-center items-center h-12 w-12 rounded-full bg-green-100 text-green-600 mx-auto mb-4">
              <BookOpen size={24} />
            </div>
            <h2 className="text-xl font-bold text-center ">Knowledge Base</h2>
            <p className="mt-2 text-center text-gray-500">
              Dive deep into our articles and documentation for detailed guides and tutorials.
            </p>
            <div className="mt-6 flex justify-center">
              <a href="#" className="text-green-600 font-medium hover:underline flex items-center">
                Explore Documentation
                <ChevronDown size={16} className="ml-1" />
              </a>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="max-w-4xl mx-auto py-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">FAQs</h2>
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300">
                <button
                  className="w-full flex justify-between items-center text-left p-6 font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={activeFaq === index}
                >
                  <span>{item.question}</span>
                  {activeFaq === index ? <ChevronUp size={20} className="text-gray-600 transition-transform duration-300" /> : <ChevronDown size={20} className="text-gray-400 transition-transform duration-300" />}
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    activeFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-6 border-t border-gray-200 text-gray-600">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="bg-white rounded-2xl shadow-xl p-8 md:p-12 lg:p-16 max-w-3xl mx-auto my-16">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 text-orange-600 mx-auto mb-6">
            <Mail size={32} />
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Can't find your answer?</h2>
          <p className="text-center text-gray-500 mb-8">
            Submit a support ticket and our team will get back to you as soon as possible.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
              <input
                type="text"
                name="subject"
                id="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                name="message"
                id="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              ></textarea>
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Submit Ticket
              </button>
            </div>
            {formStatus && (
              <p className="mt-4 text-center text-sm font-medium text-gray-600">{formStatus}</p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
};

export default App;
