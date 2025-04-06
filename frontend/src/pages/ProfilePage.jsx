import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { ArrowLeft, Calendar, Camera, Instagram, Linkedin, Mail, Phone, Save, Twitter, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();

  // Form state for profile fields
  const [formData, setFormData] = useState({
    bio: authUser?.bio || "",
    birthday: authUser?.birthday ? new Date(authUser.birthday).toISOString().split('T')[0] : "",
    phone: authUser?.phone || "",
    socialLinks: {
      twitter: authUser?.socialLinks?.twitter || "",
      instagram: authUser?.socialLinks?.instagram || "",
      linkedin: authUser?.socialLinks?.linkedin || "",
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      // Handle nested fields (socialLinks)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
    };
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        ...(selectedImg && { profilePic: selectedImg }),
        bio: formData.bio,
        birthday: formData.birthday || null,
        phone: formData.phone,
        socialLinks: formData.socialLinks
      });
      toast.success("Profile updated successfully");
      navigate('/');
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen pt-20 pb-10 bg-base-100">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-200 rounded-xl p-6 space-y-8 shadow-md">
          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              className="btn btn-sm btn-ghost gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <h1 className="text-2xl font-semibold text-center">Profile</h1>

            <div className="w-[72px]"></div> {/* Empty div for flex alignment */}
          </div>

          <p className="text-center text-base-content/70">Manage your profile information</p>

          {/* Avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 border-base-300 shadow-md"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0
                  bg-primary hover:scale-105
                  p-2 rounded-full cursor-pointer
                  transition-all duration-200 shadow-md
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-primary-content" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-base-content/70">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium border-b pb-2">Basic Information</h2>

            <div className="space-y-1.5">
              <div className="text-sm text-base-content/70 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-100 rounded-lg border border-base-300">{authUser?.fullName}</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-base-content/70 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-100 rounded-lg border border-base-300">{authUser?.email}</p>
            </div>

            {/* Bio field */}
            <div className="space-y-1.5">
              <div className="text-sm text-base-content/70 flex items-center gap-2">
                <User className="w-4 h-4" />
                Bio (optional)
              </div>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="textarea textarea-bordered w-full bg-base-100"
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium border-b pb-2">Contact Information</h2>

            {/* Birthday field */}
            <div className="space-y-1.5">
              <div className="text-sm text-base-content/70 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Birthday (optional)
              </div>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                className="input input-bordered w-full bg-base-100"
              />
            </div>

            {/* Phone field */}
            <div className="space-y-1.5">
              <div className="text-sm text-base-content/70 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number (optional)
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input input-bordered w-full bg-base-100"
                placeholder="+1 (123) 456-7890"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium border-b pb-2">Social Links (optional)</h2>

            {/* Twitter field */}
            <div className="space-y-1.5">
              <div className="text-sm text-base-content/70 flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                Twitter
              </div>
              <input
                type="url"
                name="socialLinks.twitter"
                value={formData.socialLinks.twitter}
                onChange={handleChange}
                className="input input-bordered w-full bg-base-100"
                placeholder="https://twitter.com/username"
              />
            </div>

            {/* Instagram field */}
            <div className="space-y-1.5">
              <div className="text-sm text-base-content/70 flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                Instagram
              </div>
              <input
                type="url"
                name="socialLinks.instagram"
                value={formData.socialLinks.instagram}
                onChange={handleChange}
                className="input input-bordered w-full bg-base-100"
                placeholder="https://instagram.com/username"
              />
            </div>

            {/* LinkedIn field */}
            <div className="space-y-1.5">
              <div className="text-sm text-base-content/70 flex items-center gap-2">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </div>
              <input
                type="url"
                name="socialLinks.linkedin"
                value={formData.socialLinks.linkedin}
                onChange={handleChange}
                className="input input-bordered w-full bg-base-100"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-base-100 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-base-300">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500 font-medium">Active</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <button
              onClick={handleBack}
              className="btn btn-outline"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="btn btn-primary gap-2"
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
