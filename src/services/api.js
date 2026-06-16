import apiClient from './apiClient';

// Auth endpoints
export async function sendOTP(phoneNumber) {
  const res = await apiClient.post('/auth/send-otp', { phone_number: phoneNumber });
  return res.data;
}

export async function verifyOTP(phoneNumber, otpCode) {
  const res = await apiClient.post('/auth/verify-otp', {
    phone_number: phoneNumber,
    otp_code: otpCode,
  });
  // Save token for future automatic injection via request interceptors
  if (res.data?.access_token) {
    localStorage.setItem('digipay_token', res.data.access_token);
  }
  return res.data;
}

// User Profile update
export async function updateProfile(fullName, email, role) {
  const res = await apiClient.post('/user/update-profile', {
    full_name: fullName,
    email: email,
    role: role
  });
  return res.data;
}

// Customer details
export async function fetchWalletAnalytics() {
  const res = await apiClient.get('/wallet/analytics');
  return res.data;
}

// Merchant details
export async function fetchMerchantDashboard() {
  const res = await apiClient.get('/merchant/dashboard');
  return res.data;
}

// Admin stats
export async function fetchAdminDashboard() {
  const res = await apiClient.get('/admin/dashboard');
  return res.data;
}

export async function fetchAdminTransactions(params = {}) {
  const res = await apiClient.get('/admin/transactions', { params });
  return res.data;
}

export async function fetchAdminMerchants() {
  const res = await apiClient.get('/admin/merchants');
  return res.data;
}

export async function toggleMerchantStatus(id, isActive) {
  const res = await apiClient.put(`/admin/merchants/${id}/status`, null, {
    params: { is_active: isActive }
  });
  return res.data;
}

export async function deleteMerchant(id) {
  const res = await apiClient.delete(`/admin/merchants/${id}`);
  return res.data;
}

export async function fetchAdminAnalytics() {
  const res = await apiClient.get('/admin/analytics');
  return res.data;
}

export async function fetchUserProfile() {
  const res = await apiClient.get('/user/me');
  return res.data;
}
