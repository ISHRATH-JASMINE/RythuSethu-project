import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { FaPlus, FaSearch, FaThumbtack, FaTrash } from 'react-icons/fa'
import { toast } from 'react-toastify'

const getRoleBadge = (role) => {
  switch (role) {
    case 'farmer':
      return { icon: '🧑‍🌾', label: 'Farmer', color: 'bg-green-100 text-green-700' }
    case 'dealer':
      return { icon: '💼', label: 'Dealer', color: 'bg-blue-100 text-blue-700' }
    case 'admin':
      return { icon: '🛡️', label: 'Admin', color: 'bg-purple-100 text-purple-700' }
    default:
      return { icon: '👤', label: 'User', color: 'bg-gray-100 text-gray-700' }
  }
}

const Forum = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('')
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general',
  })

  useEffect(() => {
    fetchPosts()
  }, [category])

  const fetchPosts = async () => {
    try {
      const { data } = await api.get(`/forum?category=${category}`)
      setPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
      // Silently handle forum posts fetch errors
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please login to create a post')
      return
    }

    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Title and content are required')
      return
    }

    try {
      await api.post('/forum', newPost)
      toast.success('Post created successfully!')
      setShowCreateModal(false)
      setNewPost({ title: '', content: '', category: 'general' })
      fetchPosts()
    } catch (error) {
      toast.error('Failed to create post')
    }
  }

  const handlePinPost = async (postId, isPinned) => {
    if (user?.role !== 'admin') return

    try {
      await api.put(`/forum/${postId}/pin`)
      toast.success(isPinned ? 'Post unpinned' : 'Post pinned')
      fetchPosts()
    } catch (error) {
      toast.error('Failed to pin/unpin post')
    }
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return

    try {
      await api.delete(`/forum/${postId}`)
      toast.success('Post deleted successfully')
      fetchPosts()
    } catch (error) {
      toast.error('Failed to delete post')
    }
  }

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            💬 {t('forum.title')}
          </h1>
          <p className="text-gray-600 mt-1">{t('forum.description')}</p>
        </div>
        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-md"
          >
            <FaPlus />
            {t('forum.createPost')}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('forum.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">{t('common.all')} {t('schemes.categories')}</option>
            <option value="crop-advice">🌾 {t('forum.cropAdvice')}</option>
            <option value="market-info">💰 {t('forum.marketInfo')}</option>
            <option value="schemes">📜 {t('forum.govtSchemes')}</option>
            <option value="technology">🚜 {t('forum.technology')}</option>
            <option value="general">💬 {t('forum.general')}</option>
          </select>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post._id}
              className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow ${
                post.isPinned ? 'border-2 border-green-500' : ''
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {post.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          <FaThumbtack className="text-xs" />
                          Pinned
                        </span>
                      )}
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {post.category.replace('-', ' ')}
                      </span>
                    </div>
                    <Link to={`/forum/${post._id}`}>
                      <h2 className="text-xl font-bold text-gray-900 hover:text-green-600 transition-colors">
                        {post.title}
                      </h2>
                    </Link>
                  </div>
                  
                  {/* Admin Actions */}
                  {user?.role === 'admin' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handlePinPost(post._id, post.isPinned)}
                        className={`p-2 rounded-lg transition-colors ${
                          post.isPinned
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={post.isPinned ? 'Unpin post' : 'Pin post'}
                      >
                        <FaThumbtack />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Delete post"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-gray-700 mb-4 line-clamp-2">{post.content}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {/* Author Info with Role Badge */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {post.author?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{post.author?.name}</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          getRoleBadge(post.author?.role).color
                        }`}
                      >
                        <span>{getRoleBadge(post.author?.role).icon}</span>
                        {getRoleBadge(post.author?.role).label}
                      </span>
                    </div>
                  </div>

                  <span className="text-gray-500">•</span>
                  {post.author?.location?.district && (
                    <>
                      <span className="text-gray-600">📍 {post.author.location.district}</span>
                      <span className="text-gray-500">•</span>
                    </>
                  )}
                  <span className="text-gray-600">
                    🕒 {new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>

                  <div className="ml-auto flex items-center gap-4">
                    <span className="text-gray-600 flex items-center gap-1">
                      ❤️ {post.likes?.length || 0}
                    </span>
                    <span className="text-gray-600 flex items-center gap-1">
                      💬 {post.comments?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || category
              ? 'Try adjusting your search or filters'
              : 'Be the first to start a discussion!'}
          </p>
          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition inline-flex items-center gap-2"
            >
              <FaPlus />
              Create First Post
            </button>
          )}
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-900">Create New Post</h2>
            </div>

            <form onSubmit={handleCreatePost} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    required
                  >
                    <option value="general">💬 General Discussion</option>
                    <option value="crop-advice">🌾 Crop Advice</option>
                    <option value="market-info">💰 Market Info</option>
                    <option value="schemes">📜 Govt. Schemes</option>
                    <option value="technology">🚜 Technology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter a clear, descriptive title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows="6"
                    placeholder="Share your thoughts, questions, or advice..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    required
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewPost({ title: '', content: '', category: 'general' })
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Create Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Forum
