import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// (Truncated for brevity. The full code was in the canvas and will be used here.)
export default function CommitsPage() {
  const [commits, setCommits] = useState([]);
  const [message, setMessage] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Feature');
  const [tags, setTags] = useState('');
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCommits();
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  }

  async function fetchCommits() {
    const { data, error } = await supabase
      .from('commits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading commits:', error.message || error);
    } else {
      setCommits(data);
    }
  }

  async function addCommit() {
    if (!user) return alert('Please log in');
    const { error } = await supabase.from('commits').insert({
      message,
      description,
      commit_type: type,
      project_tags: tags.split(',').map(t => t.trim()),
      user_id: user.id,
    });
    if (!error) {
      setMessage('');
      setDescription('');
      setTags('');
      fetchCommits();
    } else {
      console.error('Failed to add commit:', error.message || error);
    }
  }

  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) alert('Login failed: ' + error.message);
    else checkUser();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <div className="bg-black min-h-screen text-white font-mono p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">🛠️ Dev Commits</h1>
          {user ? (
            <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded">
              Log Out
            </button>
          ) : null}
        </div>

        {!user ? (
          <div className="bg-gray-900 p-4 rounded-lg mb-6">
            <h2 className="text-xl mb-2">Log In</h2>
            <input
              className="w-full p-2 mb-2 bg-gray-800 border border-gray-700 rounded"
              placeholder="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="w-full p-2 mb-2 bg-gray-800 border border-gray-700 rounded"
              placeholder="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        ) : (
          <div className="bg-gray-900 p-4 rounded-lg mb-6">
            <h2 className="text-xl mb-2">New Commit</h2>
            <input
              className="w-full p-2 mb-2 bg-gray-800 border border-gray-700 rounded"
              placeholder="Commit Message"
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <textarea
              className="w-full p-2 mb-2 bg-gray-800 border border-gray-700 rounded"
              placeholder="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <select
              className="w-full p-2 mb-2 bg-gray-800 border border-gray-700 rounded"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option>Feature</option>
              <option>Fix</option>
              <option>Refactor</option>
              <option>Design</option>
              <option>Crash</option>
            </select>
            <input
              className="w-full p-2 mb-2 bg-gray-800 border border-gray-700 rounded"
              placeholder="Tags (comma-separated)"
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              onClick={addCommit}
            >
              Post Commit
            </button>
          </div>
        )}

        <div className="space-y-4">
          {commits.map(commit => (
            <div
              key={commit.id}
              className="bg-gray-800 p-4 rounded border border-gray-700"
            >
              <p className="text-lg font-bold">{commit.message}</p>
              <p className="text-sm text-gray-400 mb-2">
                {commit.commit_type} • {new Date(commit.created_at).toLocaleString()}
              </p>
              {commit.description && <p className="text-sm mb-1">{commit.description}</p>}
              {commit.project_tags && commit.project_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {commit.project_tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-900 text-blue-300 px-2 py-1 rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
