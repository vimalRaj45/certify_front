import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rating } from 'primereact/rating';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import toast, { Toaster } from 'react-hot-toast';
import './CompanyReview.css';

const CompanyReview = () => {
  const [rating, setRating] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.error('Please share your reason for this rating.');
      return;
    }
    if (email.includes('@')) {
      setShowDialog(false);
      toast.success('Review submitted successfully! Thank you for your feedback.', {
        duration: 4000,
        icon: '⭐️'
      });
      setSubmitted(true);
    } else {
      toast.error('Please enter a valid email address.');
    }
  };

  return (
    <section className="section company-review" id="company-review" style={{ padding: '80px 24px', background: '#F8FAFF' }}>
      <Toaster position="bottom-center" />
      <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
        <motion.div 
          className="company-review__card"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div 
                key="rating-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="company-review__content"
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                    <span className="badge badge-purple">
                    <i className="pi pi-heart-fill"></i> Give Us Feedback
                    </span>
                </div>
                <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: 16, fontFamily: 'Outfit' }}>Rate Your Experience with CertifyPro</h2>
                <p style={{ color: '#64748B', maxWidth: 550, margin: '0 auto', fontSize: '1rem' }}>
                  Your feedback drives our excellence. Let us know how we're doing!
                </p>

                <div className="company-review__rating-wrapper">
                  <Rating 
                    value={rating} 
                    onChange={(e) => {
                      setRating(e.value);
                      if (e.value) setShowDialog(true);
                    }}
                    cancel={false}
                    onIcon={<img src="https://primefaces.org/cdn/primereact/images/rating/custom-icon-active.png" alt="active" width="40px" height="40px" />}
                    offIcon={<img src="https://primefaces.org/cdn/primereact/images/rating/custom-icon.png" alt="inactive" width="40px" height="40px" />}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="success-message"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="company-review__success"
              >
                <motion.div 
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                >
                  <img 
                    src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f929/512.webp" 
                    alt="Star Eyes Happy" 
                    className="company-review__success-img"
                  />
                </motion.div>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, marginTop: 24, marginBottom: 8, fontFamily: 'Outfit' }}>Thank You So Much!</h2>
                <p style={{ color: '#64748B', fontSize: '1rem' }}>
                  Your {rating}-star feedback helps us reach new heights of excellence.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <Dialog 
          header="Complete Your Review" 
          visible={showDialog} 
          onHide={() => setShowDialog(false)}
          style={{ width: '90vw', maxWidth: '420px' }}
          draggable={false}
          resizable={false}
          className="company-review__dialog"
        >
          <div className="company-review__dialog-body">
            <p style={{ color: '#64748B', marginBottom: 24, lineHeight: 1.5, fontSize: '0.9rem' }}>We'd love to stay in touch! Please enter your email and a reason to finalize your <strong style={{color: '#0F172A'}}>{rating} star</strong> rating.</p>
            
            <div className="field" style={{ marginBottom: 20 }}>
              <label htmlFor="user-reason" style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: '0.85rem' }}>Reason for your rating</label>
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-comment"></i>
                </span>
                <InputTextarea 
                  id="user-reason" 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  placeholder="Tell us what you liked..."
                  className="w-full"
                  rows={2}
                  autoResize
                />
              </div>
            </div>

            <div className="field" style={{ marginBottom: 24 }}>
              <label htmlFor="user-email" style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: '0.85rem' }}>Your Email Address</label>
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-envelope"></i>
                </span>
                <InputText 
                  id="user-email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="email@example.com"
                  className="w-full"
                />
              </div>
            </div>

            <Button 
              label="Submit My Rating" 
              icon="pi pi-send" 
              onClick={handleSubmit} 
              className="w-full btn btn-blue"
              style={{ borderRadius: '50px', padding: '14px', width: '100%' }}
            />
          </div>
        </Dialog>
      </div>
    </section>
  );
};

export default CompanyReview;
