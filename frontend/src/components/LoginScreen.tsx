import { useState } from 'react';
import { User, Users, Shield, BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LoginScreenProps {
  // onLogin artık Promise (Gelecekten haber veren) bir fonksiyon
  onLogin: (email: string, password: string, role: 'user' | 'librarian' | 'admin') => Promise<boolean> | boolean;
  onRegister: () => void;
}

export function LoginScreen({ onLogin, onRegister }: LoginScreenProps) {
  const [email, setEmail] = useState(''); // Username yerine Email kullanıyoruz
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'user' | 'librarian' | 'admin'>('user');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Yükleniyor durumu

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email.trim() && password.trim()) {
      setIsLoading(true); // Butonu kilitle
      try {
        // await ile cevabın gelmesini bekle
        const success = await onLogin(email.trim(), password.trim(), selectedRole);
        if (!success) {
          setError('Giriş başarısız. Email veya şifre hatalı.');
        }
      } catch (err: any) {
        if (err.response && err.response.data && typeof err.response.data === 'string') {
          setError(err.response.data);
        } else {
          setError('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
      } finally {
        setIsLoading(false); // Butonu aç
      }
    }
  };

  const roles = [
    {
      id: 'user' as const,
      name: 'User',
      icon: User,
      description: 'Browse and borrow books',
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
    },
    {
      id: 'librarian' as const,
      name: 'Librarian',
      icon: Users,
      description: 'Manage borrowing and returns',
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
    },
    {
      id: 'admin' as const,
      name: 'Admin',
      icon: Shield,
      description: 'Full System Access',
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Hero Section */}
          <div className="text-white space-y-6 hidden md:block">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Welcome</h1>
                <p className="text-purple-200">Your Digital Library Awaits</p>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1662582631700-676a217d511f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWJyYXJ5JTIwYm9va3MlMjBzaGVsdmVzfGVufDF8fHx8MTc2NDI0ODYwMHww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Library"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent"></div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-white mb-1">100+</p>
                <p className="text-purple-200 text-sm">Books</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-white mb-1">24/7</p>
                <p className="text-purple-200 text-sm">Access</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-white mb-1">Easy</p>
                <p className="text-purple-200 text-sm">Search</p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h5 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h5>
            <p className="text-gray-600 mb-6">Choose your role to continue</p>

            {/* Role Selection */}
            <div className="mb-6">
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-4 rounded-2xl transition-all text-center ${isSelected
                          ? `${role.color} text-white shadow-lg scale-105`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      <Icon className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">{role.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg animate-in fade-in slide-in-from-top-2">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email" // Tipi email yaptık
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full text-white py-3 px-4 rounded-xl ${roles.find((r) => r.id === selectedRole)?.color
                  } ${roles.find((r) => r.id === selectedRole)?.hoverColor
                  } transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in as {roles.find((r) => r.id === selectedRole)?.name}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {selectedRole === 'user' && (
              <div className="mt-6 text-center">
                <button
                  type="button" // Form submit tetiklemesin diye type="button" önemli
                  onClick={onRegister}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors hover:underline"
                >
                  Don&apos;t have an account? Create one
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}