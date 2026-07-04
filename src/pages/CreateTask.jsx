import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { taskApi, ApiError } from '../services/api';
import TaskForm from '../components/TaskForm';

export default function CreateTask() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await taskApi.create(data);
      toast.success('Task created successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Create Task</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add a new task to your list</p>
      <div className="card mt-6">
        <TaskForm onSubmit={handleSubmit} loading={loading} submitLabel="Create Task" />
      </div>
    </div>
  );
}
