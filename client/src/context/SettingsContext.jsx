import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

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
  });
  
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all site configurations
  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch settings
      const settingsRes = await axios.get('/api/settings');
      if (settingsRes.data.success) {
        setSettings(settingsRes.data.data);
      }

      // Fetch banners
      const bannersRes = await axios.get('/api/banners');
      if (bannersRes.data.success) {
        setBanners(bannersRes.data.data);
      }

      // Fetch categories
      const categoriesRes = await axios.get('/api/categories');
      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data);
      }

    } catch (err) {
      console.error('Error fetching global configurations:', err.message);
    } finally {
      setLoading(false);
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
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
