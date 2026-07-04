import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authApi, ApiError } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { validateEmail, validateName, validatePassword } from '../utils/validation';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', password: '' });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: form.password ? validatePassword(form.password) : '',
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;

      const res = await authApi.updateProfile(payload);
      updateUser(res.data.user);
      setForm((prev) => ({ ...prev, password: '' }));
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your account information</p>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-5" noValidate>
        <div>
          <label htmlFor="name" className="label">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            className={`input-field ${errors.name ? 'input-error' : ''}`}
          />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className={`input-field ${errors.email ? 'input-error' : ''}`}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="label">New Password (optional)</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className={`input-field ${errors.password ? 'input-error' : ''}`}
            placeholder="Leave blank to keep current password"
          />
          {errors.password && <p className="error-text">{errors.password}</p>}
        </div>

        {user?.created_at && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Member since {new Date(user.created_at).toLocaleDateString()}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
