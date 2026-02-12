import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, CreditCard, Shield, Zap, ArrowRight, CheckCircle, Star } from 'lucide-react';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Discovery",
      description: "Gemini AI understands your needs and recommends the perfect services instantly"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Book appointments that fit your calendar with intelligent availability matching"
    },
    {
      icon: CreditCard,
      title: "Instant Payments",
      description: "Secure, seamless checkout with multiple payment options in seconds"
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description: "End-to-end encryption and verified service providers for peace of mind"
    }
  ];

  const stats = [
    { value: "50K+", label: "Active Users" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "10K+", label: "Services Listed" },
    { value: "<2min", label: "Avg Booking Time" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-emerald-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
            style={{ 
              top: '-10%', 
              right: '-5%',
              transform: `translateY(${scrollY * 0.1}px)`
            }}
          />
          <div 
            className="absolute w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
            style={{ 
              bottom: '-20%', 
              left: '-10%',
              animationDelay: '2s',
              transform: `translateY(${scrollY * -0.1}px)`
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        
          {/* Hero Content */}
          <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-8 border border-green-200">
              <Sparkles className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Powered by Gemini AI</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-green-800 to-emerald-700 bg-clip-text text-transparent">
                Welcome to Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Smart Sales Hub
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
              Seamless service booking powered by Gemini AI — from discovery to payment in seconds
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button className="group px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold text-lg flex items-center gap-2">
                Start Booking Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white text-green-600 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold text-lg border-2 border-green-200 hover:border-green-300">
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {stats.map((stat, idx) => (
                <div 
                  key={idx}
                  className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${600 + idx * 100}ms` }}
                >
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24" id="features">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-green-700 bg-clip-text text-transparent">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600">Powerful features that make service booking effortless</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-green-100"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-white">
              <h3 className="text-3xl font-bold mb-2">Join thousands of happy customers</h3>
              <p className="text-green-100 text-lg">Experience the future of service booking today</p>
            </div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 fill-yellow-300 text-yellow-300" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl p-12 shadow-2xl border border-green-100">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Ready to Transform Your Booking Experience?</h2>
          <p className="text-xl text-gray-600 mb-8">Start using AI-powered service booking in minutes</p>
          <button className="group px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-lg flex items-center gap-2 mx-auto">
            Get Started Free
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">SalesHub</span>
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 SalesHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}