import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { axiosInstance } from '../lib/axios';

const TestAuthPage = () => {
  const { authUser, token } = useAuthStore();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/auth/check');
      setTestResult({
        success: true,
        data: res.data,
        status: res.status
      });
    } catch (err) {
      setError({
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      setTestResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>
      
      <div className="mb-6 p-4 border rounded-lg bg-base-200">
        <h2 className="text-xl font-semibold mb-2">Current Auth State</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div className="mb-6">
        <button 
          className="btn btn-primary" 
          onClick={testAuth}
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Authentication'}
        </button>
      </div>

      {testResult && (
        <div className="p-4 border rounded-lg bg-success/10 mb-4">
          <h2 className="text-xl font-semibold mb-2 text-success">Authentication Successful</h2>
          <p>Status: {testResult.status}</p>
          <pre className="bg-base-300 p-2 rounded mt-2 text-sm overflow-auto max-h-40">
            {JSON.stringify(testResult.data, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div className="p-4 border rounded-lg bg-error/10">
          <h2 className="text-xl font-semibold mb-2 text-error">Authentication Failed</h2>
          <p>Status: {error.status || 'Unknown'}</p>
          <p>Message: {error.message}</p>
          {error.data && (
            <pre className="bg-base-300 p-2 rounded mt-2 text-sm overflow-auto max-h-40">
              {JSON.stringify(error.data, null, 2)}
            </pre>
          )}
        </div>
      )}

      <div className="mt-8 p-4 border rounded-lg bg-base-200">
        <h2 className="text-xl font-semibold mb-2">Debugging Information</h2>
        <p className="mb-2">If you're experiencing authentication issues, check the following:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Open browser console to see detailed request/response logs</li>
          <li>Verify that cookies are being set correctly</li>
          <li>Check if the Authorization header is being sent with requests</li>
          <li>Ensure your backend CORS settings allow credentials</li>
        </ul>
      </div>
    </div>
  );
};

export default TestAuthPage;
