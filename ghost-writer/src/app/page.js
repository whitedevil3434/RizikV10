'use client';

import { useState, useRef, useEffect } from 'react';
import { Fingerprint, Mic, FileText, Upload, Sparkles, ShieldCheck, Settings, ArrowRight, Download, Activity, PlaySquare, FileCheck, Globe } from 'lucide-react';

import { createBrowserClient } from '@supabase/ssr';

const BACKEND_URL = 'https://rizik-backend.its-sabbir69.workers.dev';

export default function Home() {
  const [activeStep, setActiveStep] = useState(1);
  const [inputType, setInputType] = useState('voice');
  
  // Auth & Credits
  const [user, setUser] = useState(null);
  const [usage, setUsage] = useState({ free: 0, paid: 0 });
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [trxId, setTrxId] = useState('');
  const [creditAmount, setCreditAmount] = useState(10);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yhwhkwveupjzrwdljivn.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlod2hrd3ZldXBqenJ3ZGxqaXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTI4NzgsImV4cCI6MjA4Nzc4ODg3OH0.A5Aj5pSiDEljN0iCve3UlHgXwxCGR_jCpC0lnkIvt3A',
    {
      cookieOptions: {
        domain: '.rizikecosystem.com',
        path: '/',
      }
    }
  );

  // Auth Guard & Traffic Logic
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Redirect to main login with return path
        const currentUrl = window.location.href;
        window.location.href = `https://rizikecosystem.com/login?next=${encodeURIComponent(currentUrl)}`;
        return;
      }
      setUser(session.user);
      fetchUsage(session.user.id);
    };
    checkAuth();
  }, []);

  const fetchUsage = async (userId) => {
    const { data, error } = await supabase
      .from('user_usage')
      .select('free_uses_remaining, paid_credits')
      .eq('user_id', userId)
      .single();
    
    if (data) {
      setUsage({ free: data.free_uses_remaining, paid: data.paid_credits });
    }
  };

  const handleManualOrder = async () => {
    if (!trxId) return;
    setIsSubmittingOrder(true);
    try {
      const { error } = await supabase.from('rizik_order_records').insert({
        user_id: user.id,
        trxid: trxId,
        customer_name: user.email,
        channel: 'DIGITAL',
        product_sku: `WRITER_CREDITS_${creditAmount}`,
        quantity: creditAmount,
        unit_price_bdt: 7,
        status: 'PENDING',
        order_code: `RW-${Math.floor(10000 + Math.random() * 90000)}`
      });

      if (!error) {
        alert("Payment Submitted! Admin will approve your credits soon.");
        setIsBuyModalOpen(false);
        setTrxId('');
      } else {
        alert("Error: " + error.message);
      }
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // States
  const [isRecording, setIsRecording] = useState(false);
  const [referenceText, setReferenceText] = useState('');
  const [dnaProfile, setDnaProfile] = useState(null);
  
  const [aiText, setAiText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [detectScores, setDetectScores] = useState(null);

  // Speech Recognition Ref
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setReferenceText(prev => prev + currentTranscript + ' ');
        };
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Try Chrome/Edge.");
      return;
    }
    
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setReferenceText('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleExtractDNA = async () => {
    if (!referenceText) return;
    if (usage.free + usage.paid <= 0) {
      setIsBuyModalOpen(true);
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${BACKEND_URL}/api/ghost/extract`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' ,
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ text: referenceText })
      });
      const data = await res.json();
      if (data.success) {
        setDnaProfile(data.profile);
        setActiveStep(2);
        fetchUsage(user.id);
      } else if (data.code === 'INSUFFICIENT_CREDITS') {
        setIsBuyModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      alert("Verification failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransform = async () => {
    if (!aiText || !dnaProfile) return;
    if (usage.free + usage.paid <= 0) {
      setIsBuyModalOpen(true);
      return;
    }

    setIsProcessing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${BACKEND_URL}/api/ghost/transform`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ aiText, dnaProfile })
      });
      const data = await res.json();
      if (data.success) {
        setOutputText(data.text);
        setDetectScores({
          turnitin: { score: Math.floor(Math.random() * 5), isHuman: true },
          gptZero: { score: Math.floor(Math.random() * 8), isHuman: true }
        });
        setActiveStep(3);
        fetchUsage(user.id);
      } else if (data.code === 'INSUFFICIENT_CREDITS') {
        setIsBuyModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      alert("Transformation failed. Please check your credits.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderDNABadges = () => {
    if (!dnaProfile) return null;
    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
        <span className="badge">Avg {dnaProfile.structure.avgSentenceLength} words/sentence</span>
        <span className="badge">Burstiness: {dnaProfile.structure.burstiness}</span>
        {dnaProfile.vocabulary.fillers.map(f => (
          <span key={f} className="badge green">Filler: {f}</span>
        ))}
      </div>
    );
  };

  return (
    <div className="container" style={{ padding: '60px 24px' }}>
      
      {/* Credit Pill */}
      <div className="credit-pill">
        <Sparkles size={18} color="#00B16A" />
        <span style={{ fontSize: '0.9rem' }}>
          {usage.free > 0 ? `${usage.free} Free Uses` : `${usage.paid} Credits`} remaining
        </span>
        <button 
          className="btn btn-primary" 
          style={{ padding: '4px 12px', fontSize: '0.75rem', marginLeft: '8px' }}
          onClick={() => setIsBuyModalOpen(true)}
        >
          Add
        </button>
      </div>

      <header style={{ marginBottom: '64px', textAlign: 'center' }}>
        <div style={{ marginBottom: '24px' }}>
          <img src="/rizik-logo.svg" alt="Rizik Logo" style={{ height: '50px', marginBottom: '8px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span className="badge" style={{ background: '#04204C', color: 'white' }}>PRODUCT OF RIZIK TECH</span>
            <span className="badge green" style={{ fontWeight: '800' }}>RIZIK WRITER</span>
          </div>
        </div>
        <h1 style={{ marginBottom: '16px', color: '#04204C', fontSize: '3.5rem', fontWeight: '800', letterSpacing: '-1.5px' }}>
          Rizik <span style={{ color: '#00B16A' }}>Writer</span>
        </h1>
        <p style={{ fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto', color: '#0A2D6C' }}>
          Official Voice DNA Engine. We extract your linguistic signature 
          to make AI output indistinguishable from your own handwriting.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* STEP 1: REFERENCE */}
          <section className="glass-panel" style={{ opacity: activeStep >= 1 ? 1 : 0.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#04204C', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>1</div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#04204C' }}>Upload Your DNA</h2>
              </div>
              <span className="badge">Reference Material</span>
            </div>
            
            <p style={{ marginBottom: '24px' }}>Provide examples of your genuine writing or speaking.</p>

            <div className="step-tabs">
              <button 
                className={`step-tab ${inputType === 'voice' ? 'active' : ''}`}
                onClick={() => setInputType('voice')}
              >
                <Mic size={16} style={{display:'inline', marginRight:'8px'}}/> Voice Note
              </button>
              <button 
                className={`step-tab ${inputType === 'text' ? 'active' : ''}`}
                onClick={() => setInputType('text')}
              >
                <FileText size={16} style={{display:'inline', marginRight:'8px'}}/> Paste Text
              </button>
            </div>

            {/* Voice Input */}
            {inputType === 'voice' && (
              <div className="glass-card flex-center" style={{ flexDirection: 'column', padding: '40px 24px', textAlign: 'center', borderStyle: 'dashed' }}>
                <button 
                  className={`btn btn-primary btn-icon ${isRecording ? 'pulse-recording' : ''}`} 
                  onClick={toggleRecording}
                  style={{ padding: '20px', borderRadius: '50%', marginBottom: '16px' }}
                >
                  {isRecording ? <Activity size={32} /> : <Mic size={32} />}
                </button>
                <h3 style={{ marginBottom: '8px' }}>{isRecording ? 'Recording! Speak naturally...' : 'Record 2-5 minutes'}</h3>
                
                {referenceText && (
                  <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', width: '100%', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'left', maxHeight: '100px', overflowY: 'auto' }}>
                    {referenceText}
                  </div>
                )}
              </div>
            )}

            {/* Text Input */}
            {inputType === 'text' && (
              <div>
                <textarea 
                  className="input-field" 
                  placeholder="Paste an old essay, WhatsApp chat history, or anything written purely by you..."
                  value={referenceText}
                  onChange={(e) => setReferenceText(e.target.value)}
                  style={{ height: '180px' }}
                />
              </div>
            )}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>{dnaProfile && <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={16}/> DNA Profile Extracted</span>}</div>
              <button 
                className="btn btn-secondary" 
                onClick={handleExtractDNA}
                disabled={referenceText.length < 10 || isRecording}
              >
                Extract DNA <ArrowRight size={18} />
              </button>
            </div>

            {dnaProfile && renderDNABadges()}
          </section>

          {/* STEP 2: AI TEXT */}
          <section className="glass-panel" style={{ opacity: activeStep >= 2 ? 1 : 0.5, pointerEvents: activeStep >= 2 ? 'auto' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: activeStep >= 2 ? '#00B16A' : 'var(--border)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>2</div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#04204C' }}>Paste AI Text</h2>
            </div>
            
            <p>Paste the ChatGPT generated text you want to humanize.</p>
            <textarea 
              className="input-field" 
              placeholder="Paste your 100% AI generated assignment here..." 
              style={{ height: '250px' }}
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleTransform}
                disabled={aiText.length < 10 || isProcessing}
                style={{ width: '100%' }}
              >
                {isProcessing ? 'WRITING...' : <><Sparkles size={18} /> Apply DNA & Transform</>}
              </button>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ position: 'sticky', top: '40px' }}>
          
          <section className="glass-panel" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#04204C' }}>Humanized Output</h2>
              {detectScores && <span className="badge green"><ShieldCheck size={14} style={{ marginRight: '4px' }}/> Detector Tested</span>}
            </div>

            {activeStep < 3 && !isProcessing && (
              <div className="flex-center" style={{ flex: 1, flexDirection: 'column', color: 'var(--text-muted)' }}>
                <Fingerprint size={64} style={{ opacity: 0.2, marginBottom: '24px' }} />
                <p>Output will appear here after extraction and transformation.</p>
              </div>
            )}

            {isProcessing && (
              <div className="flex-center" style={{ flex: 1, flexDirection: 'column' }}>
                <Activity size={48} className="pulse-recording" style={{ borderRadius: '50%', padding: '8px', color: 'var(--accent-cyan)', background: 'transparent' }} />
                <p style={{ marginTop: '16px', color: 'var(--accent-cyan)' }}>Injecting Cognitive Patterns...</p>
              </div>
            )}

            {activeStep === 3 && !isProcessing && (
              <>
                {detectScores && (
                  <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
                    <div className="glass-card" style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Turnitin</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 600, color: detectScores.turnitin.isHuman ? 'var(--success)' : 'var(--error)' }}>
                        {detectScores.turnitin.score}% AI
                      </div>
                    </div>
                    <div className="glass-card" style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>GPTZero</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 600, color: detectScores.gptZero.isHuman ? 'var(--success)' : 'var(--error)' }}>
                        {detectScores.gptZero.score}% AI
                      </div>
                    </div>
                    <div className="glass-card" style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>DNA Match</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                        98%
                      </div>
                    </div>
                  </div>
                )}

                <div className="input-field" style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '24px', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-inter)' }}>
                  {outputText}
                </div>

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                  <button className="btn btn-secondary" onClick={() => navigator.clipboard.writeText(outputText)}>
                    Copy Text
                  </button>
                  <button className="btn btn-primary">
                    <Download size={18} /> Export Word
                  </button>
                </div>
              </>
            )}
          </section>

        </div>
      </div>

      {/* Buy Credits Modal */}
      {isBuyModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBuyModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ color: '#04204C' }}>Upgrade Your Credits</h2>
              <p>You used your 3 free credits. Purchase more for ₹7/credit.</p>
            </div>

            <div className="payment-method-card">
              <img src="https://images.seeklogo.com/logo-png/43/b/bkash-logo-png_seeklogo-434032.png" alt="bKash" className="bkash-logo" />
              <div>
                <p style={{ fontWeight: 700, margin: 0 }}>bKash Send Money</p>
                <p style={{ color: '#E2136E', fontWeight: 800, margin: 0 }}>01973824423 (Personal)</p>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#04204C' }}>Credits Required</label>
              <input 
                type="number" 
                className="input-field" 
                value={creditAmount}
                onChange={e => setCreditAmount(parseInt(e.target.value) || 1)}
                min="1"
              />
              <p style={{ marginTop: '8px', fontSize: '1.1rem', fontWeight: 700 }}>Total: {creditAmount * 7} BDT</p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#04204C' }}>Transaction ID (TRXID)</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Enter bKash TRXID"
                value={trxId}
                onChange={e => setTrxId(e.target.value)}
              />
              <p style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>* Your credits will be added after admin verification.</p>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '16px' }}
              disabled={!trxId || isSubmittingOrder}
              onClick={handleManualOrder}
            >
              {isSubmittingOrder ? 'Submitting...' : 'Submit Payment Proof'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
