import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Check, X, Upload, 
  GraduationCap, RefreshCw, AlertCircle, Eye, EyeOff, BookOpen, Clock 
} from 'lucide-react';
import { ottApi, getCleanImageUrl } from '../../services/api';
import { uploadService } from '../../services/uploadService';
import { Course, Category } from '../../types';

export const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(() => ottApi.getCachedCoursesAdmin());
  const [categories, setCategories] = useState<Category[]>(() => ottApi.getCachedCategoriesAdmin());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategorySlug, setFormCategorySlug] = useState('');
  const [formPrice, setFormPrice] = useState('799');
  const [formComparePrice, setFormComparePrice] = useState('1999');
  const [formDuration, setFormDuration] = useState('4 Weeks');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formStatus, setFormStatus] = useState<'published' | 'draft' | 'archived'>('published');
  const [formIsFeatured, setFormIsFeatured] = useState(true);
  const [formFeatures, setFormFeatures] = useState('');

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [crss, cats] = await Promise.all([
        ottApi.getAllCoursesAdmin(),
        ottApi.getAllCategoriesAdmin()
      ]);
      setCourses(crss);
      setCategories(cats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setFormTitle('');
    setFormSlug('');
    setFormCategorySlug(categories[0]?.slug || 'combos');
    setFormPrice('799');
    setFormComparePrice('1999');
    setFormDuration('4 Weeks');
    setFormShortDesc('');
    setFormDescription('');
    setFormImageUrl('');
    setFormStatus('published');
    setFormIsFeatured(true);
    setFormFeatures('Full HD Video Modules\nLifetime Access & Updates\nWhatsApp Dedicated Mentor Support\nPractical OTT Reselling Blueprint');
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Course) => {
    setEditingCourse(c);
    setFormTitle(c.title);
    setFormSlug(c.slug);
    setFormCategorySlug(c.categorySlug || 'combos');
    setFormPrice(String(c.price || 799));
    setFormComparePrice(String(c.comparePrice || 1999));
    setFormDuration(c.duration || '4 Weeks');
    setFormShortDesc(c.shortDescription || '');
    setFormDescription(c.description || '');
    setFormImageUrl(c.imageUrl);
    setFormStatus(c.status || 'published');
    setFormIsFeatured(c.isFeatured ?? true);
    setFormFeatures((c.features || []).join('\n'));
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const res = await uploadService.uploadImage(file, 'courses');
    setIsUploading(false);

    if (res.success && res.url) {
      setFormImageUrl(res.url);
    } else {
      setUploadError(res.error || 'Failed to upload image. Please try again.');
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Course title is required');
      return;
    }

    const slug = formSlug.trim() 
      ? formSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      : formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const featuresArray = formFeatures.split('\n').map(s => s.trim()).filter(Boolean);

    const courseData: Course = {
      id: editingCourse?.id || 'crs-' + Date.now(),
      title: formTitle.trim(),
      slug,
      categorySlug: formCategorySlug,
      shortDescription: formShortDesc.trim() || formTitle.trim(),
      description: formDescription.trim(),
      imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
      price: Number(formPrice) || 0,
      comparePrice: Number(formComparePrice) || 0,
      duration: formDuration,
      status: formStatus,
      isFeatured: formIsFeatured,
      features: featuresArray,
      curriculum: editingCourse?.curriculum || [
        'Module 1: Introduction to OTT Ecosystem & Legal Subscriptions',
        'Module 2: Managing Multi-Device Sessions & PIN Protection',
        'Module 3: Scaling Digital Store & Customer Support Automation'
      ],
      faqs: editingCourse?.faqs || [
        { question: 'Is this suitable for beginners?', answer: 'Yes, step-by-step guidance is included.' }
      ],
      updatedAt: Date.now()
    };

    await ottApi.saveCourse(courseData);
    await ottApi.logAudit(editingCourse ? 'UPDATE_COURSE' : 'CREATE_COURSE', 'courses', courseData.id, { title: courseData.title, price: courseData.price });

    setSaveSuccessMsg(`Course "${courseData.title}" saved successfully!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
    setIsModalOpen(false);
    await loadData();
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      await ottApi.deleteCourse(id);
      await ottApi.logAudit('DELETE_COURSE', 'courses', id, { title });
      await loadData();
    }
  };

  const handleTogglePublish = async (c: Course) => {
    const newStatus = c.status === 'published' ? 'draft' : 'published';
    const updated: Course = { ...c, status: newStatus };
    await ottApi.saveCourse(updated);
    await ottApi.logAudit('TOGGLE_COURSE_STATUS', 'courses', c.id, { status: newStatus });
    await loadData();
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-main-heading">
            <GraduationCap className="admin-heading-icon" />
            <span>Courses & Masterclasses</span>
          </h1>
          <p className="admin-sub-text">
            Manage OTT training bundles, reselling tutorials, and masterclasses linked to Supabase.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-refresh-action"
            title="Refresh database"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="btn-primary-action"
          >
            <Plus size={16} />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="admin-alert-banner">
          <Check size={18} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="admin-toolbar-card">
        <div className="admin-search-wrapper">
          <Search className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search courses by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div className="admin-count-badge">
          Showing <strong>{filteredCourses.length}</strong> courses
        </div>
      </div>

      {/* Course Cards / Table */}
      <div className="admin-table-container">
        <div className="admin-table-scroll">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Featured</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-500" />
                    Loading courses from Supabase...
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No courses found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getCleanImageUrl(c.imageUrl, c.updatedAt)}
                          alt={c.title}
                          className="w-14 h-10 object-cover rounded-lg border border-slate-700/80 bg-slate-800 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60';
                          }}
                        />
                        <div>
                          <div className="font-bold text-white text-base leading-snug">{c.title}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-primary-400">/{c.slug}</span>
                            <span>•</span>
                            <span>{c.features?.length || 0} Features</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-emerald-400">₹{c.price}</div>
                      {c.comparePrice && c.comparePrice > c.price && (
                        <div className="text-xs text-slate-500 line-through">₹{c.comparePrice}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {c.duration || 'Self-Paced'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(c)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          c.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                        }`}
                      >
                        {c.status === 'published' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {c.status === 'published' ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {c.isFeatured ? (
                        <span className="px-2 py-0.5 bg-primary-500/20 text-primary-300 border border-primary-500/30 rounded text-xs font-medium">
                          Featured
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Standard</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
                          title="Edit Course"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c.id, c.title)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition-colors"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="admin-modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} style={{ color: '#0284c7' }} />
                <span>{editingCourse ? 'Edit Course Details' : 'Add New Masterclass / Course'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="modal-close-btn"
                aria-label="Close Modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="admin-form-grid">
              <div className="admin-form-group admin-form-full">
                <label>Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete OTT Reselling Masterclass 2026"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>URL Slug (auto-generated if empty)</label>
                <input
                  type="text"
                  placeholder="auto-generated-if-empty"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Course Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 4 Weeks / 12 Hours"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Authoritative Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  style={{ fontWeight: 700, color: '#10b981' }}
                />
              </div>

              <div className="admin-form-group">
                <label>Original / Compare Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formComparePrice}
                  onChange={(e) => setFormComparePrice(e.target.value)}
                />
              </div>

              <div className="admin-form-group admin-form-full">
                <label>Short Description / Subtitle</label>
                <input
                  type="text"
                  placeholder="Comprehensive training to build, market, and manage digital OTT subscription sales."
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                />
              </div>

              <div className="admin-form-group admin-form-full">
                <label>Full Overview & Curriculum Details</label>
                <textarea
                  rows={3}
                  placeholder="Detailed course description, takeaways, and curriculum overview..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              <div className="admin-form-group admin-form-full">
                <label>Course Features (One bullet per line)</label>
                <textarea
                  rows={3}
                  placeholder="Lifetime Access & Updates&#10;WhatsApp Dedicated Mentor Support&#10;Full HD Video Modules"
                  value={formFeatures}
                  onChange={(e) => setFormFeatures(e.target.value)}
                />
              </div>

              {/* Course Thumbnail Image */}
              <div className="admin-form-group admin-form-full">
                <label>Course Banner / Thumbnail Image *</label>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {formImageUrl && (
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      style={{ width: '80px', height: '54px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #1e293b' }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Paste image URL or upload image file..."
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                    />
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1e293b', padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', color: '#cbd5e1', cursor: 'pointer', width: 'fit-content' }}>
                      <Upload size={14} />
                      <span>{isUploading ? 'Uploading...' : 'Upload Image File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>
                {uploadError && (
                  <span style={{ fontSize: '0.78rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <AlertCircle size={14} /> {uploadError}
                  </span>
                )}
              </div>

              <div className="admin-form-group">
                <label>Publish Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                >
                  <option value="published">Published (Active on Live Store)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="admin-form-group" style={{ justifyContent: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', paddingTop: '18px' }}>
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#0284c7' }}
                  />
                  <span style={{ fontSize: '0.86rem', color: '#ffffff', fontWeight: 600 }}>Display as Featured Course</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="admin-modal-actions admin-form-full">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', padding: '10px 18px', borderRadius: '10px', fontSize: '0.86rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="btn-primary-action"
                  style={{ padding: '10px 22px' }}
                >
                  <Check size={16} />
                  <span>Save Course to Supabase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
