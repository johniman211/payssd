import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase, getCurrentUser, getMerchantProfile, getAdminProfile } from '../supabase/supabaseClient';
import { publishNotification } from '@/services/notifications';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        loadUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setUserType(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        
        try {
          const adminProfile = await getAdminProfile();
          if (adminProfile) {
            setProfile(adminProfile);
            setUserType('admin');
            setLoading(false);
            return;
          }
        } catch (error) {
          // Not an admin
        }
        
        try {
          const merchantProfile = await getMerchantProfile();
          if (merchantProfile) {
            setProfile(merchantProfile);
            setUserType('merchant');
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    await loadUser();
    return data;
  };

  const signUp = async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    
    if (data.user) {
      const { error: profileError } = await supabase
        .from('merchants')
        .insert([{
          user_id: data.user.id,
          email: email,
          account_type: userData.accountType || 'personal',
          first_name: userData.firstName || '',
          last_name: userData.lastName || '',
          phone: userData.phone || '',
        }]);
      
      if (profileError) throw profileError;
      
      const { data: merchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('user_id', data.user.id)
        .single();
      
      if (merchant) {
        await supabase.rpc('generate_api_keys', {
          p_merchant_id: merchant.id,
          p_key_type: 'sandbox'
        });

        try {
          await publishNotification('merchant_signup', {
            merchant_id: merchant.id,
            payload: {
              merchant_name: userData.firstName ? `${userData.firstName} ${userData.lastName || ''}` : email
            }
          })
        } catch {}
      }
    }
    
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
    setUserType(null);
  };

  const updateProfile = async (updates) => {
    if (!profile) throw new Error('No profile loaded');
    
    const table = userType === 'admin' ? 'admins' : 'merchants';
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', profile.id)
      .select()
      .single();
    
    if (error) throw error;
    setProfile(data);
    return data;
  };

  const value = {
    user,
    profile,
    userType,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


