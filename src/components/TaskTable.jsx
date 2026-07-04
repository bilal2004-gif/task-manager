import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge } from './Badges';

export default function TaskTable({ tasks, onDelete, deletingId }) {
  if (!tasks.length) {
    return (
      <div className="card py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">No tasks found. Create your first task!</p>
        <Link to="/tasks/create" className="btn-primary mt-4 inline-flex">
          Create Task
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="card hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="pb-3 pr-4 font-semibold">Title</th>
              <th className="pb-3 pr-4 font-semibold">Status</th>
              <th className="pb-3 pr-4 font-semibold">Priority</th>
              <th className="pb-3 pr-4 font-semibold">Due Date</th>
              <th className="pb-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                <td className="py-3 pr-4">
                  <p className="font-medium">{task.title}</p>
                  {task.description && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">{task.description}</p>
                  )}
                </td>
                <td className="py-3 pr-4"><StatusBadge status={task.status} /></td>
                <td className="py-3 pr-4"><PriorityBadge priority={task.priority} /></td>
                <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <Link to={`/tasks/${task.id}/edit`} className="text-primary-600 hover:underline dark:text-primary-400">
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(task.id)}
                      disabled={deletingId === task.id}
                      className="text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                    >
                      {deletingId === task.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {tasks.map((task) => (
          <div key={task.id} className="card space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                {task.description && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
            {task.due_date && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Due: {new Date(task.due_date).toLocaleDateString()}
              </p>
            )}
            <div className="flex gap-3 border-t border-gray-100 pt-3 dark:border-gray-800">
              <Link to={`/tasks/${task.id}/edit`} className="btn-secondary flex-1 text-center">
                Edit
              </Link>
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                disabled={deletingId === task.id}
                className="btn-danger flex-1"
              >
                {deletingId === task.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
