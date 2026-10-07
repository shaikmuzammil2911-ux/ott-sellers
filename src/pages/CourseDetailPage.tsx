import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  GraduationCap, Clock, Check, ShoppingCart, Zap, 
  MessageCircle, ShieldCheck, ChevronDown, ChevronUp, BookOpen 
} from 'lucide-react';
import { ottApi, getCleanImageUrl } from '../services/api';
import { Course, Product } from '../types';
import { useCart } from '../context/CartContext';
import { Breadcrumb } from '../components/common/Breadcrumb';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadCourse = async () => {
      if (!slug) return;
      setLoading(true);
      const crs = await ottApi.getCourseBySlug(slug);
      setCourse(crs || null);
      setLoading(false);
    };

    loadCourse();
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: '#94a3b8' }}>
        <p>Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: '#fff' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800 }}>Course Not Found</h2>
        <p style={{ color: '#94a3b8', marginTop: '10px' }}>The course you are looking for does not exist or has been archived.</p>
        <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '24px' }}>
          Back to Homepage
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    const courseProduct: Product = {
      id: course.id,
      slug: course.slug,
      name: course.title,
      tagline: course.shortDescription || '',
      categorySlug: course.categorySlug || 'combos',
      categoryName: 'Courses & Masterclasses',
      subcategorySlug: '',
      subcategoryName: '',
      catalogSlugs: [],
      image: course.imageUrl,
      brandColor: '#0b132b',
      rating: 5,
      reviewsCount: 48,
      defaultPlan: '1 Month',
      plans: [
        {
          duration: '1 Month',
          price: course.price,
          originalPrice: course.comparePrice || course.price * 2,
          discountPercentage: 50
        }
      ],
      features: course.features || [],
      deliverables: course.curriculum || [],
      rules: [],
      faqs: course.faqs || [],
      inStock: true,
      warrantyPeriod: 'Full Duration Access'
    };

    addToCart(courseProduct, '1 Month', 1);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div className="container" style={{ paddingTop: '20px' }}>
        <Breadcrumb 
          items={[
            { label: 'Home', to: '/' },
            { label: 'Courses', to: '/items' },
            { label: course.title }
          ]} 
        />

        {/* Hero Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          marginTop: '24px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid #1e293b',
          borderRadius: '24px',
          padding: '32px'
        }}>
          {/* Course Thumbnail */}
          <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', border: '1px solid #334155' }}>
            <img 
              src={getCleanImageUrl(course.imageUrl, course.updatedAt)} 
              alt={course.title}
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60';
              }}
            />
            {course.isFeatured && (
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: '#0284c7',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                FEATURED MASTERCLASS
              </div>
            )}
          </div>

          {/* Course Info & CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                <GraduationCap size={16} />
                <span>ONLINE TRAINING MASTERCLASS</span>
                <span>•</span>
                <Clock size={14} />
                <span>{course.duration || 'Self-Paced'}</span>
              </div>

              <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', lineHeight: 1.25, marginBottom: '12px' }}>
                {course.title}
              </h1>

              <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '20px' }}>
                {course.shortDescription}
              </p>

              {/* Price card */}
              <div style={{
                background: '#0b132b',
                border: '1px solid #1e293b',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '12px',
                marginBottom: '24px'
              }}>
                <span style={{ fontSize: '32px', fontWeight: 900, color: '#34d399' }}>
                  ₹{course.price}
                </span>
                {course.comparePrice && course.comparePrice > course.price && (
                  <span style={{ fontSize: '18px', color: '#64748b', textDecoration: 'line-through' }}>
                    ₹{course.comparePrice}
                  </span>
                )}
                <span style={{ fontSize: '12px', color: '#38bdf8', background: 'rgba(2, 132, 199, 0.2)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  INSTANT ACCESS
                </span>
              </div>

              {/* Features list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {(course.features || []).map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#e2e8f0' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleAddToCart}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 }}
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="btn-primary"
                  style={{ flex: 1.5, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 800 }}
                >
                  <Zap size={18} />
                  Buy Course Now
                </button>
              </div>

              <a
                href={`https://wa.me/919441323332?text=${encodeURIComponent(`Hello OTT SELLERS, I would like to enquire about the course: "${course.title}".`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(37, 211, 102, 0.1)',
                  border: '1px solid rgba(37, 211, 102, 0.3)',
                  color: '#25d366',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <MessageCircle size={16} />
                Ask Question on WhatsApp (+91 9441323332)
              </a>
            </div>
          </div>
        </div>

        {/* Curriculum & Details */}
        <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          {/* Left: Overview & Curriculum */}
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #1e293b', borderRadius: '24px', padding: '28px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <BookOpen size={20} color="#0284c7" />
              Curriculum & Modules
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(course.curriculum || []).map((mod, idx) => (
                <div key={idx} style={{ padding: '14px 18px', background: '#0b132b', border: '1px solid #1e293b', borderRadius: '14px', color: '#e2e8f0', fontSize: '14px', fontWeight: 600 }}>
                  {mod}
                </div>
              ))}
            </div>

            {course.description && (
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #1e293b' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Detailed Overview</h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {course.description}
                </p>
              </div>
            )}
          </div>

          {/* Right: FAQs & Warranty */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Warranty badge */}
            <div style={{ background: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.3)', borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <ShieldCheck size={36} color="#38bdf8" style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>100% Genuine Certification & Guarantee</h4>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  Get verifiable access, updated video materials, and priority mentor support on WhatsApp 9441323332.
                </p>
              </div>
            </div>

            {/* FAQs */}
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #1e293b', borderRadius: '24px', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>Frequently Asked Questions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(course.faqs || []).map((faq, idx) => (
                  <div key={idx} style={{ border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: '#0b132b',
                        border: 'none',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: 700
                      }}
                    >
                      <span>{faq.question}</span>
                      {openFaqIndex === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {openFaqIndex === idx && (
                      <div style={{ padding: '12px 16px', background: 'rgba(11, 19, 43, 0.5)', color: '#94a3b8', fontSize: '13px', lineHeight: 1.5 }}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
