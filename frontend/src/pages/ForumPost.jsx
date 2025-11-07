import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { toast } from 'react-toastify'
import { FaHeart, FaRegHeart, FaArrowLeft, FaThumbtack, FaTrash } from 'react-icons/fa'

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

const ForumPost = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    try {
      const { data } = await api.get(`/forum/${id}`)
      setPost(data)
      setLiked(data.likes?.includes(user?._id))
    } catch (error) {
      toast.error('Post not found')
      navigate('/forum')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts')
      return
    }
    try {
      const { data } = await api.post(`/forum/${id}/like`)
      setLiked(data.liked)
      setPost({ ...post, likes: Array(data.likes).fill(null) })
    } catch (error) {
      toast.error('Failed to like post')
    }
  }

  const handlePinPost = async () => {
    if (user?.role !== 'admin') return
    try {
      await api.put(`/forum/${id}/pin`)
      toast.success(post.isPinned ? 'Post unpinned' : 'Post pinned')
      fetchPost()
    } catch (error) {
      toast.error('Failed to pin/unpin post')
    }
  }

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    try {
      await api.delete(`/forum/${id}`)
      toast.success('Post deleted successfully')
      navigate('/forum')
    } catch (error) {
      toast.error('Failed to delete post')
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please login to comment')
      return
    }
    try {
      const { data } = await api.post(`/forum/${id}/comment`, { content: comment })
      setPost({ ...post, comments: [...post.comments, data] })
      setComment('')
      toast.success('Comment added!')
    } catch (error) {
      toast.error('Failed to add comment')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/forum')}
        className="flex items-center text-primary hover:text-secondary mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Back to Forum
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Post Header */}
        <div className="border-b pb-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {post.isPinned && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  <FaThumbtack className="text-xs" />
                  Pinned
                </span>
              )}
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {post.category.replace('-', ' ')}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                🕒 {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
              
              {/* Admin Controls */}
              {user?.role === 'admin' && (
                <div className="flex gap-2">
                  <button
                    onClick={handlePinPost}
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
                    onClick={handleDeletePost}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="Delete post"
                  >
                    <FaTrash />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          
          {/* Author Info with Role Badge */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {post.author?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">{post.author?.name}</span>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    getRoleBadge(post.author?.role).color
                  }`}
                >
                  <span>{getRoleBadge(post.author?.role).icon}</span>
                  {getRoleBadge(post.author?.role).label}
                </span>
                {post.author?.location?.district && (
                  <span className="text-sm text-gray-600">
                    📍 {post.author.location.district}, {post.author.location.state}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="prose max-w-none mb-8">
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Like Button */}
        <div className="flex items-center space-x-4 mb-8 pb-6 border-b">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition shadow-sm ${
              liked 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {liked ? <FaHeart /> : <FaRegHeart />}
            <span className="font-medium">{post.likes?.length || 0} Likes</span>
          </button>
          <span className="text-gray-600 flex items-center gap-2">
            💬 <span className="font-medium">{post.comments?.length || 0} Comments</span>
          </span>
        </div>

        {/* Comments Section */}
        <div className="pt-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            💬 Comments ({post.comments?.length || 0})
          </h2>
          
          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleComment} className="mb-8 bg-gray-50 p-6 rounded-lg">
              <textarea
                placeholder="Share your thoughts..."
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent mb-3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                type="submit"
                disabled={!comment.trim()}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post Comment
              </button>
            </form>
          ) : (
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <p className="text-blue-700">Please login to add comments</p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {comment.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {comment.user?.name || 'User'}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            getRoleBadge(comment.user?.role).color
                          }`}
                        >
                          <span>{getRoleBadge(comment.user?.role).icon}</span>
                          {getRoleBadge(comment.user?.role).label}
                        </span>
                        <span className="text-sm text-gray-500">
                          • {new Date(comment.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-5xl mb-3">💭</div>
                <p className="text-gray-500 font-medium">No comments yet</p>
                <p className="text-gray-400 text-sm mt-1">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForumPost
