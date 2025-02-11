import { baseUrl } from "../environment/environment";
import instance from "./httpInterceptor";

// Admin Login
export const adminLogin = (data) => {
  return instance.post(`${baseUrl}admin/login`, data);
};



// Add Sub-admin
export const addSubAdmin = (data) => {
  return instance.post(`${baseUrl}admin/sub-admin`, data);
};

// Get All Users
export const getAllUsers = () => {
  return instance.get(`${baseUrl}admin/users`);
};

export const deleteUser = (id) => {
  return instance.delete(`${baseUrl}admin/users/${id}`);
};

export const updateUser= (id, data) => {
  return instance.put(`${baseUrl}admin/users/${id}`, data);
};

// Get All Adverts
export const getAllAdverts = () => {
  return instance.get(`${baseUrl}admin/adverts`);
};

// Add Advert
export const addAdvert = (data) => {
  return instance.post(`${baseUrl}admin/adverts`, data);
};

// Update Advert
export const updateAdvert = (id, data) => {
  return instance.put(`${baseUrl}admin/adverts/${id}`, data);
};

// Delete Advert
export const deleteAdvert = (id) => {
  return instance.delete(`${baseUrl}admin/adverts/${id}`);
};

// Get Advert by ID
export const getAdvertById = (id) => {
  return instance.get(`${baseUrl}admin/adverts/${id}`);
};

// Publish Advert
export const publishAdvert = (id) => {
  return instance.put(`${baseUrl}admin/adverts/${id}/publish`);
};

// Add Accessory Name
export const getAllAccessories= (data) => {
  return instance.get(`${baseUrl}accessories`, data);
};
export const addAccessory= (data) => {
  return instance.post(`${baseUrl}accessories`, data);
};

// Update Accessory Name
export const updateAccessory = (id, data) => {
  return instance.put(`${baseUrl}accessories/${id}`, data);
};

// Delete Accessory Name
export const deleteAccessory = (id) => {
  return instance.delete(`${baseUrl}accessories/${id}`);
};  

// get Breed Name
export const getAllPets = (data) => {
  return instance.get(`${baseUrl}pets`, data);
};
// Add Breed Name
export const addPets = (data) => {
  return instance.post(`${baseUrl}pets`, data);
};

// Update Breed Name
export const updatePets = (id, data) => {
  return instance.put(`${baseUrl}pets/${id}`, data);
};

//get pets by id
export const getPetsById = (id) => {
  return instance.get(`${baseUrl}pets/${id}`);
};

// Delete Breed Name
export const deletePets = (id) => {
  return instance.delete(`${baseUrl}pets/${id}`);
};

export const getAllArticles = () => {
  return instance.get(`${baseUrl}articles`);
};

export const getArticleById = (id) => {
  return instance.get(`${baseUrl}articles/${id}`);
};

export const addArticle = (data) => {
  return instance.post(`${baseUrl}articles`, data);
};

export const updateArticle = (id, data) => {
  return instance.put(`${baseUrl}articles/${id}`, data);
};

export const deleteArticle = (id) => {
  return instance.delete(`${baseUrl}articles/${id}`);
};

// Add these to your api.js file

// Get all messages (admin only)
export const getAllMessages = () => {
  return instance.get(`${baseUrl}messages/admin/all`);
};

// Get conversation for a specific advert
export const getAdvertConversation = (advertId) => {
  return instance.get(`${baseUrl}messages/advert/${advertId}`);
};

// Send a message
export const sendMessage = (data) => {
  return instance.post(`${baseUrl}messages`, data);
};

// Mark message as read
export const markMessageAsRead = (messageId) => {
  return instance.put(`${baseUrl}messages/${messageId}/read`);
};

export const getAllConversations = () => {
  return instance.get(`${baseUrl}admin/conversations`);
};

export const sendAdminMessage = (conversationId, message) => {
  return instance.post(`${baseUrl}admin/messages`, { conversationId, message });
};

// Add these to your existing api.js file
export const getAllCategories = () => {
  return instance.get(`${baseUrl}categories`);
};

export const addCategory = (data) => {
  return instance.post(`${baseUrl}categories`, data);
};

export const updateCategory = (id, data) => {
  return instance.put(`${baseUrl}categories/${id}`, data);
};

export const deleteCategory = (id) => {
  return instance.delete(`${baseUrl}categories/${id}`);
};