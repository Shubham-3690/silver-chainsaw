import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { axiosInstance } from '../lib/axios';
import { Loader, AlertCircle, CheckCircle, Info } from 'lucide-react';

const TestAuthPage = () => {
  const { authUser, token, login } = useAuthStore();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [cookieInfo, setCookieInfo] = useState(null);

  // Check for cookies on page load
  useEffect(() => {
    const cookies = document.cookie;
    setCookieInfo({
      hasCookies: !!cookies,
      cookieString: cookies || 'No cookies found'
    });
  }, []);

  const testAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      // Add timestamp to avoid caching
      const res = await axiosInstance.get(`/auth/check?t=${Date.now()}`);
      setTestResult({
        success: true,
        data: res.data,
        status: res.status,
        headers: res.headers
      });

      // Update cookie info after successful request
      const cookies = document.cookie;
      setCookieInfo({
        hasCookies: !!cookies,
        cookieString: cookies || 'No cookies found'
      });
    } catch (err) {
      setError({
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers
      });
      setTestResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(loginData);
      // Update cookie info after login
      const cookies = document.cookie;
      setCookieInfo({
        hasCookies: !!cookies,
        cookieString: cookies || 'No cookies found'
      });
    } catch (error) {
      console.error('Login failed in test page:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Info className="text-primary" /> Authentication Diagnostic Tool
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Auth State Section */}
          <div className="p-4 border rounded-lg bg-base-200">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <span>Current Auth State</span>
              {authUser ?
                <CheckCircle className="text-success h-5 w-5" /> :
                <AlertCircle className="text-warning h-5 w-5" />}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Auth User:</h3>
                <pre className="bg-base-300 p-2 rounded mt-1 text-sm overflow-auto max-h-40">
                  {authUser ? JSON.stringify(authUser, null, 2) : 'Not logged in'}
                </pre>
              </div>
              <div>
                <h3 className="font-medium">Token:</h3>
                <div className="bg-base-300 p-2 rounded mt-1 text-sm break-all">
                  {token ? `${token.substring(0, 20)}...` : 'No token'}
                </div>
                <p className="text-xs mt-1 text-base-content/70">
                  {token ? 'Token is stored in localStorage' : 'No token in localStorage'}
                </p>
              </div>
            </div>
          </div>

          {/* Cookie Information */}
          <div className="p-4 border rounded-lg bg-base-200">
            <h2 className="text-xl font-semibold mb-2">Cookie Information</h2>
            {cookieInfo && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span>Has Cookies:</span>
                  {cookieInfo.hasCookies ?
                    <CheckCircle className="text-success h-5 w-5" /> :
                    <AlertCircle className="text-warning h-5 w-5" />}
                </div>
                <div className="bg-base-300 p-2 rounded text-sm break-all">
                  {cookieInfo.cookieString}
                </div>
              </div>
            )}
          </div>

          {/* Test Button */}
          <div className="p-4 border rounded-lg bg-base-200">
            <h2 className="text-xl font-semibold mb-4">Test Authentication</h2>
            <button
              className="btn btn-primary w-full"
              onClick={testAuth}
              disabled={loading}
            >
              {loading ? <><Loader className="h-5 w-5 animate-spin mr-2" /> Testing...</> : 'Run Authentication Test'}
            </button>
            <p className="text-sm mt-2 text-base-content/70">
              This will attempt to access a protected route using your current authentication state.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Login Form */}
          <div className="p-4 border rounded-lg bg-base-200">
            <h2 className="text-xl font-semibold mb-4">Quick Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" className="btn btn-secondary w-full">
                Login for Testing
              </button>
            </form>
          </div>

          {/* Test Results */}
          {testResult && (
            <div className="p-4 border rounded-lg bg-success/10">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="text-success h-5 w-5" />
                <span className="text-success">Authentication Successful</span>
              </h2>
              <p>Status: {testResult.status}</p>
              <div className="mt-2">
                <h3 className="font-medium text-sm">User Data:</h3>
                <pre className="bg-base-300 p-2 rounded mt-1 text-sm overflow-auto max-h-40">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </div>
              <div className="mt-2">
                <h3 className="font-medium text-sm">Response Headers:</h3>
                <pre className="bg-base-300 p-2 rounded mt-1 text-sm overflow-auto max-h-40">
                  {JSON.stringify(testResult.headers, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 border rounded-lg bg-error/10">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="text-error h-5 w-5" />
                <span className="text-error">Authentication Failed</span>
              </h2>
              <p>Status: {error.status || 'Unknown'}</p>
              <p>Message: {error.message}</p>
              {error.data && (
                <div className="mt-2">
                  <h3 className="font-medium text-sm">Error Data:</h3>
                  <pre className="bg-base-300 p-2 rounded mt-1 text-sm overflow-auto max-h-40">
                    {JSON.stringify(error.data, null, 2)}
                  </pre>
                </div>
              )}
              {error.headers && (
                <div className="mt-2">
                  <h3 className="font-medium text-sm">Response Headers:</h3>
                  <pre className="bg-base-300 p-2 rounded mt-1 text-sm overflow-auto max-h-40">
                    {JSON.stringify(error.headers, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 p-4 border rounded-lg bg-base-200">
        <h2 className="text-xl font-semibold mb-2">Debugging Information</h2>
        <p className="mb-2">If you're experiencing authentication issues, check the following:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Open browser console to see detailed request/response logs</li>
          <li>Verify that cookies are being set correctly</li>
          <li>Check if the Authorization header is being sent with requests</li>
          <li>Ensure your backend CORS settings allow credentials</li>
          <li>Try logging in using the form above to get a fresh token</li>
        </ul>
      </div>
    </div>
  );
};

export default TestAuthPage;
