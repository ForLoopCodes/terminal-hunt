export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          About Terminal Hunt
        </h1>

        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Terminal Hunt is a community-driven platform for discovering and
            sharing amazing terminal-based applications. Think of it as Product
            Hunt, but specifically for command-line tools and terminal
            applications.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Our Mission
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We believe that the terminal is one of the most powerful interfaces
            for developers and power users. However, discovering new and useful
            terminal applications can be challenging. Terminal Hunt aims to
            solve this by creating a centralized place where the community can:
          </p>

          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6 space-y-2">
            <li>Share their favorite terminal applications</li>
            <li>Discover new tools that can improve their workflow</li>
            <li>Get installation instructions and documentation</li>
            <li>Connect with other terminal enthusiasts</li>
            <li>Vote for the best applications in the community</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                📝 Easy Submission
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Submit your terminal applications with markdown support for rich
                descriptions and installation instructions.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                ⭐ Community Voting
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Vote for your favorite applications to help others discover the
                best tools in the community.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                🏆 Leaderboards
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track the most popular applications across daily, weekly,
                monthly, and yearly leaderboards.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                💬 Community Discussion
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Engage with the community through comments and discussions on
                each application.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                🏷️ Smart Tagging
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Filter applications by categories like CLI tools, productivity,
                development, and more.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                🔍 Powerful Search
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Find exactly what you're looking for with our intelligent search
                functionality.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Getting Started
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Ready to join the Terminal Hunt community? Here's how to get
            started:
          </p>

          <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 mb-6 space-y-2">
            <li>
              Create an account using your email or sign in with Google/Twitter
            </li>
            <li>
              Browse the homepage to discover amazing terminal applications
            </li>
            <li>Vote for applications you find useful</li>
            <li>
              Submit your own terminal applications to share with the community
            </li>
            <li>Engage with other users through comments and discussions</li>
          </ol>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Community Guidelines
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            To maintain a positive and helpful community, please follow these
            guidelines:
          </p>

          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6 space-y-2">
            <li>Only submit applications that run in a terminal environment</li>
            <li>
              Provide clear and accurate descriptions and installation
              instructions
            </li>
            <li>Be respectful in comments and discussions</li>
            <li>Don't spam or submit duplicate applications</li>
            <li>Help others by answering questions and providing feedback</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Open Source
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Terminal Hunt is built with modern web technologies including
            Next.js, TypeScript, PostgreSQL, and Tailwind CSS. We believe in
            transparency and community-driven development.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
              Ready to explore?
            </h3>
            <p className="text-blue-700 dark:text-blue-200 mb-4">
              Start discovering amazing terminal applications or share your own
              with the community!
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Browse Applications
              </a>
              <a
                href="/submit"
                className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                Submit App
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
