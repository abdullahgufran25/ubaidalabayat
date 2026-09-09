import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import BrandSplash from '../components/BrandSplash';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    whatsappNumber: '923001234567',
    shippingCharges: 200,
    freeShippingThreshold: 5000,
    currency: 'PKR',
    contactEmail: 'info@ubaidalabayat.com',
    contactPhone: '+92 300 1234567',
    contactAddress: 'Karachi, Pakistan',
    facebookUrl: '',
    instagramUrl: '',
    pinterestUrl: '',
    aboutUsText: '',
    footerText: '© 2026 Ubaid Al Abayat. All Rights Reserved.',
    bankName: 'Faysal Bank Limited (FBL)',
    accountTitle: 'UBAID ULLAH',
    accountNumber: '',
    iban: '',
    bankBranch: '',
    bankInstructions: 'Please transfer the exact order amount and share the payment screenshot on WhatsApp with your Order ID for instant dispatch.',
    bankTransferEnabled: true,
    codEnabled: true,
    cardPaymentEnabled: false,
  });
  
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);

  // Fetch all site configurations from database
  const fetchAllData = async () => {
    const startTime = Date.now();
    try {
      // Fetch settings, banners, and categories concurrently from DB
      const [settingsRes, bannersRes, categoriesRes] = await Promise.all([
        axios.get('/api/settings').catch((err) => ({ error: err })),
        axios.get('/api/banners').catch((err) => ({ error: err })),
        axios.get('/api/categories').catch((err) => ({ error: err })),
      ]);

      if (settingsRes?.data?.success) {
        setSettings(settingsRes.data.data);
      }
      if (bannersRes?.data?.success) {
        setBanners(bannersRes.data.data);
      }
      if (categoriesRes?.data?.success) {
        setCategories(categoriesRes.data.data);
      }

      // Keep aesthetic splash screen visible for at least 700ms so it doesn't jarringly flicker
      const elapsed = Date.now() - startTime;
      const minDisplayTime = 700;
      if (elapsed < minDisplayTime) {
        await new Promise((resolve) => setTimeout(resolve, minDisplayTime - elapsed));
      }
    } catch (err) {
      console.error('Error fetching global configurations:', err.message);
    } finally {
      // Smooth fade out transition
      setSplashFading(true);
      setTimeout(() => {
        setShowSplash(false);
        setLoading(false);
      }, 500);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const refreshBanners = async () => {
    try {
      const res = await axios.get('/api/banners');
      if (res.data.success) {
        setBanners(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const refreshCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStoreSettings = async (formData) => {
    try {
      const res = await axios.put('/api/settings', formData);
      if (res.data.success) {
        setSettings(res.data.data);
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update store settings.',
      };
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        banners,
        categories,
        loading,
        refreshBanners,
        refreshCategories,
        updateStoreSettings,
        reloadAll: fetchAllData,
      }}
    >
      {showSplash && <BrandSplash fading={splashFading} />}
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
