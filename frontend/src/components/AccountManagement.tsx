import { useState, useEffect } from 'react'; // useEffect eklendi
import { User, Mail, Phone, MapPin, Edit2, Save, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner'; // Bildirimler için (eğer kullanıyorsanız)

interface AccountManagementProps {
  username: string;
  userRole: 'user' | 'librarian' | 'admin';
  penaltyCount: number;
  email: string;
  phone: string;
  address: string;
  onUpdateProfile?: (email: string, phone: string, address: string) => void;
}

export function AccountManagement({
  username,
  userRole,
  penaltyCount,
  email,
  phone,
  address,
  onUpdateProfile
}: AccountManagementProps) {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    fullName: username,
    email: email,
    phone: phone,
    address: address,
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    if (onUpdateProfile) {
      onUpdateProfile(editedProfile.email, editedProfile.phone, editedProfile.address);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">

      {/* Profil Bilgileri Kartı */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account Management</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {/* ... Mevcut profil detayları formu aynen kalacak ... */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white">{profile.fullName}</h3>
            <p className="text-gray-600 dark:text-gray-300 capitalize">{userRole} Account</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                Active
              </span>
              {penaltyCount > 0 && (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${penaltyCount >= 3 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  }`}>
                  <AlertTriangle className="w-4 h-4" />
                  {penaltyCount} Penalties
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form Grid Alanı */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4" />
              <span>Full Name</span>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.fullName}
                onChange={(e) => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            ) : (
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg">{profile.fullName}</p>
            )}
          </div>
          {/* Email - Sadece okunur */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </label>
            <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg">{profile.email}</p>
          </div>
          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="w-4 h-4" />
              <span>Phone</span>
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={editedProfile.phone}
                onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            ) : (
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg">{profile.phone}</p>
            )}
          </div>
          {/* Address */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="w-4 h-4" />
              <span>Address</span>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.address}
                onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            ) : (
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg">{profile.address}</p>
            )}
          </div>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-gray-900 dark:text-white mb-4">Account Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
            <p className="text-gray-600 dark:text-gray-300 mb-1">Books Borrowed</p>
            <p className="text-purple-600 dark:text-purple-400 font-bold">24 Books</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
            <p className="text-gray-600 dark:text-gray-300 mb-1">Active Loans</p>
            <p className="text-blue-600 dark:text-blue-400 font-bold">3 Books</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
            <p className="text-gray-600 dark:text-gray-300 mb-1">Member Since</p>
            <p className="text-green-600 dark:text-green-400 font-bold">Jan 2024</p>
          </div>
          <div className={`rounded-lg p-4 ${penaltyCount >= 3 ? 'bg-red-50 dark:bg-red-900/30' : penaltyCount > 0 ? 'bg-yellow-50 dark:bg-yellow-900/30' : 'bg-gray-50 dark:bg-gray-700'
            }`}>
            <p className="text-gray-600 dark:text-gray-300 mb-1">Penalty Points</p>
            <p className={`font-bold ${penaltyCount >= 3 ? 'text-red-600 dark:text-red-400' : penaltyCount > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'
              }`}>
              {penaltyCount} / 4
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}