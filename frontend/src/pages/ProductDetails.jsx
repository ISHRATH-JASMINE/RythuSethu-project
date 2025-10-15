import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { toast } from 'react-toastify'

const ProductDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/marketplace/${id}`)
      setProduct(data)
    } catch (error) {
      toast.error('Product not found')
      navigate('/marketplace')
    } finally {
      setLoading(false)
    }
  }

  const handleContactSeller = () => {
    if (!user) {
      toast.info('Please login to contact seller')
      navigate('/login')
      return
    }
    toast.info(`Contact: ${product.seller.phone || product.seller.email}`)
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            <span className="text-9xl">🌾</span>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
            <div className="space-y-4">
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2 font-medium capitalize">{product.category}</span>
              </div>
              <div>
                <span className="text-gray-600">Price:</span>
                <span className="ml-2 font-bold text-2xl text-primary">
                  ₹{product.price}/{product.unit}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Available Quantity:</span>
                <span className="ml-2 font-medium">{product.quantity} {product.unit}</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className={`ml-2 font-medium capitalize ${
                  product.status === 'available' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.status}
                </span>
              </div>
              {product.description && (
                <div>
                  <span className="text-gray-600">Description:</span>
                  <p className="mt-2 text-gray-700">{product.description}</p>
                </div>
              )}
              <div>
                <span className="text-gray-600">Location:</span>
                <p className="mt-1 text-gray-700">
                  📍 {product.location?.village}, {product.location?.district}, {product.location?.state}
                </p>
              </div>
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-2">Seller Information</h3>
                <p className="text-gray-700">Name: {product.seller.name}</p>
                {product.seller.phone && (
                  <p className="text-gray-700">Phone: {product.seller.phone}</p>
                )}
              </div>
              <button
                onClick={handleContactSeller}
                className="w-full bg-primary text-white py-3 px-6 rounded-md hover:bg-secondary transition font-semibold"
              >
                Contact Seller
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
