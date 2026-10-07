import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Check, X, Upload, 
  GraduationCap, RefreshCw, AlertCircle, Eye, EyeOff, BookOpen, Clock 
} from 'lucide-react';
import { ottApi, getCleanImageUrl } from '../../services/api';
import { uploadService } from '../../services/uploadService';
import { Course, Category } from '../../types';

export const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-primary-500" />
            Courses & Masterclasses
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage OTT training bundles, reselling tutorials, and masterclasses linked to Supabase.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-600/30 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center gap-3 text-sm">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-white font-bold">{filteredCourses.length}</span> courses
        </div>
      </div>

      {/* Course Cards / Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-xs uppercase font-semibold text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4 text-right">Actions</th>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-500" />
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete OTT Reselling Masterclass 2026"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">URL Slug</label>
                  <input
                    type="text"
                    placeholder="auto-generated-if-empty"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 4 Weeks / 12 Hours"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Authoritative Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Original / Compare Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formComparePrice}
                    onChange={(e) => setFormComparePrice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Short Description / Subtitle</label>
                <input
                  type="text"
                  placeholder="Comprehensive training to build, market, and manage digital OTT subscription sales."
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Overview</label>
                <textarea
                  rows={3}
                  placeholder="Detailed course description, takeaways, and curriculum overview..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course Features (One per line)</label>
                <textarea
                  rows={3}
                  value={formFeatures}
                  onChange={(e) => setFormFeatures(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500 font-sans"
                />
              </div>

              {/* Course Thumbnail Image */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course Banner / Thumbnail Image</label>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  {formImageUrl && (
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      className="w-24 h-16 object-cover rounded-xl border border-slate-700 bg-slate-800 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="text"
                      placeholder="Paste image URL or upload to Cloudinary/Supabase..."
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-primary-500"
                    />
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs font-medium cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      {isUploading ? 'Uploading to Cloudinary...' : 'Upload Image File'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                {uploadError && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {uploadError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Publish Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                  >
                    <option value="published">Published (Active)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="featCheck"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 bg-slate-800 border-slate-700"
                  />
                  <label htmlFor="featCheck" className="text-sm font-semibold text-slate-200 cursor-pointer">
                    Display as Featured Course
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-primary-600/30 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Course to Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
