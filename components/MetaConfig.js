import { useRef, useState } from 'react';
import axios from 'axios';

export default function MetaConfig({ user }) {
    const [token, setToken] = useState(user.metaAccessToken || '');
    const [phoneId, setPhoneId] = useState(user.metaPhoneId || '');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(user.metaPhoneId ? 'Connected' : 'Not Connected');

    const handleSave = async () => {
        setLoading(true);
        try {
            await axios.post('/api/settings/whatsapp', {
                metaAccessToken: token,
                metaPhoneId: phoneId
            });
            setStatus('Verified');
            alert('Connected successfully to Meta Cloud API!');
        } catch (e) {
            alert('Failed: ' + e.response?.data?.error);
            setStatus('Error');
        }
        setLoading(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow mt-6">
            <h2 className="text-xl font-bold mb-4">Official WhatsApp API (Meta)</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Meta Access Token</label>
                    <input
                        type="password"
                        value={token}
                        onChange={e => setToken(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="EAAB..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Phone Number ID</label>
                    <input
                        type="text"
                        value={phoneId}
                        onChange={e => setPhoneId(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="10034..."
                    />
                </div>

                <div className="flex justify-between items-center">
                    <span className={`font-bold ${status === 'Connected' || status === 'Verified' ? 'text-green-600' : 'text-gray-500'}`}>
                        Status: {status}
                    </span>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Save & Connect'}
                    </button>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                    Note: Using the Official Cloud API allows this app to run reliably on Vercel/Serverless without timeouts.
                </p>
            </div>
        </div>
    );
}
