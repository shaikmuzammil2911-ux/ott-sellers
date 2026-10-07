import React, { useState, useEffect } from 'react';
import { 
  Bell, Plus, Search, Edit2, Trash2, Check, X, RefreshCw, 
  Eye, EyeOff, MessageSquare, AlertCircle, Sparkles, Zap, ShieldCheck 
} from 'lucide-react';
import { ottApi } from '../../services/api';
import { SiteNotification } from '../../types';

export const AdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<SiteNotification[]>([]);
  const [masterActive, setMasterActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotif, setEditingNotif] = useState<SiteNotification | null>(null);
  const [formBuyerName, setFormBuyerName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formProductName, setFormProductName] = useState('');
  const [formSlug, setFormSlug] = useState('netflix-premium');
  const [formPlan, setFormPlan] = useState('3 Months');
  const [formTimeText, setFormTimeText] = useState('2 mins ago');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState('1');
  const [formIsActive, setFormIsActive] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [notifs, settings] = await Promise.all([
        ottApi.getNotifications(),
        ottApi.getAdminSettings()
      ]);
      setNotifications(notifs);
      setMasterActive(settings.randomNotificationsActive ?? true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleToggleMaster = async () => {
    const nextState = !masterActive;
    setMasterActive(nextState);
    const settings = await ottApi.getAdminSettings();
    await ottApi.saveAdminSettings({ ...settings, randomNotificationsActive: nextState });
    await ottApi.logAudit('TOGGLE_RANDOM_NOTIFICATIONS_MASTER', 'settings', 'global', { active: nextState });
    showToast(`Random live notifications are now ${nextState ? 'ACTIVATED (ON)' : 'DEACTIVATED (OFF)'} on customer website.`);
  };

  const handleOpenAddModal = () => {
    setEditingNotif(null);
    setFormBuyerName('Karthik R.');
    setFormLocation('Mumbai');
    setFormProductName('Netflix Premium (4K UHD)');
    setFormSlug('netflix-premium');
    setFormPlan('3 Months');
    setFormTimeText('Just now');
    setFormImageUrl('https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=100&auto=format&fit=crop&q=80');
    setFormMessage('Verified customer subscription activated');
    setFormDisplayOrder(String(notifications.length + 1));
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (n: SiteNotification) => {
    setEditingNotif(n);
    setFormBuyerName(n.buyerName);
    setFormLocation(n.location);
    setFormProductName(n.productName);
    setFormSlug(n.slug);
    setFormPlan(n.plan);
    setFormTimeText(n.timeText);
    setFormImageUrl(n.imageUrl);
    setFormMessage(n.message || '');
    setFormDisplayOrder(String(n.displayOrder || 1));
    setFormIsActive(n.isActive);
    setIsModalOpen(true);
  };

  const handleSaveNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProductName.trim()) {
      alert('Product Name is required');
      return;
    }

    const notifData: SiteNotification = {
      id: editingNotif?.id || 'notif-' + Date.now(),
      buyerName: formBuyerName.trim() || 'Customer',
      location: formLocation.trim() || 'India',
      productName: formProductName.trim(),
      slug: formSlug.trim() || 'netflix-premium',
      plan: formPlan.trim() || '1 Month',
      timeText: formTimeText.trim() || 'Just now',
      imageUrl: formImageUrl.trim() || 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=100&auto=format&fit=crop&q=80',
      message: formMessage.trim(),
      displayOrder: Number(formDisplayOrder) || 1,
      isActive: formIsActive,
      updatedAt: Date.now()
    };

    setSaving(true);
    await ottApi.saveNotification(notifData);
    await ottApi.logAudit(editingNotif ? 'UPDATE_NOTIFICATION' : 'CREATE_NOTIFICATION', 'notifications', notifData.id);
    setSaving(false);

    showToast(`Notification for "${notifData.productName}" saved successfully to database!`);
    setIsModalOpen(false);
    await loadData();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete popup notification for "${name}"?`)) {
      await ottApi.deleteNotification(id);
      await ottApi.logAudit('DELETE_NOTIFICATION', 'notifications', id);
      showToast('Notification deleted.');
      await loadData();
    }
  };

  const handleToggleSingle = async (n: SiteNotification) => {
    const updated = { ...n, isActive: !n.isActive, updatedAt: Date.now() };
    await ottApi.saveNotification(updated);
    showToast(`Notification for "${n.productName}" set to ${updated.isActive ? 'Active' : 'Inactive'}.`);
    await loadData();
  };

  const filtered = notifications.filter(n => 
    n.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <Bell className="admin-heading-icon" style={{ color: '#f59e0b' }} />
            <span>Random Purchase Popup Notifications</span>
          </h1>
          <p className="admin-sub-text">
            Control the live bottom-left sales alerts, configure rotation items, and toggle display visibility.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-refresh-action"
            title="Refresh database"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="btn-primary-action"
          >
            <Plus size={16} />
            <span>Add Notification</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="admin-alert-banner">
          <Check size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Master Toggle Banner */}
      <div style={{
        background: '#070d1e',
        border: '1px solid #1e293b',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: masterActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: masterActive ? '#22c55e' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bell size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Live Storefront Popup Widget: <strong>{masterActive ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}</strong>
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '3px 0 0' }}>
              {masterActive 
                ? 'Popups appear automatically at bottom-left corner of the customer storefront.'
                : 'Popup widget is completely disabled and will not render on customer devices.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleMaster}
          style={{
            background: masterActive ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 18px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          {masterActive ? 'Turn Widget OFF' : 'Turn Widget ON'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search notification messages, products, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: 'auto' }}>
          Showing <strong>{filtered.length}</strong> configured messages
        </span>
      </div>

      {/* Cards List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
        {filtered.map((n) => (
          <div
            key={n.id}
            style={{
              background: '#070d1e',
              border: `1px solid ${n.isActive ? '#1e293b' : '#334155'}`,
              borderRadius: '14px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              opacity: n.isActive ? 1 : 0.6
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: n.isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(100, 116, 139, 0.2)',
                  color: n.isActive ? '#22c55e' : '#94a3b8'
                }}>
                  {n.isActive ? 'Active' : 'Inactive'}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Order #{n.displayOrder}</span>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img
                  src={n.imageUrl}
                  alt={n.productName}
                  style={{ width: '46px', height: '46px', borderRadius: '8px', objectFit: 'cover', background: '#0b132b' }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {n.productName}
                  </h4>
                  <p style={{ fontSize: '0.76rem', color: '#cbd5e1', margin: '2px 0 0' }}>
                    {n.buyerName} • {n.location} ({n.plan})
                  </p>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0' }}>
                    {n.timeText}
                  </p>
                </div>
              </div>

              {n.message && (
                <div style={{ marginTop: '10px', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.74rem', color: '#94a3b8' }}>
                  "{n.message}"
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #1e293b' }}>
              <button
                type="button"
                onClick={() => handleToggleSingle(n)}
                style={{
                  background: 'transparent',
                  border: '1px solid #1e293b',
                  color: n.isActive ? '#e2e8f0' : '#94a3b8',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  cursor: 'pointer'
                }}
              >
                {n.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                type="button"
                onClick={() => handleOpenEditModal(n)}
                style={{
                  background: 'rgba(2, 132, 199, 0.15)',
                  border: '1px solid rgba(2, 132, 199, 0.3)',
                  color: '#38bdf8',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Edit2 size={12} />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(n.id, n.productName)}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#f87171',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box compact" style={{ maxWidth: '480px' }}>
            <div className="admin-modal-header">
              <h3 className="modal-title">
                {editingNotif ? 'Edit Notification' : 'Create Random Popup Notification'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNotification} className="admin-modal-body">
              <div className="form-group-compact">
                <label>Product Name *</label>
                <input
                  type="text"
                  required
                  value={formProductName}
                  onChange={(e) => setFormProductName(e.target.value)}
                  placeholder="e.g. Netflix Premium 4K UHD"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group-compact">
                  <label>Buyer Name</label>
                  <input
                    type="text"
                    value={formBuyerName}
                    onChange={(e) => setFormBuyerName(e.target.value)}
                    placeholder="e.g. Rahul V."
                  />
                </div>
                <div className="form-group-compact">
                  <label>Location</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Mumbai"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group-compact">
                  <label>Plan Duration</label>
                  <input
                    type="text"
                    value={formPlan}
                    onChange={(e) => setFormPlan(e.target.value)}
                    placeholder="e.g. 3 Months"
                  />
                </div>
                <div className="form-group-compact">
                  <label>Time Text</label>
                  <input
                    type="text"
                    value={formTimeText}
                    onChange={(e) => setFormTimeText(e.target.value)}
                    placeholder="e.g. 2 mins ago / Just now"
                  />
                </div>
              </div>

              <div className="form-group-compact">
                <label>Thumbnail Image URL</label>
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group-compact">
                <label>Custom Message (Optional)</label>
                <input
                  type="text"
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="e.g. Someone just purchased an annual subscription"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group-compact">
                  <label>Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(e.target.value)}
                  />
                </div>
                <div className="form-group-compact">
                  <label>Status</label>
                  <select
                    value={formIsActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormIsActive(e.target.value === 'active')}
                  >
                    <option value="active">Active (Show)</option>
                    <option value="inactive">Inactive (Hide)</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-modal-cancel">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-modal-save">
                  {saving ? 'Saving...' : 'Save Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
