import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { toast } from 'react-toastify'
import { FaHeart, FaRegHeart, FaArrowLeft } from 'react-icons/fa'

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

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/forum')}
        className="flex items-center text-primary hover:text-secondary mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Back to Forum
      </button>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Post Header */}
        <div className="border-b pb-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-sm font-medium">
              {post.category}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{post.title}</h1>
          <div className="flex items-center text-gray-600">
            <span className="mr-4">👤 {post.author?.name}</span>
            <span>📍 {post.author?.location?.district}, {post.author?.location?.state}</span>
          </div>
        </div>

        {/* Post Content */}
        <div className="prose max-w-none mb-8">
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Like Button */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition ${
              liked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {liked ? <FaHeart /> : <FaRegHeart />}
            <span>{post.likes?.length || 0} Likes</span>
          </button>
          <span className="text-gray-600">💬 {post.comments?.length || 0} Comments</span>
        </div>

        {/* Comments Section */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Comments</h2>
          
          {/* Add Comment Form */}
          {user && (
            <form onSubmit={handleComment} className="mb-6">
              <textarea
                placeholder="Add a comment..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary mb-2"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                type="submit"
                disabled={!comment.trim()}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition disabled:opacity-50"
              >
                Post Comment
              </button>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className="font-semibold text-gray-800">
                      {comment.user?.name || 'User'}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      • {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForumPost
