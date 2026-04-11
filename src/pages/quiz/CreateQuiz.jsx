import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Calendar } from 'primereact/calendar';
import quizApi from '../../services/quizApi';
import toast from 'react-hot-toast';
import { Dialog } from 'primereact/dialog';
import { ProgressBar } from 'primereact/progressbar';
import { FileUpload } from 'primereact/fileupload';
import axios from 'axios';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDFJS worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const CreateQuiz = () => {
  const [title, setTitle] = useState('');
  const [isCreated, setIsCreated] = useState(false);
  const [quizId, setQuizId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  // New Question form
  const [metadata, setMetadata] = useState({
    description: '',
    duration_minutes: 30,
    whitelist: '', // Comma or newline separated
    access_key: '', // Optional entry key
    start_time: null,
    end_time: null
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 1,
    type: 'mcq'
  });

  const [aiDialogVisible, setAiDialogVisible] = useState(false);
  const [aiStatus, setAiStatus] = useState({ loading: false, stage: '' });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedAiQuestions, setSelectedAiQuestions] = useState([]);
  const [numQuestions, setNumQuestions] = useState(5);
  const [isAdding, setIsAdding] = useState(false);

  const user = JSON.parse(localStorage.getItem('quiz_user'));
  const navigate = useNavigate();

  useEffect(() => {
    if (editId) {
      loadQuizToEdit();
    }
  }, [editId]);

  const loadQuizToEdit = async () => {
    try {
      const data = await quizApi.getQuiz(editId);
      if (data.success) {
        setTitle(data.quiz.title);
        setMetadata({
          description: data.quiz.description || '',
          duration_minutes: data.quiz.duration_minutes || 30,
          whitelist: '',
          access_key: data.quiz.access_key || '',
          start_time: data.quiz.start_time ? new Date(data.quiz.start_time) : null,
          end_time: data.quiz.end_time ? new Date(data.quiz.end_time) : null
        });
        setQuestions(data.questions);
        setQuizId(data.quiz.id);
        setIsCreated(true);
      }
    } catch (err) {
      toast.error("Failed to load quiz for editing");
    }
  };

  const handleCreateQuiz = async () => {
    if (!title) return toast.error("Quiz title is required");
    try {
      let data;
      const payload = {
        title,
        description: metadata.description,
        duration_minutes: metadata.duration_minutes,
        access_key: metadata.access_key,
        start_time: metadata.start_time,
        end_time: metadata.end_time
      };

      if (editId) {
        data = await quizApi.updateQuiz(editId, payload);
      } else {
        data = await quizApi.createQuiz(title, user?.id || null, payload);
      }

      if (data.success) {
        setQuizId(data.quiz.id || editId);
        
        // Handle whitelist if provided
        if (metadata.whitelist.trim()) {
          const emailList = metadata.whitelist.split(/[,\n]/).map(e => e.trim()).filter(e => e);
          await quizApi.updateWhitelist(data.quiz.id || editId, emailList);
        }

        setIsCreated(true);
        toast.success(editId ? "Quiz updated!" : "Quiz configuration saved!");
      }
    } catch (err) {
      toast.error(editId ? "Failed to update quiz" : "Failed to create quiz");
    }
  };

  const handleAddQuestion = async () => {
    if (!currentQuestion.question || !currentQuestion.correct_answer) {
      return toast.error("Question text and correct answer are required");
    }
    
    if (currentQuestion.type !== 'fill_in_the_blanks') {
      if (currentQuestion.options.some(opt => !opt)) {
        return toast.error("All options must be filled for this question type");
      }
    }

    try {
      setIsAdding(true);
      const data = await quizApi.addQuestion(quizId, currentQuestion);
      if (data.success) {
        setQuestions([...questions, data.question]);
        setCurrentQuestion({
          question: '',
          options: ['', '', '', ''],
          correct_answer: '',
          points: 1,
          type: 'mcq'
        });
        toast.success("Question added!");
      }
    } catch (err) {
      toast.error("Failed to add question");
    } finally {
      setIsAdding(false);
    }
  };

  const extractTextFromFile = async (file) => {
    const fileType = file.type || file.name.split('.').pop();
    
    if (fileType === 'application/pdf' || file.name.endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
      }
      return text;
    } 
    
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    return await file.text();
  };

  const handleAiGeneration = async (event) => {
    const file = event.files[0];
    if (!file) return;

    setAiStatus({ loading: true, stage: 'Reading document...' });
    try {
      const text = await extractTextFromFile(file);
      if (text.length < 50) throw new Error("Document is too short for intelligent generation.");

      setAiStatus({ loading: true, stage: 'AI Brainstorming...' });
      
      const prompt = `Based on the following study notes, generate exactly ${numQuestions} high-quality, professional multiple-choice questions (MCQs).
      Each question must have exactly 4 options and one clear correct answer.
      
      Output MUST be a valid raw JSON array of objects with this structure:
      [
        {
          "question": "question text",
          "options": ["opt1", "opt2", "opt3", "opt4"],
          "correct_answer": "exactly matching one of the options",
          "type": "mcq",
          "points": 1
        }
      ]
      
      IMPORTANT: Return ONLY the JSON array. Do not include any explanations or intro text.
      
      DOCUMENT TEXT:
      ${text.substring(0, 4000)}`;

      const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
        response_format: { type: "json_object" }
      }, {
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' }
      });

      let aiResponse = res.data.choices[0].message.content;
      // Handle cases where AI wraps json in a key
      let parsed;
      try {
        parsed = JSON.parse(aiResponse);
        if (parsed.questions) parsed = parsed.questions;
        if (!Array.isArray(parsed)) {
            // some models return { "questions": [...] }
            parsed = Object.values(parsed).find(v => Array.isArray(v)) || [];
        }
      } catch (e) {
        toast.error("AI returned malformed data. Trying again...");
        return;
      }

      setGeneratedQuestions(parsed);
      setSelectedAiQuestions(parsed.map((_, i) => i)); // Select all by default
      toast.success("AI generated 5 questions!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "AI Generation failed.");
    } finally {
      setAiStatus({ loading: false, stage: '' });
    }
  };

  const addSelectedAiQuestions = async () => {
    const toAdd = generatedQuestions.filter((_, i) => selectedAiQuestions.includes(i));
    if (toAdd.length === 0) return toast.error("Please select at least one question");

    setAiStatus({ loading: true, stage: `Importing ${toAdd.length} questions...` });
    let successCount = 0;

    for (const q of toAdd) {
      try {
        const data = await quizApi.addQuestion(quizId, q);
        if (data.success) {
          setQuestions(prev => [...prev, data.question]);
          successCount++;
        }
      } catch (e) {
        console.error("Failed to add AI question:", q);
      }
    }

    toast.success(`Successfully imported ${successCount} questions!`);
    setAiDialogVisible(false);
    setGeneratedQuestions([]);
    setAiStatus({ loading: false, stage: '' });
  };

  const handleMultipleChoiceToggle = (opt) => {
    const currentAnswers = currentQuestion.correct_answer ? currentQuestion.correct_answer.split(',').filter(a => a) : [];
    let newAnswers;
    if (currentAnswers.includes(opt)) {
      newAnswers = currentAnswers.filter(a => a !== opt);
    } else {
      newAnswers = [...currentAnswers, opt];
    }
    setCurrentQuestion({ ...currentQuestion, correct_answer: newAnswers.sort().join(',') });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '40px 20px',
      color: '#f8fafc'
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <header style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 20 }}>
          <Button icon="pi pi-arrow-left" rounded text style={{ color: '#f8fafc' }} onClick={() => navigate('/quiz')} />
          <h1 style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Outfit' }}>
            {editId ? `Edit: ${title}` : "Create New Quiz"}
          </h1>
        </header>

        {!isCreated ? (
          <Card style={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="flex flex-column gap-2">
                <label style={{ fontWeight: 600, color: '#94a3b8' }}>Quiz Title</label>
                <InputText value={title} onChange={(e) => setTitle(e.target.value)} 
                           placeholder="e.g. Modern Web Development Trivia" 
                           style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155', color: '#fff', padding: 15, borderRadius: 12 }} />
              </div>

              <div className="flex flex-column gap-1">
                <label style={{ fontWeight: 600, color: '#94a3b8' }}>Description</label>
                <InputText value={metadata.description} onChange={(e) => setMetadata({...metadata, description: e.target.value})} 
                           placeholder="Briefly describe the quiz goals or rules..." 
                           style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155', color: '#fff', padding: 10, borderRadius: 12 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                <div className="flex flex-column gap-1">
                  <label style={{ fontWeight: 600, color: '#94a3b8' }}>Duration (Minutes)</label>
                  <InputNumber value={metadata.duration_minutes} onValueChange={(e) => setMetadata({...metadata, duration_minutes: e.value})} min={1} />
                </div>
                <div className="flex flex-column gap-1">
                  <label style={{ fontWeight: 600, color: '#94a3b8' }}>Access Restrictions</label>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>Leave whitelist empty for public access</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                <div className="flex flex-column gap-1">
                   <label style={{ fontWeight: 600, color: '#94a3b8' }}>Start Date & Time (Optional)</label>
                   <Calendar value={metadata.start_time} onChange={(e) => setMetadata({...metadata, start_time: e.value})} 
                             showTime hourFormat="12" placeholder="When should quiz start?"
                             style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155' }} />
                </div>
                <div className="flex flex-column gap-1">
                   <label style={{ fontWeight: 600, color: '#94a3b8' }}>End Date & Time (Optional)</label>
                   <Calendar value={metadata.end_time} onChange={(e) => setMetadata({...metadata, end_time: e.value})} 
                             showTime hourFormat="12" placeholder="When should quiz end?"
                             style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                <div className="flex flex-column gap-1">
                   <label style={{ fontWeight: 600, color: '#94a3b8' }}>Quiz Access Key (Optional)</label>
                   <InputText value={metadata.access_key} onChange={(e) => setMetadata({...metadata, access_key: e.target.value})} 
                              placeholder="e.g. EXAM2024"
                              style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155', color: '#fff' }} />
                </div>
                <div className="flex flex-column gap-1">
                  <label style={{ fontWeight: 600, color: '#94a3b8' }}>Hint</label>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>Shared users must enter this key to start.</div>
                </div>
              </div>

              <div className="flex flex-column gap-1">
                <label style={{ fontWeight: 600, color: '#94a3b8' }}>Allowed Student Emails (One per line)</label>
                <textarea 
                  value={metadata.whitelist} 
                  onChange={(e) => setMetadata({...metadata, whitelist: e.target.value})}
                  placeholder="student1@college.edu&#10;student2@college.edu"
                  style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155', color: '#fff', padding: 12, borderRadius: 12, height: 100, resize: 'none', fontFamily: 'monospace' }}
                />
              </div>

              <Button label={editId ? "Update Quiz Configuration" : "Save Configuration & Start Adding Questions"} onClick={handleCreateQuiz} 
                      style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', border: 'none', padding: 15, borderRadius: 12, fontWeight: 700 }} />
            </div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
            
            {/* AI Generator Banner */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                padding: '24px',
                borderRadius: 24,
                border: '1px solid rgba(139, 92, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'Outfit', fontWeight: 800 }}>AI Quiz Generator</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Generate professional questions instantly from your notes (PDF/Doc/Text).</p>
                </div>
                <Button label="Launch AI Studio" icon="pi pi-sparkles" 
                        onClick={() => setAiDialogVisible(true)}
                        style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', border: 'none', borderRadius: 12, fontWeight: 700 }} />
            </div>

            {/* AI Generation Dialog */}
            <Dialog 
                header={<div style={{ fontFamily: 'Outfit', fontWeight: 900 }}><i className="pi pi-sparkles mr-2" style={{color: '#8b5cf6'}}></i> AI Question Studio</div>} 
                visible={aiDialogVisible} 
                onHide={() => !aiStatus.loading && setAiDialogVisible(false)}
                style={{ width: '90vw', maxWidth: 800 }}
                footer={generatedQuestions.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: 15 }}>
                        <Button label="Cancel" text onClick={() => setAiDialogVisible(false)} />
                        <Button label={`Add ${selectedAiQuestions.length} Selected Questions`} 
                                icon="pi pi-plus" 
                                disabled={aiStatus.loading}
                                onClick={addSelectedAiQuestions}
                                style={{ background: '#10b981', border: 'none', borderRadius: 10 }} />
                    </div>
                )}
                contentStyle={{ background: '#0f172a', color: '#fff', position: 'relative' }}
                headerStyle={{ background: '#0f172a', color: '#fff', borderBottom: '1px solid #1e293b' }}
            >
                {aiStatus.loading && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '0 0 20px 20px'
                    }}>
                        <i className="pi pi-spin pi-sparkles" style={{ fontSize: '3rem', color: '#8b5cf6', marginBottom: 20 }}></i>
                        <h3 style={{ fontFamily: 'Outfit', fontWeight: 800 }}>{aiStatus.stage}</h3>
                        <p style={{ color: '#94a3b8' }}>Please wait while we finalize your questions...</p>
                    </div>
                )}
                
                {generatedQuestions.length === 0 ? (
                    <div style={{ padding: '20px 0', textAlign: 'center' }}>
                        {aiStatus.loading ? (
                            <div style={{ padding: 40 }}>
                                <i className="pi pi-cog pi-spin mb-4" style={{ fontSize: '3rem', color: '#3b82f6' }}></i>
                                <h3 style={{ fontFamily: 'Outfit' }}>{aiStatus.stage}</h3>
                                <p style={{ color: '#64748b' }}>Our AI is processing your document and preparing high-quality questions...</p>
                            </div>
                        ) : (
                            <div style={{ 
                                border: '2px dashed #334155', 
                                borderRadius: 20, 
                                padding: 60,
                                background: 'rgba(30, 41, 59, 0.4)'
                            }}>
                                <i className="pi pi-cloud-upload mb-4" style={{ fontSize: '4rem', color: '#3b82f6', opacity: 0.5 }}></i>
                                <h2 style={{ fontFamily: 'Outfit', fontWeight: 800 }}>Upload Study Notes</h2>
                                <p style={{ color: '#94a3b8', marginBottom: 20 }}>Support for PDF, DOCX, and TXT files. AI works best with structured text.</p>
                                
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15, marginBottom: 30 }}>
                                    <label style={{ fontWeight: 600, color: '#94a3b8' }}>Questions to generate:</label>
                                    <InputNumber value={numQuestions} onValueChange={(e) => setNumQuestions(e.value)} min={1} max={20} 
                                                 showButtons buttonLayout="horizontal" style={{ width: '120px' }}
                                                 decrementButtonClassName="p-button-secondary" incrementButtonClassName="p-button-secondary" incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus" />
                                </div>

                                <FileUpload mode="basic" auto chooseLabel="Generate Now" customUpload uploadHandler={handleAiGeneration} 
                                            accept=".pdf,.docx,.txt" maxFileSize={5000000} />
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 15, padding: '10px 0' }}>
                        <p style={{ color: '#94a3b8' }}>Review the questions generated by AI. Uncheck any you wish to discard.</p>
                        {generatedQuestions.map((q, i) => (
                            <div key={i} style={{ 
                                background: 'rgba(30, 41, 59, 1)', 
                                padding: 20, 
                                borderRadius: 16, 
                                border: `2px solid ${selectedAiQuestions.includes(i) ? '#3b82f6' : 'rgba(255,255,255,0.05)'}`,
                                cursor: 'pointer'
                            }} onClick={() => {
                                if (selectedAiQuestions.includes(i)) {
                                    setSelectedAiQuestions(selectedAiQuestions.filter(idx => idx !== i));
                                } else {
                                    setSelectedAiQuestions([...selectedAiQuestions, i]);
                                }
                            }}>
                                <div style={{ display: 'flex', gap: 15 }}>
                                    <div style={{ 
                                        width: 24, height: 24, borderRadius: 6, 
                                        background: selectedAiQuestions.includes(i) ? '#3b82f6' : 'transparent',
                                        border: '2px solid #334155',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {selectedAiQuestions.includes(i) && <i className="pi pi-check" style={{ fontSize: '0.8rem' }}></i>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, marginBottom: 10, fontSize: '1.1rem' }}>{q.question}</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                            {q.options.map((opt, j) => (
                                                <div key={j} style={{ 
                                                    fontSize: '0.8rem', 
                                                    color: opt === q.correct_answer ? '#10b981' : '#64748b',
                                                    padding: '4px 8px',
                                                    background: 'rgba(0,0,0,0.2)',
                                                    borderRadius: 6
                                                }}>
                                                    {opt} {opt === q.correct_answer && <i className="pi pi-check-circle ml-1"></i>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Dialog>

            {/* Question Entry Form */}
            <Card title={`Add Question ${questions.length + 1}`} style={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                  <div className="flex flex-column gap-2">
                    <label style={{ fontWeight: 600, color: '#94a3b8' }}>Question Type</label>
                    <select 
                      value={currentQuestion.type} 
                      onChange={(e) => setCurrentQuestion({...currentQuestion, type: e.target.value, options: (e.target.value === 'fill_in_the_blanks' ? [] : ['', '', '', '']), correct_answer: ''})}
                      style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155', color: '#fff', padding: 10, borderRadius: 10 }}
                    >
                      <option value="mcq">MCQ (Single Select)</option>
                      <option value="multiple">Multiple Choice (Multi Select)</option>
                      <option value="fill_in_the_blanks">Fill in the Blanks</option>
                    </select>
                  </div>
                  <div className="flex flex-column gap-2">
                    <label style={{ fontWeight: 600, color: '#94a3b8' }}>Points</label>
                    <InputNumber value={currentQuestion.points} onValueChange={(e) => setCurrentQuestion({...currentQuestion, points: e.value})} min={1} />
                  </div>
                </div>

                <div className="flex flex-column gap-2">
                   <label style={{ fontWeight: 600, color: '#94a3b8' }}>Question Text</label>
                   <InputText value={currentQuestion.question} 
                              onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                              placeholder="Type your question here..."
                              style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155', color: '#fff', padding: 12, borderRadius: 10 }} />
                </div>

                {currentQuestion.type !== 'fill_in_the_blanks' && (
                  <>
                    <label style={{ fontWeight: 600, color: '#94a3b8' }}>Options & Correct Answer(s)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                      {currentQuestion.options.map((opt, idx) => (
                        <div key={idx} style={{ 
                          display: 'flex', 
                          gap: 10, 
                          alignItems: 'center', 
                          background: 'rgba(15, 23, 42, 0.3)', 
                          padding: 10, 
                          borderRadius: 10,
                          border: `1.5px solid ${currentQuestion.correct_answer.split(',').includes(opt) && opt ? '#10b981' : 'transparent'}`
                        }}>
                          <div 
                            onClick={() => {
                              if (!opt) return;
                              if (currentQuestion.type === 'mcq') {
                                setCurrentQuestion({...currentQuestion, correct_answer: opt});
                              } else {
                                handleMultipleChoiceToggle(opt);
                              }
                            }}
                            style={{ 
                              width: 20, height: 20, borderRadius: currentQuestion.type === 'mcq' ? '50%' : '4px', 
                              border: `2px solid ${currentQuestion.correct_answer.split(',').includes(opt) && opt ? '#10b981' : '#334155'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }}
                          >
                            {currentQuestion.correct_answer.split(',').includes(opt) && opt && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></div>}
                          </div>
                          <InputText value={opt} 
                                     onChange={(e) => {
                                       const newOpts = [...currentQuestion.options];
                                       newOpts[idx] = e.target.value;
                                       setCurrentQuestion({...currentQuestion, options: newOpts});
                                     }}
                                     placeholder={`Choice ${idx + 1}`}
                                     style={{ background: 'transparent', border: 'none', color: '#fff', flex: 1, padding: 0 }} />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {currentQuestion.type === 'fill_in_the_blanks' && (
                  <div className="flex flex-column gap-2">
                    <label style={{ fontWeight: 600, color: '#94a3b8' }}>Correct Answer</label>
                    <InputText value={currentQuestion.correct_answer} 
                               onChange={(e) => setCurrentQuestion({...currentQuestion, correct_answer: e.target.value})}
                               placeholder="Type the exact expected answer"
                               style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #10b981', color: '#fff' }} />
                  </div>
                )}

                <Button label={isAdding ? "Adding..." : "Save Question"} 
                        icon={isAdding ? "pi pi-spin pi-spinner" : "pi pi-check"} 
                        disabled={isAdding}
                        onClick={handleAddQuestion}
                        style={{ background: '#10b981', border: 'none', padding: 12, borderRadius: 10, marginTop: 10 }} />
              </div>
            </Card>

            <Divider align="center"><span style={{ color: '#64748b' }}>Questions Added</span></Divider>

            {/* List of added questions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              {questions.map((q, i) => (
                <div key={q.id} style={{ background: 'rgba(30, 41, 59, 0.4)', padding: 20, borderRadius: 15, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>{q.type || 'mcq'}</span>
                      <span style={{ fontWeight: 700 }}>Q{i+1}: {q.question}</span>
                    </div>
                    <span style={{ color: '#10b981', fontSize: '0.8rem' }}>{q.points} pts</span>
                  </div>
                  {q.type !== 'fill_in_the_blanks' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 15 }}>
                      {(q.options || []).map((opt, j) => {
                        const isCorrect = (q.correct_answer || '').split(',').map(a => a.trim()).includes(opt.trim());
                        return (
                          <div key={j} style={{ 
                            fontSize: '0.75rem', 
                            color: isCorrect ? '#10b981' : '#64748b', 
                            background: 'rgba(0,0,0,0.2)', 
                            padding: '6px 10px', 
                            borderRadius: 6,
                            border: `1px solid ${isCorrect ? '#10b981' : 'transparent'}`
                          }}>
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {q.type === 'fill_in_the_blanks' && (
                    <div style={{ marginTop: 10, fontSize: '0.8rem', color: '#10b981' }}>
                      Correct: <b>{q.correct_answer}</b>
                    </div>
                  )}
                </div>
              ))}
              
              {questions.length > 0 && (
                <Button label="Finish and Publish" icon="pi pi-rocket" onClick={() => navigate('/quiz')} 
                        style={{ marginTop: 20, background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', border: 'none', padding: 15, borderRadius: 12 }} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateQuiz;
