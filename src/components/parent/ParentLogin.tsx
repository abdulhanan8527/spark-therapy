import { Mail, Lock, Eye } from 'lucide-react';
import { MobileFrame } from '../shared/MobileFrame';

interface ParentLoginProps {
  onLogin: () => void;
}

export default function ParentLogin({ onLogin }: ParentLoginProps) {
  return (
    <MobileFrame color="bg-blue-600">
      <div className="bg-gray-50 min-h-[667px] flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-12 text-center">
          <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">⚡</span>
          </div>
          <h1 className="text-white mb-2">SPARK Therapy</h1>
          <p className="text-blue-100 text-sm">Parent Portal</p>
        </div>

        {/* Login Form */}
        <div className="flex-1 px-6 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 -mt-8">
            <h2 className="text-gray-900 mb-6">Welcome Back</h2>

            {/* Email/Phone Field */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 text-sm">Email or Phone</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="parent@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 text-sm">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Eye className="w-5 h-5 text-gray-400 absolute right-3 top-3" />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right mb-6">
              <button className="text-blue-600 text-sm">Forgot Password?</button>
            </div>

            {/* Login Button */}
            <button
              onClick={onLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>

            {/* Help Text */}
            <p className="text-gray-500 text-center mt-6 text-sm">
              Need help? Contact support
            </p>
          </div>

          {/* Footer */}
          <p className="text-gray-400 text-center mt-8 text-xs">
            SPARK Therapy Services v2.0
          </p>
        </div>
      </div>
    </MobileFrame>
  );
}
