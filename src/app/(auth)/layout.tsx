export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">⛪</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Ministères Église</h1>
          <p className="text-primary-200 text-sm mt-1">Gestion des ministères</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">{children}</div>
      </div>
    </div>
  )
}
