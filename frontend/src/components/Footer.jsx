import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">🌾 RythuSetu</h3>
            <p className="text-gray-300">
              Empowering farmers with technology, insights, and real-time updates.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/marketplace" className="hover:text-primary">Marketplace</a></li>
              <li><a href="/schemes" className="hover:text-primary">Government Schemes</a></li>
              <li><a href="/forum" className="hover:text-primary">Community Forum</a></li>
              <li><a href="/weather" className="hover:text-primary">Weather Updates</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-primary"><FaFacebook size={24} /></a>
              <a href="#" className="text-gray-300 hover:text-primary"><FaTwitter size={24} /></a>
              <a href="#" className="text-gray-300 hover:text-primary"><FaInstagram size={24} /></a>
              <a href="#" className="text-gray-300 hover:text-primary"><FaYoutube size={24} /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} RythuSetu. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
