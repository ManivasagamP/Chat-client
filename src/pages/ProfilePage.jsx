import React,{useContext, useState} from 'react'
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';
import { compressImage, validateImageFile, formatFileSize } from '../utils/imageUtils';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {

  const { authUser, updateProfile } = useContext(AuthContext);

  const [selectedImage, setSelectedImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageError, setImageError] = useState('');
  const navigate = useNavigate();
  const [name, setName] = useState(authUser?.fullName);
  const [bio, setBio] = useState(authUser?.bio);

  // Handle image selection and compression
  const handleImageSelect = async (file) => {
    if (!file) {
      setSelectedImage(null);
      setCompressedImage(null);
      setImageError('');
      return;
    }

    // Validate the image file
    const validation = validateImageFile(file, 500); // 500KB max
    if (!validation.valid) {
      setImageError(validation.error);
      toast.error(validation.error);
      return;
    }

    setImageError('');
    setIsProcessing(true);
    setSelectedImage(file);

    try {
      // Compress the image
      const compressedBase64 = await compressImage(file, 400, 400, 0.8, 200); // 200KB max
      setCompressedImage(compressedBase64);
      
      const originalSize = formatFileSize(file.size);
      const compressedSize = formatFileSize(compressedBase64.length * 0.75);
      
      toast.success(`Image compressed: ${originalSize} → ${compressedSize}`);
    } catch (error) {
      setImageError(error.message);
      toast.error(error.message);
      setSelectedImage(null);
      setCompressedImage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

    if(!selectedImage || !compressedImage){
      await updateProfile({ fullName: name, bio });
      navigate("/")
      return;
    }

    try {
      // Use the compressed image instead of the original
      await updateProfile({ fullName: name, bio, profilePic: compressedImage });
      navigate("/")
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
      console.error("Profile update error:", error);
    }
  }

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-1 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-5 p-10 flex-1'>
          <h3 className='text-lg'>Profile Details</h3>
          <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
            <input 
              onChange={(e) => handleImageSelect(e.target.files[0])} 
              type="file" 
              id='avatar' 
              accept='.png, .jpg, .jpeg, .webp' 
              hidden
              disabled={isProcessing}
            />
            <img 
              src={selectedImage ? URL.createObjectURL(selectedImage) : assets.avatar_icon} 
              alt="" 
              className={`w-12 h-12 ${selectedImage && "rounded-full"}`} 
            />
            <div className="flex flex-col">
              <span className="text-sm">
                {isProcessing ? 'Processing...' : 'Upload profile image'}
              </span>
              {selectedImage && !isProcessing && (
                <span className="text-xs text-gray-400">
                  {formatFileSize(selectedImage.size)}
                </span>
              )}
            </div>
          </label>
          {imageError && (
            <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">
              {imageError}
            </div>
          )}
          <input onChange={(e) => setName(e.target.value)} value={name} type="text" required placeholder='Your name' className='p-2 border border-gray-500 rounded-md focus:outline-none focus-ring-2 focus:ring-violet-500'/>
          <textarea onChange={(e) => setBio(e.target.value)} value={bio} placeholder='Write profile bio' className='p-2 border border-gray-500 rounded-md focus:outline-none focus-ring-2 focus:ring-violet-500' rows={4} required></textarea>
          <button 
            type='submit' 
            disabled={isProcessing}
            className={`bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full test-lg cursor-pointer ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-500 hover:to-violet-700'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Save'}
          </button>
        </form>
        <img src={authUser?.profilePic ||assets.logo_icon} className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${selectedImage && "rounded-full"}`} alt="" />
      </div>
    </div>
  )
}

export default ProfilePage