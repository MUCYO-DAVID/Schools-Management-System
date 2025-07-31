import { Award, Target, Users, Globe, BookOpen, Shield } from "lucide-react"
import Navigation from "../components/Navigation"

export default function About() {
  const values = [
    {
      icon: Award,
      title: "Excellence",
      description: "Committed to providing the highest quality educational management solutions",
    },
    {
      icon: Target,
      title: "Innovation",
      description: "Leveraging technology to transform education in Rwanda",
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Working together with schools, students, and communities",
    },
    {
      icon: Globe,
      title: "Accessibility",
      description: "Making education management accessible to all schools across Rwanda",
    },
    {
      icon: BookOpen,
      title: "Learning",
      description: "Fostering continuous learning and improvement",
    },
    {
      icon: Shield,
      title: "Trust",
      description: "Building trust through transparency and reliability",
    },
  ]

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering education in Rwanda through innovative school management solutions
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-900 to-green-700 text-white rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-lg text-blue-100 mb-6">
                  To revolutionize education management in Rwanda by providing comprehensive, accessible, and innovative
                  digital solutions that empower schools, students, and educators to achieve excellence.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">500+</div>
                    <div className="text-blue-100">Schools Served</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">50K+</div>
                    <div className="text-blue-100">Students Impacted</div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="w-64 h-64 bg-white bg-opacity-10 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="w-32 h-32 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and shape our commitment to educational excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* History Section */}
        <section className="mb-16">
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Founded in 2020, the Rwanda School Management System was born from a vision to digitize and
                    modernize education management across the country.
                  </p>
                  <p>
                    In partnership with the Rwanda Education Board (REB) and the National Examination and School
                    Inspection Authority (NESA), we have developed a comprehensive platform that serves schools
                    nationwide.
                  </p>
                  <p>
                    Our journey began with a simple goal: to make school administration more efficient and accessible.
                    Today, we proudly serve over 500 schools and impact the lives of more than 50,000 students across
                    Rwanda.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">2020</div>
                  <div className="text-sm text-gray-600">Founded</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">100+</div>
                  <div className="text-sm text-gray-600">First Schools</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">2022</div>
                  <div className="text-sm text-gray-600">National Rollout</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">500+</div>
                  <div className="text-sm text-gray-600">Schools Today</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partnership Section */}
        <section>
          <div className="bg-gradient-to-r from-green-700 to-blue-900 text-white rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Our Partners</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Working in collaboration with key educational institutions to drive positive change
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white bg-opacity-10 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">Rwanda Education Board (REB)</h3>
                <p className="text-blue-100">
                  Official partnership for educational policy implementation and school oversight
                </p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">NESA</h3>
                <p className="text-blue-100">Collaboration on examination management and school inspection processes</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
