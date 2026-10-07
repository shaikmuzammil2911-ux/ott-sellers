import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, Clock, CheckCircle2, ArrowRight, 
  Sparkles, ShieldCheck, Zap 
} from 'lucide-react';
import { Course } from '../../types';
import { ottApi, getCleanImageUrl } from '../../services/api';
import './CoursesSection.css';

export const CoursesSection: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCourses = useCallback(async () => {
    try {
      const data = await ottApi.getCourses();
      setCourses(data.filter(c => c.status === 'published'));
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();

    const handleUpdate = () => loadCourses();
    window.addEventListener('ott_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('ott_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadCourses]);

  if (!loading && courses.length === 0) {
    return null;
  }

  return (
    <section className="section courses-showcase-section" id="courses">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div>
            <div className="section-eyebrow">
              <Sparkles size={14} className="eyebrow-icon" />
              <span>TRAINING & MASTERCLASSES</span>
            </div>
            <h2 className="section-title">
              <GraduationCap size={24} className="section-title-icon" color="#0284c7" />
              <span>Learn OTT Business & Reselling</span>
            </h2>
            <p className="section-subtitle">
              Step-by-step masterclasses and complete blueprints to start and scale digital subscription reselling.
            </p>
          </div>
        </div>

        {/* Courses Cards Grid */}
        <div className="courses-grid">
          {loading ? (
            [1, 2].map((i) => (
              <div key={i} className="course-card-skeleton" />
            ))
          ) : (
            courses.map((course) => (
              <div key={course.id} className="course-card">
                {/* Image Banner */}
                <div className="course-image-wrap">
                  <img
                    src={getCleanImageUrl(course.imageUrl, course.updatedAt)}
                    alt={course.title}
                    className="course-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60';
                    }}
                  />
                  <div className="course-badges-overlay">
                    {course.isFeatured && (
                      <span className="course-featured-badge">Featured Masterclass</span>
                    )}
                    <span className="course-duration-badge">
                      <Clock size={12} />
                      <span>{course.duration || 'Self-Paced'}</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="course-content">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-desc">
                    {course.shortDescription || course.description}
                  </p>

                  {/* Highlights */}
                  {course.features && course.features.length > 0 && (
                    <ul className="course-features-list">
                      {course.features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="course-feature-item">
                          <CheckCircle2 size={14} className="feature-check-icon" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Bottom Price & Action */}
                  <div className="course-footer">
                    <div className="course-price-box">
                      <div className="course-current-price">₹{course.price}</div>
                      {course.comparePrice && course.comparePrice > course.price && (
                        <div className="course-compare-price">₹{course.comparePrice}</div>
                      )}
                    </div>

                    <Link to={`/course/${course.slug}`} className="btn-course-enroll">
                      <span>Enroll Now</span>
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
