import React from 'react';

const PolicyPage = ({ type }) => {
  let title = 'Privacy Policy';
  let content = null;

  if (type === 'privacy') {
    title = 'Privacy Policy';
    content = (
      <div className="space-y-6 text-xs text-luxury-textGray leading-relaxed">
        <p>At <strong>Ubaid Al Abayat</strong>, we are committed to protecting your privacy. This policy outlines how we collect, store, and utilize your personal information when you visit our website, register accounts, or place orders.</p>
        
        <h3 className="font-serif font-bold text-sm text-luxury-dark uppercase tracking-wider">1. Information We Collect</h3>
        <p>When you checkout or register, we collect billing details including your Full Name, Email address, Phone number, and complete shipping address. We also record order historical items to provide customer services.</p>

        <h3 className="font-serif font-bold text-sm text-luxury-dark uppercase tracking-wider">2. Payment Security</h3>
        <p>For Cash on Delivery (COD) transactions, billing details are shared only with our logistics courier partners (e.g. Leopard / TCS). Bank transfer records are stored secure and never shared with third party networks.</p>

        <h3 className="font-serif font-bold text-sm text-luxury-dark uppercase tracking-wider">3. Cookie Policies</h3>
        <p>Our website utilizes standard session cookies to remember cart items locally and keep you authenticated in your customer dashboard portal. Disabling cookies will affect checkout operations.</p>
      </div>
    );
  } else if (type === 'terms') {
    title = 'Terms & Conditions';
    content = (
      <div className="space-y-6 text-xs text-luxury-textGray leading-relaxed">
        <p>Welcome to <strong>Ubaid Al Abayat</strong>. By accessing our shop and placing orders, you agree to comply with the terms and conditions outlined below.</p>
        
        <h3 className="font-serif font-bold text-sm text-luxury-dark uppercase tracking-wider">1. Orders & Pricing</h3>
        <p>All product prices are displayed in PKR and are subject to change. We reserve the right to cancel or modify orders in case of stock inconsistencies, verification failure, or price errors.</p>

        <h3 className="font-serif font-bold text-sm text-luxury-dark uppercase tracking-wider">2. Verification Calls</h3>
        <p>To reduce fraudulent COD orders, our logistics team performs telephone or SMS confirmations. Orders with unverified or unreachable numbers will be cancelled automatically after 3 business days.</p>

        <h3 className="font-serif font-bold text-sm text-luxury-dark uppercase tracking-wider">3. Copyrights & Designs</h3>
        <p>All product imagery, custom copy descriptions, embroidery motifs, and website assets are property of Ubaid Al Abayat. Any unauthorized copy or reproduction is subject to legal claim.</p>
      </div>
    );
  } else if (type === 'returns') {
    title = 'Exchange & Returns';
    content = (
      <div className="space-y-6 text-xs text-luxury-textGray leading-relaxed">
        <p>At <strong>Ubaid Al Abayat</strong>, we want you to feel completely satisfied with your purchase. Our returns policies are structured to support sizing checks and fabric exchanges.</p>
        
        <h3 className="font-serif font-bold text-sm text-luxury-dark uppercase tracking-wider">1. 7-Day Exchange Window</h3>
        <p>If you receive an Abaya or Hijab that does not fit your length or sizing, you can request an exchange or return within <strong>7 days</strong> of order delivery. The article must be unworn, unwashed, and carry all original tags.</p>

        <h3 className="font-serif font-bold text-sm text-luxury-dark uppercase tracking-wider">2. Non-Refundable/Custom Articles</h3>
        <p>Please note that any customized lengths or specially tailored orders cannot be refunded or exchanged unless they arrive damaged or contain manufacturing defects.</p>

        <h3 className="font-serif font-bold text-sm text-luxury-dark uppercase tracking-wider">3. How to Request Return</h3>
        <p>Please message our styling support team over WhatsApp at +92 300 1234567 along with your order number. Once approved, you will ship the return package back to our boutique hub for processing.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-bold uppercase tracking-wider">{title}</h1>
        <div className="h-0.5 w-12 bg-luxury-gold mx-auto"></div>
      </div>
      <div className="bg-white border border-luxury-gray p-8 rounded shadow-sm">
        {content}
      </div>
    </div>
  );
};

export default PolicyPage;
