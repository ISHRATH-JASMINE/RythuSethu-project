import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const Footer = () => {
  const { t } = useTranslation()
  
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              🌾 RythuSetu
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Bridge the gap between farmers, buyers, and experts
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-green-400">Features</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/crop-advisor" className="hover:text-green-400 transition-colors">
                  Crop Advisor
                </Link>
              </li>
              <li>
                <Link to="/crop-prices" className="hover:text-green-400 transition-colors">
                  Crop Prices
                </Link>
              </li>
              <li>
                <Link to="/storage-finder" className="hover:text-green-400 transition-colors">
                  Cold Storage
                </Link>
              </li>
              <li>
                <Link to="/forum" className="hover:text-green-400 transition-colors">
                  Community Forum
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-green-400">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/schemes" className="hover:text-green-400 transition-colors">
                  Govt. Schemes
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-green-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-green-400 transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-green-400 transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-green-400">Follow Us</h4>
            <div className="flex space-x-4 mb-6">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-500 transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook size={24} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter size={24} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram size={24} />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="YouTube"
              >
                <FaYoutube size={24} />
              </a>
            </div>
            <p className="text-gray-400 text-sm">
              Contact: support@rythusetu.com
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>© 2025 RythuSetu. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-green-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-green-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-green-400 transition-colors">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
