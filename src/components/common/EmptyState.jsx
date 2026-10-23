import { Sparkles } from 'lucide-react';

export function EmptyState({ 
  title = 'No records found', 
  description = 'Get started by creating your first entry.', 
  icon: Icon = Sparkles,
  actionText, 
  onAction 
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={22} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionText && onAction && (
        <button className="primary-button" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
