import React, { useState, useEffect } from 'react';
import { announcementAPI, paymentAPI } from '../../utils/api';
import { toast } from '../../utils/toast';
import { CreditCard, CheckCircle, Clock, Users, IndianRupee } from 'lucide-react';

const PaymentsTab = ({ event, user, isHead }) => {
  const [paymentAnnouncements, setPaymentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null); // announcementId being paid

  useEffect(() => { fetchPaymentAnnouncements(); }, [event._id]);

  const fetchPaymentAnnouncements = async () => {
    try {
      const { data } = await announcementAPI.getByEvent(event._id, { type: 'payment' });
      // Fetch payment status for each
      const withStatus = await Promise.all(
        data.data.announcements.map(async (a) => {
          try {
            const statusRes = await paymentAPI.getStatus(event._id, a._id);
            return { ...a, paymentData: statusRes.data.data };
          } catch {
            return { ...a, paymentData: null };
          }
        })
      );
      setPaymentAnnouncements(withStatus);
    } catch (err) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async (announcementId) => {
    setPaying(announcementId);
    try {
      const { data } = await paymentAPI.createOrder({ announcementId });
      const { orderId, amount, currency, keyId } = data.data;

      // Load Razorpay script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: keyId,
          amount,
          currency,
          name: event.title,
          description: `Payment for ${event.title}`,
          order_id: orderId,
          handler: async (response) => {
            try {
              await paymentAPI.verify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              toast.success('Payment successful! 🎉');
              fetchPaymentAnnouncements();
            } catch (err) {
              toast.error('Payment verification failed');
            }
          },
          modal: {
            ondismiss: () => {
              toast.info('Payment cancelled');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };

      script.onerror = () => toast.error('Failed to load payment gateway');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setPaying(null);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Payments</h2>
      </div>

      {paymentAnnouncements.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <CreditCard size={36} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>No payment notices yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {paymentAnnouncements.map((a) => {
            // Determine user's payment status
            let userStatus = 'pending';
            if (!isHead && a.paymentData) {
              userStatus = a.paymentData.status || 'pending';
            }
            const isPaid = userStatus === 'paid';

            // Head view: count paid/total
            let paidCount = 0;
            let totalCount = 0;
            if (isHead && Array.isArray(a.paymentData)) {
              totalCount = event.participants?.length - 1 || 0; // exclude head
              paidCount = a.paymentData.filter((p) => p.status === 'paid').length;
            }

            return (
              <div key={a._id} className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{a.title}</h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4 }}>{a.content}</p>
                  </div>
                  <div style={{
                    background: 'rgba(0,200,83,0.1)', borderRadius: 10, padding: '6px 14px',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <IndianRupee size={16} color="var(--accent-success)" />
                    <span style={{ fontWeight: 800, color: 'var(--accent-success)', fontSize: '1.1rem' }}>{a.paymentAmount?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment details row */}
                <div style={{ display: 'flex', gap: 20, marginBottom: 18, flexWrap: 'wrap' }}>
                  {a.paymentPurpose && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Purpose</span><br />
                      {a.paymentPurpose}
                    </div>
                  )}
                  {a.paymentDeadline && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} />
                      Deadline: {new Date(a.paymentDeadline).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Head view: payment summary */}
                {isHead && (
                  <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: '14px 18px', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Users size={14} /> Payment Status
                      </span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--accent-success)', fontWeight: 700 }}>
                        {paidCount}/{totalCount} paid
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${totalCount ? (paidCount / totalCount) * 100 : 0}%`, background: 'linear-gradient(90deg, var(--accent-success), var(--accent-primary))', borderRadius: 3, transition: 'width 0.4s ease' }} />
                    </div>
                    {/* Individual statuses */}
                    {Array.isArray(a.paymentData) && a.paymentData.length > 0 && (
                      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {a.paymentData.map((p) => (
                          <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            <span style={{ color: 'var(--text-primary)' }}>
                              {p.userId?.firstName && p.userId?.lastName 
                                ? `${p.userId.firstName}${p.userId.middleName ? ' ' + p.userId.middleName : ''} ${p.userId.lastName}` 
                                : 'Unknown'}
                            </span>
                            <span style={{
                              color: p.status === 'paid' ? 'var(--accent-success)' : p.status === 'failed' ? 'var(--accent-danger)' : 'var(--text-muted)',
                              fontWeight: 600, textTransform: 'capitalize',
                            }}>
                              {p.status === 'paid' && <CheckCircle size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
                              {p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Volunteer view: pay button */}
                {!isHead && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {isPaid ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-success)', fontWeight: 600, fontSize: '0.88rem' }}>
                        <CheckCircle size={20} /> Payment Completed
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => initiatePayment(a._id)}
                        disabled={paying === a._id}
                        style={{ padding: '10px 24px' }}
                      >
                        {paying === a._id ? (
                          <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                        ) : (
                          <><CreditCard size={16} /> Pay ₹{a.paymentAmount?.toLocaleString()}</>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PaymentsTab;
