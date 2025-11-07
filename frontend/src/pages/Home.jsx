import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaSeedling, FaStore, FaCloudSunRain, FaFileAlt, FaBriefcase, FaUsers } from 'react-icons/fa'

const Home = () => {
  const { t } = useTranslation()

  const features = [
    {
      icon: <FaSeedling className="text-5xl text-primary" />,
      title: t('common.cropAdvisor'),
      description: t('cropAdvisor.description'),
      link: '/crop-advisor'
    },
    {
      icon: <FaStore className="text-5xl text-primary" />,
      title: t('common.marketplace'),
      description: t('marketplace.title'),
      link: '/marketplace'
    },
    {
      icon: <FaCloudSunRain className="text-5xl text-primary" />,
      title: t('common.weather'),
      description: t('weather.title'),
      link: '/weather'
    },
    {
      icon: <FaFileAlt className="text-5xl text-primary" />,
      title: t('common.schemes'),
      description: t('schemes.title'),
      link: '/schemes'
    },
    {
      icon: <FaBriefcase className="text-5xl text-primary" />,
      title: t('common.agentHub'),
      description: t('agentHub.title'),
      link: '/agent-hub'
    },
    {
      icon: <FaUsers className="text-5xl text-primary" />,
      title: t('common.forum'),
      description: t('forum.title'),
      link: '/forum'
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6 fade-in">
            {t('hero.title')}
          </h1>
          <p className="text-xl mb-8 fade-in">
            {t('hero.subtitle')}
          </p>
          <Link
            to="/register"
            className="inline-block bg-accent text-gray-800 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-yellow-500 transition fade-in"
          >
            {t('hero.getStarted')}
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t('dashboard.overview')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold mb-2">10,000+</h3>
              <p className="text-lg">Registered Farmers</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">5,000+</h3>
              <p className="text-lg">Products Listed</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">50+</h3>
              <p className="text-lg">Government Schemes</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">100+</h3>
              <p className="text-lg">Expert Advisors</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of farmers who are already benefiting from our platform
          </p>
          <Link
            to="/register"
            className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-secondary transition"
          >
            Join Now - It's Free!
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
