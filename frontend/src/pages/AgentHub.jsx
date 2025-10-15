import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { t } from '../utils/translations'
import api from '../utils/api'
import { FaBriefcase, FaGraduationCap, FaBell } from 'react-icons/fa'
import { toast } from 'react-toastify'

const AgentHub = () => {
  const { language } = useLanguage()
  const [activeTab, setActiveTab] = useState('programs')
  const [programs, setPrograms] = useState([])
  const [jobs, setJobs] = useState([])
  const [updates, setUpdates] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [programsRes, jobsRes, updatesRes] = await Promise.all([
        api.get('/agent/programs'),
        api.get('/agent/jobs'),
        api.get('/agent/updates/weekly'),
      ])
      setPrograms(programsRes.data)
      setJobs(jobsRes.data)
      setUpdates(updatesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (type, id) => {
    try {
      const endpoint = type === 'program' ? `/agent/programs/${id}/apply` : `/agent/jobs/${id}/apply`
      const { data } = await api.post(endpoint)
      toast.success(data.message)
    } catch (error) {
      toast.error('Application failed')
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        💼 {t('agentHub', language)}
      </h1>

      {/* Weekly Updates */}
      {updates && (
        <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <FaBell size={24} className="mr-3" />
            <h2 className="text-xl font-semibold">{t('weeklyUpdates', language)}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-2xl font-bold">{updates.programs.new}</p>
              <p className="text-sm">New Programs</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-2xl font-bold">{updates.jobs.new}</p>
              <p className="text-sm">New Jobs</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-2xl font-bold">{updates.programs.closing}</p>
              <p className="text-sm">Closing Soon</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Key Insights:</h3>
            <ul className="space-y-1 text-sm">
              {updates.insights.map((insight, index) => (
                <li key={index}>• {insight}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <div className="flex space-x-4 px-6">
            <button
              onClick={() => setActiveTab('programs')}
              className={`py-4 px-6 font-semibold border-b-2 transition ${
                activeTab === 'programs'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaGraduationCap className="inline mr-2" />
              {t('programs', language)}
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`py-4 px-6 font-semibold border-b-2 transition ${
                activeTab === 'jobs'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaBriefcase className="inline mr-2" />
              {t('jobs', language)}
            </button>
          </div>
        </div>

        {/* Programs Tab */}
        {activeTab === 'programs' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {programs.map((program) => (
                <div key={program.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{program.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      program.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {program.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">by {program.organization}</p>
                  <p className="text-gray-700 mb-4">{program.description}</p>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>⏱️ Duration: {program.duration}</p>
                    <p>📍 Location: {program.location}</p>
                    <p>📋 Eligibility: {program.eligibility}</p>
                    <p>🎁 Benefits: {program.benefits}</p>
                    <p>📅 Deadline: {new Date(program.applicationDeadline).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => handleApply('program', program.id)}
                    disabled={program.status !== 'open'}
                    className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-secondary transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('applyNow', language)}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{job.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">by {job.company}</p>
                  <p className="text-gray-700 mb-4">{job.description}</p>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>📍 Location: {job.location}</p>
                    <p>💰 Compensation: {job.salary}</p>
                    <p>📋 Requirements: {job.requirements}</p>
                    <p>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        job.type === 'contract' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {job.type}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleApply('job', job.id)}
                    className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-secondary transition"
                  >
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AgentHub
