import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { taskApi, ApiError } from '../services/api';
import TaskForm from '../components/TaskForm';
import { PageLoader } from '../components/LoadingSpinner';

export default function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    taskApi
      .getById(id)
      .then((res) => setTask(res.data.task))
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : 'Task not found');
        navigate('/dashboard');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      await taskApi.update(id, data);
      toast.success('Task updated successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Edit Task</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update task details</p>
      <div className="card mt-6">
        <TaskForm
          initialData={task}
          onSubmit={handleSubmit}
          loading={submitting}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
