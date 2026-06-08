import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, BookOpen, ChevronDown, ChevronRight, ClipboardList, Edit3, FileText, GripVertical,
  Layers, Loader2, Play, Plus, Save, Trash2, Video, X, Settings, Info, Search, ExternalLink,
  PlusCircle, Layout, CheckCircle2, Clock, Hash
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useAdminCourse, useUpdateAdminCourse,
  useCreateAdminUnit, useUpdateAdminUnit, useDeleteAdminUnit,
  useCreateAdminLesson, useUpdateAdminLesson, useDeleteAdminLesson,
} from "../../features/admin/courses/hooks";
import { getErrorMessage } from "../../api/error";
import { 
  useAdminExams, useUpdateAdminExam, useCreateAdminExam, 
  useAdminExamById, useAddAdminExamQuestion, useUpdateAdminExamQuestion, useDeleteAdminExamQuestion 
} from "../../features/admin/exams/hooks";
import toast from "react-hot-toast";

/* ─── Question Card (For Drawer) ─── */
function QuestionCard({ question, examId, index }) {
  const updateMutation = useUpdateAdminExamQuestion();
  const deleteMutation = useDeleteAdminExamQuestion();

  const [text, setText] = useState(question.questionText || "");
  const [type, setType] = useState(question.type || "MULTIPLE_CHOICE");
  const [points, setPoints] = useState(question.points || 1);
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer || "");
  const [options, setOptions] = useState(question.options || ["", "", "", ""]);
  const [dirty, setDirty] = useState(false);

  const markDirty = (setter) => (val) => { setter(val); setDirty(true); };

  const save = async () => {
    try {
      const body = { questionText: text, type, points: Number(points), correctAnswer };
      if (type === "MULTIPLE_CHOICE") body.options = options.filter((o) => o.trim());
      await updateMutation.mutateAsync({ examId, questionId: question.id, body });
      setDirty(false);
      toast.success(`Q${index + 1} saved`);
    } catch (err) { toast.error(getErrorMessage(err, "Failed to save")); }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-[#0F0F13]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-900 dark:text-white">Question {index + 1}</span>
        <div className="flex gap-2">
          {dirty && (
            <button onClick={save} disabled={updateMutation.isPending} className="text-[10px] font-bold text-[#B91C1C] hover:underline">
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          )}
          <button 
            onClick={() => deleteMutation.mutate({ examId, questionId: question.id })} 
            className="text-slate-400 hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <textarea 
        value={text} 
        onChange={(e) => markDirty(setText)(e.target.value)} 
        className="mb-3 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-[#B91C1C]/30 dark:border-white/5 dark:bg-[#1A1A22] dark:text-white"
        placeholder="Question text..."
        rows={2}
      />
      <div className="grid grid-cols-2 gap-3">
        <select value={type} onChange={(e) => markDirty(setType)(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-white/5 dark:bg-[#1A1A22] dark:text-white">
          <option value="MULTIPLE_CHOICE">MCQ</option>
          <option value="TRUE_FALSE">True/False</option>
          <option value="SHORT_ANSWER">Short Answer</option>
        </select>
        <input type="number" value={points} onChange={(e) => markDirty(setPoints)(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-white/5 dark:bg-[#1A1A22] dark:text-white" placeholder="Points" />
      </div>
    </div>
  );
}

/* ─── Exam Editor Drawer ─── */
function ExamEditorDrawer({ examId, onClose }) {
  const { data: exam, isLoading } = useAdminExamById(examId);
  const addQuestionMutation = useAddAdminExamQuestion();

  const handleAdd = async () => {
    try {
      await addQuestionMutation.mutateAsync({
        examId,
        body: { questionText: "New Question", type: "MULTIPLE_CHOICE", points: 10, order: (exam?.questions?.length || 0) + 1, options: ["", "", "", ""], correctAnswer: "" }
      });
      toast.success("Question added");
    } catch (err) { toast.error("Failed to add question"); }
  };

  if (!examId) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[60] w-full max-w-md border-l border-slate-200 bg-white shadow-2xl transition-transform dark:border-white/8 dark:bg-[#1A1A22]">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{exam?.title || "Loading..."}</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Question Bank Editor</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-50 dark:hover:bg-white/5">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading ? (
            <div className="flex py-20 justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#B91C1C]" /></div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Questions ({exam.questions?.length || 0})</span>
                <button onClick={handleAdd} className="text-[10px] font-bold text-[#B91C1C] hover:underline">+ Add Question</button>
              </div>
              {(exam.questions || []).map((q, i) => (
                <QuestionCard key={q.id} question={q} examId={examId} index={i} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useForm, useFieldArray } from "react-hook-form";

/* ─── In-Context Exam Builder Modal ─── */
function InContextExamBuilder({ targetId, targetType, onClose }) {
  const { id: courseId } = useParams();
  const queryClient = useQueryClient();
  const createExamMutation = useCreateAdminExam();
  const addQuestionMutation = useAddAdminExamQuestion();
  const [step, setStep] = useState(1);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: "",
      type: targetType === 'course' ? 'FINAL' : targetType === 'unit' ? 'UNIT' : 'LESSON',
      durationMinutes: 60,
      passingScore: 60,
      questions: [{ questionText: "", type: "MULTIPLE_CHOICE", points: 10, options: ["", "", "", ""], correctAnswer: "0" }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "questions" });

  // Force options for T/F questions
  const watchedQuestions = watch("questions");
  useEffect(() => {
    watchedQuestions?.forEach((q, index) => {
      if (q.type === "TRUE_FALSE" && (q.options?.length !== 2 || q.options[0] !== "True")) {
        setValue(`questions.${index}.options`, ["True", "False"]);
      }
    });
  }, [watchedQuestions, setValue]);

  // Debugging validation errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.warn("Exam Builder Validation Errors:", errors);
    }
  }, [errors]);

  const onSubmit = async (data) => {
    try {
      // Step 1: Create the exam WITHOUT questions
      const examBody = {
        title: data.title,
        type: data.type,
        durationMinutes: Number(data.durationMinutes),
        passingScore: Number(data.passingScore),
        status: 'AVAILABLE',
        totalPoints: data.questions.reduce((sum, q) => sum + Number(q.points), 0),
      };
      if (targetType === 'course') examBody.courseId = targetId;
      if (targetType === 'unit') examBody.unitId = targetId;
      if (targetType === 'lesson') examBody.lessonId = targetId;

      const createdExam = await createExamMutation.mutateAsync(examBody);

      // Step 2: Add each question separately
      const examId = createdExam?.id;
      if (examId && data.questions.length > 0) {
        for (let i = 0; i < data.questions.length; i++) {
          const q = data.questions[i];
          await addQuestionMutation.mutateAsync({
            examId,
            body: {
              questionText: q.questionText,
              type: q.type,
              points: Number(q.points),
              order: i + 1,
              options: q.type === "MULTIPLE_CHOICE"
                ? q.options.filter(o => o.trim())
                : ["True", "False"],
              correctAnswer: q.type === "MULTIPLE_CHOICE"
                ? q.options[Number(q.correctAnswer)]
                : q.correctAnswer,
            }
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ["admin", "course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "exams"] });

      toast.success("Exam created and linked successfully!");
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create exam"));
    }
  };

  const isPending = createExamMutation.isPending || addQuestionMutation.isPending;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm font-jakarta antialiased">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/8 dark:bg-[#1A1A22] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-white/5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">Build {targetType} Exam</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Step {step} of 2: {step === 1 ? 'Exam Settings' : 'Question Bank'}</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-white/5">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {step === 1 ? (
              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Exam Title</span>
                  <input 
                    {...register("title", { required: "Title is required" })}
                    placeholder="e.g. Midterm Assessment" 
                    className={`h-11 w-full rounded-xl border px-4 text-sm font-medium outline-none transition-all ${
                      errors.title ? "border-red-500 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-[#B91C1C]"
                    } dark:border-white/10 dark:bg-[#0F0F13] dark:text-white`}
                  />
                  {errors.title && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.title.message}</p>}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duration (Min)</span>
                    <input 
                      type="number"
                      {...register("durationMinutes", { required: true })}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#B91C1C] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" 
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Passing Score</span>
                    <input 
                      type="number"
                      {...register("passingScore", { required: true })}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#B91C1C] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" 
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Questions Bank ({fields.length})</span>
                  <button 
                    type="button"
                    onClick={() => append({ questionText: "", type: "MULTIPLE_CHOICE", points: 10, options: ["", "", "", ""], correctAnswer: "0" })}
                    className="text-[10px] font-bold text-[#B91C1C] hover:underline"
                  >
                    + Add New Question
                  </button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="relative rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-white/5 dark:bg-white/2">
                      <button 
                        type="button" 
                        onClick={() => remove(index)}
                        className="absolute right-4 top-4 text-slate-300 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="mb-4 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#B91C1C] text-[10px] font-bold text-white">{index + 1}</span>
                        <input 
                          {...register(`questions.${index}.questionText`, { required: "Question text is required" })}
                          placeholder="What is the capital of..."
                          className={`flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-slate-300 ${
                            errors.questions?.[index]?.questionText ? "text-red-500" : "text-slate-900 dark:text-white"
                          }`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <input 
                          type="number"
                          {...register(`questions.${index}.points`)}
                          placeholder="Points"
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none dark:border-white/5 dark:bg-[#0F0F13] dark:text-white"
                        />
                        <select 
                          {...register(`questions.${index}.type`)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none dark:border-white/5 dark:bg-[#0F0F13] dark:text-white"
                        >
                          <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                          <option value="TRUE_FALSE">True/False</option>
                        </select>
                      </div>
                      
                      {watch(`questions.${index}.type`) === "MULTIPLE_CHOICE" && (
                        <div className="grid grid-cols-2 gap-2">
                          {[0, 1, 2, 3].map(optIndex => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                value={String(optIndex)} 
                                {...register(`questions.${index}.correctAnswer`)}
                                className="accent-[#B91C1C]"
                              />
                              <input 
                                {...register(`questions.${index}.options.${optIndex}`, { required: "Option is required" })}
                                placeholder={`Option ${optIndex + 1}`}
                                className={`h-8 flex-1 rounded-lg border px-3 text-[11px] outline-none transition-all ${
                                  errors.questions?.[index]?.options?.[optIndex] ? "border-red-500 bg-red-50" : "border-slate-200 bg-white dark:border-white/5 dark:bg-[#0F0F13] dark:text-white"
                                }`}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {watch(`questions.${index}.type`) === "TRUE_FALSE" && (
                        <div className="grid grid-cols-2 gap-3">
                          {["True", "False"].map((label, optIndex) => (
                            <label 
                              key={label}
                              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 py-3 transition-all ${
                                watch(`questions.${index}.correctAnswer`) === String(optIndex)
                                  ? "border-[#B91C1C] bg-[#B91C1C]/5 font-bold text-[#B91C1C]"
                                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-[#0F0F13]"
                              }`}
                            >
                              <input 
                                type="radio"
                                value={String(optIndex)}
                                {...register(`questions.${index}.correctAnswer`)}
                                className="hidden"
                              />
                              <CheckCircle2 className={`h-4 w-4 ${watch(`questions.${index}.correctAnswer`) === String(optIndex) ? "opacity-100" : "opacity-0"}`} />
                              <span className="text-sm">{label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-white/5 dark:bg-white/2">
            <div className="flex justify-between gap-3">
              {step === 2 && (
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="rounded-xl border border-slate-200 px-6 py-2.5 text-xs font-bold text-slate-500 hover:bg-white dark:border-white/10"
                >
                  Back to Settings
                </button>
              )}
              <div className="flex flex-1 justify-end gap-3">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="rounded-xl px-6 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
                {step === 1 ? (
                  <button 
                    type="button" 
                    onClick={() => setStep(2)} 
                    className="rounded-xl bg-[#B91C1C] px-8 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-500/20 hover:bg-[#991B1B]"
                  >
                    Next: Build Questions
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    disabled={isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#B91C1C] px-10 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-500/20 hover:bg-[#991B1B] disabled:opacity-50"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save & Link Exam
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Exam Manager Component ─── */
function ExamManager({ targetId, targetType, linkedExams, onRefresh }) {
  const { id: courseId } = useParams();
  const queryClient = useQueryClient();
  const [showSearch, setShowSearch] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);
  const [examSearch, setExamSearch] = useState("");

  const { data: examsData } = useAdminExams({ page: 1, limit: 200 });
  const updateExamMutation = useUpdateAdminExam();
  
  const allExams = examsData?.exams || [];
  
  const filteredExams = useMemo(() => {
    return allExams.filter(e => {
      const isLinked = e.courseId || e.unitId || e.lessonId;
      if (isLinked) return false;
      if (!examSearch.trim()) return true;
      return e.title.toLowerCase().includes(examSearch.toLowerCase());
    });
  }, [allExams, examSearch]);

  const handleLink = async (examId) => {
    try {
      const body = {};
      if (targetType === 'course') body.courseId = targetId;
      if (targetType === 'unit') body.unitId = targetId;
      if (targetType === 'lesson') body.lessonId = targetId;
      await updateExamMutation.mutateAsync({ id: examId, body });
      
      queryClient.invalidateQueries({ queryKey: ["admin", "course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "exams"] });
      
      setShowSearch(false);
      toast.success("Exam linked");
    } catch (err) { toast.error("Failed to link exam"); }
  };

  const handleUnlink = async (examId) => {
    try {
      const body = {};
      if (targetType === 'course') body.courseId = null;
      if (targetType === 'unit') body.unitId = null;
      if (targetType === 'lesson') body.lessonId = null;
      await updateExamMutation.mutateAsync({ id: examId, body });
      
      queryClient.invalidateQueries({ queryKey: ["admin", "course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "exams"] });
      
      toast.success("Exam unlinked");
    } catch (err) { toast.error("Failed to unlink exam"); }
  };

  return (
    <div className="space-y-4 border-t border-slate-200 pt-6 dark:border-white/8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-purple-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Assessment</span>
        </div>
      </div>

      {linkedExams.length > 0 ? (
        <div className="space-y-3">
          {linkedExams.map((exam) => (
            <div key={exam.id} className="group relative overflow-hidden rounded-xl border border-purple-200 bg-white p-4 transition-all hover:border-purple-300 hover:shadow-md dark:border-purple-500/20 dark:bg-[#0F0F13]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10">
                  <Layout className="h-4 w-4" />
                </div>
                <button onClick={() => handleUnlink(exam.id)} className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{exam.title}</h4>
              <div className="mt-2 flex items-center gap-3 text-[10px] font-medium text-slate-500">
                <span className="flex items-center gap-1"><Hash className="h-3 w-3" /> {exam._count?.questions || 0} Qs</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {exam.durationMinutes || 60} min</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => setEditingExamId(exam.id)}
                  className="flex-1 rounded-lg bg-purple-600 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-purple-700"
                >
                  Edit Questions
                </button>
                <Link 
                  to={`/admin/exams/${exam.id}/submissions`}
                  className="flex items-center justify-center rounded-lg border border-slate-200 px-2 py-2 text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center dark:border-white/10">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-xs font-bold text-slate-500">No exam attached</p>
          <p className="mt-1 text-[10px] text-slate-400">Assess students at this level.</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button 
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#B91C1C] py-2 text-[11px] font-bold text-white hover:bg-[#991B1B]"
            >
              <PlusCircle className="h-3.5 w-3.5" /> Create New
            </button>
            <button 
              onClick={() => setShowSearch(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-white"
            >
              <Search className="h-3.5 w-3.5" /> Link Existing
            </button>
          </div>
        </div>
      )}

      {showCreate && (
        <InContextExamBuilder 
          targetId={targetId} 
          targetType={targetType} 
          onClose={() => setShowCreate(false)} 
        />
      )}

      {showSearch && (
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <input 
              autoFocus
              value={examSearch}
              onChange={(e) => setExamSearch(e.target.value)}
              placeholder="Search standalone exams..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-purple-500 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            />
            <button onClick={() => setShowSearch(false)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
          </div>
          <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-100 bg-white shadow-lg dark:border-white/5 dark:bg-[#1A1A22]">
            {filteredExams.map(exam => (
              <button key={exam.id} onClick={() => handleLink(exam.id)} className="flex w-full items-center justify-between px-3 py-2 text-start text-[11px] hover:bg-slate-50 dark:hover:bg-white/5">
                <span className="font-medium text-slate-900 dark:text-white">{exam.title}</span>
                <Plus className="h-3 w-3 text-purple-500" />
              </button>
            ))}
            {filteredExams.length === 0 && <p className="p-3 text-[10px] text-slate-400">No available exams found.</p>}
          </div>
        </div>
      )}

      <ExamEditorDrawer examId={editingExamId} onClose={() => setEditingExamId(null)} />
    </div>
  );
}

/* ─── Lesson Row ─── */
function LessonRow({ lesson, isSelected, onSelect, onDelete }) {
  return (
    <div
      className={`group flex w-full items-center gap-2 rounded-lg transition-all ${
        isSelected
          ? "bg-[#B91C1C]/10 text-[#B91C1C] font-bold dark:bg-[#B91C1C]/20 dark:text-red-300"
          : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5"
      }`}
    >
      <button
        onClick={() => onSelect(lesson)}
        className="flex flex-1 items-center gap-2 px-3 py-2 text-start text-sm outline-none"
      >
        <GripVertical className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" />
        <FileText className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">{lesson.title}</span>
        {lesson.videoUrl && <Video className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(lesson.id); }}
        className="mr-2 rounded p-0.5 text-slate-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ─── Unit Accordion ─── */
function UnitAccordion({ unit, isSelected, onSelect, selectedLessonId, onSelectLesson, onDeleteUnit, onDeleteLesson, onAddLesson, onRenameUnit, isAddingLesson }) {
  const [open, setOpen] = useState(true);

  return (
    <div className={`rounded-xl border transition-all ${isSelected ? 'border-[#B91C1C]/30 bg-[#B91C1C]/5 ring-1 ring-[#B91C1C]/10' : 'border-slate-200 bg-white dark:border-white/8 dark:bg-[#1A1A22]'}`}>
      <div 
        onClick={() => onSelect(unit)}
        className="flex cursor-pointer items-center gap-2 p-3"
      >
        <button 
          onClick={(e) => { e.stopPropagation(); setOpen(!open); }} 
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
        >
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <Layers className={`h-4 w-4 shrink-0 ${isSelected ? 'text-[#B91C1C]' : 'text-slate-400'}`} />
        <InlineEdit
          value={unit.title}
          onSave={(v) => onRenameUnit(unit.id, v)}
          placeholder="Untitled Unit"
          className={`flex-1 text-sm font-bold ${isSelected ? 'text-[#B91C1C]' : 'text-slate-900 dark:text-white'}`}
        />
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-400">
          {unit.lessons?.length || 0} lessons
        </span>
        <button onClick={(e) => { e.stopPropagation(); onDeleteUnit(unit.id); }} className="rounded p-1 text-slate-400 hover:text-red-500">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 px-3 pb-3 pt-1 dark:border-white/5">
          <div className="space-y-0.5">
            {(unit.lessons || []).map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                isSelected={selectedLessonId === lesson.id}
                onSelect={onSelectLesson}
                onDelete={onDeleteLesson}
              />
            ))}
          </div>
          <button
            disabled={isAddingLesson}
            onClick={(e) => { e.stopPropagation(); onAddLesson(unit.id, (unit.lessons?.length || 0) + 1); }}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-[#B91C1C] transition-colors hover:bg-[#B91C1C]/10 disabled:opacity-50"
          >
            {isAddingLesson ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            Add Lesson
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Inline Editable Field ─── */
function InlineEdit({ value, onSave, placeholder, className = "" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");

  const commit = () => {
    setEditing(false);
    if (draft.trim() && draft.trim() !== value) onSave(draft.trim());
    else setDraft(value || "");
  };

  if (!editing) {
    return (
      <button onClick={(e) => { e.stopPropagation(); setDraft(value || ""); setEditing(true); }} className={`group inline-flex items-center gap-1.5 text-start ${className}`}>
        <span className={value ? "" : "italic text-slate-400"}>{value || placeholder}</span>
        <Edit3 className="h-3 w-3 shrink-0 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
    );
  }

  return (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(value || ""); setEditing(false); } }}
      className={`rounded border border-[#B91C1C]/40 bg-transparent px-2 py-0.5 outline-none ring-1 ring-[#B91C1C]/20 ${className}`}
    />
  );
}

/* ─── Detail Editor (Polymorphic) ─── */
function DetailEditor({ node, onClose }) {
  const updateCourseMutation = useUpdateAdminCourse();
  const updateUnitMutation = useUpdateAdminUnit();
  const updateLessonMutation = useUpdateAdminLesson();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnail: "",
  });
  const [isPending, setIsPending] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (node?.data) {
      setFormData({
        title: node.data.title || "",
        description: node.data.description || "",
        videoUrl: node.data.videoUrl || "",
        thumbnail: node.data.thumbnail || "",
      });
    }
    setSaved(false);
  }, [node?.id, node?.type]);

  const handleSave = async () => {
    if (!formData.title.trim()) return;
    setIsPending(true);
    try {
      if (node.type === "course") {
        await updateCourseMutation.mutateAsync({ 
          id: node.id, 
          body: { 
            title: formData.title, 
            description: formData.description || undefined, 
            thumbnail: formData.thumbnail || undefined 
          } 
        });
      } else if (node.type === "unit") {
        await updateUnitMutation.mutateAsync({ 
          id: node.id, 
          body: { title: formData.title } 
        });
      } else if (node.type === "lesson") {
        await updateLessonMutation.mutateAsync({ 
          id: node.id, 
          body: { 
            title: formData.title, 
            videoUrl: formData.videoUrl.trim() || null 
          } 
        });
      }
      setSaved(true);
      toast.success(`${node.type === "course" ? "Course" : node.type === "unit" ? "Unit" : "Lesson"} saved successfully`);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save changes"));
    } finally {
      setIsPending(false);
    }
  };

  const getIcon = () => {
    if (node.type === "course") return <Settings className="h-4 w-4" />;
    if (node.type === "unit") return <Layers className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const { data: examsData } = useAdminExams({ page: 1, limit: 200 });
  const allExams = examsData?.exams || [];
  const linkedExams = allExams.filter((e) => {
    if (node.type === "course") return e.courseId === node.id;
    if (node.type === "unit") return e.unitId === node.id;
    if (node.type === "lesson") return e.lessonId === node.id;
    return false;
  });

  return (
    <div className="flex h-full flex-col font-jakarta antialiased">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/8">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            node.type === "course" ? "bg-blue-100 text-blue-600" : 
            node.type === "unit" ? "bg-purple-100 text-purple-600" : 
            "bg-red-100 text-red-600"
          }`}>
            {getIcon()}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{node.type} Editor</p>
            <p className="text-[11px] text-slate-500">Edit metadata and linked resources</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Title</span>
            <input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter title..."
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            />
          </label>

          {node.type === "course" && (
            <>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</span>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Course summary..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Thumbnail URL</span>
                <input
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </label>
            </>
          )}

          {node.type === "lesson" && (
            <label className="block space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Video URL</span>
              <div className="relative">
                <Video className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white ps-10 pe-4 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </div>
            </label>
          )}
        </div>

        <ExamManager 
          targetId={node.id} 
          targetType={node.type} 
          linkedExams={linkedExams} 
        />
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 px-5 py-4 dark:border-white/8">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !formData.title.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#B91C1C] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#991B1B] disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved ? "Changes Saved ✓" : `Save ${node.type === "course" ? "Course" : node.type === "unit" ? "Unit" : "Lesson"}`}
        </button>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════
   MAIN: CourseEditor (The Studio)
   ═══════════════════════════════════════════════ */
export default function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: course, isLoading, isError } = useAdminCourse(id);

  const createUnitMutation = useCreateAdminUnit();
  const updateUnitMutation = useUpdateAdminUnit();
  const deleteUnitMutation = useDeleteAdminUnit();
  const createLessonMutation = useCreateAdminLesson();
  const deleteLessonMutation = useDeleteAdminLesson();

  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (course && !selectedNode) {
      setSelectedNode({ type: 'course', id: course.id, data: course });
    }
  }, [course, selectedNode]);

  const units = course?.units || [];

  const handleAddUnit = useCallback(async () => {
    try {
      await createUnitMutation.mutateAsync({ title: `Unit ${units.length + 1}`, order: units.length + 1, courseId: id });
      toast.success("Unit added");
    } catch (err) { toast.error(getErrorMessage(err, "Failed to add unit")); }
  }, [createUnitMutation, units.length, id]);

  const handleRenameUnit = useCallback(async (unitId, title) => {
    try {
      await updateUnitMutation.mutateAsync({ id: unitId, body: { title } });
    } catch (err) { toast.error(getErrorMessage(err, "Failed to rename unit")); }
  }, [updateUnitMutation]);

  const handleDeleteUnit = useCallback(async (unitId) => {
    if (!confirm("Delete this unit and all its lessons?")) return;
    try {
      if (selectedNode?.id === unitId) setSelectedNode({ type: 'course', id: course.id, data: course });
      await deleteUnitMutation.mutateAsync(unitId);
      toast.success("Unit deleted");
    } catch (err) { toast.error(getErrorMessage(err, "Failed to delete unit")); }
  }, [deleteUnitMutation, selectedNode, course, id]);

  const handleAddLesson = useCallback(async (unitId, order) => {
    try {
      await createLessonMutation.mutateAsync({ title: `Lesson ${order}`, order, unitId });
      toast.success("Lesson added");
    } catch (err) { toast.error(getErrorMessage(err, "Failed to add lesson")); }
  }, [createLessonMutation]);

  const handleDeleteLesson = useCallback(async (lessonId) => {
    if (!confirm("Delete this lesson?")) return;
    try {
      if (selectedNode?.id === lessonId) setSelectedNode({ type: 'course', id: course.id, data: course });
      await deleteLessonMutation.mutateAsync(lessonId);
      toast.success("Lesson deleted");
    } catch (err) { toast.error(getErrorMessage(err, "Failed to delete lesson")); }
  }, [deleteLessonMutation, selectedNode, course, id]);

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#B91C1C]" /></div>;
  if (isError || !course) return <div className="mx-auto max-w-lg space-y-4 py-20 text-center"><p className="text-lg font-bold text-slate-900 dark:text-white">Course not found</p><Link to="/admin/courses" className="text-sm text-[#B91C1C] hover:underline">← Back to courses</Link></div>;

  const totalLessons = units.reduce((sum, u) => sum + (u.lessons?.length || 0), 0);

  return (
    <section className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/admin/courses")} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"><ArrowLeft className="h-4 w-4" /></button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{course.title}</h1>
            <p className="text-xs text-slate-500">{course.category?.name || "No category"} · {course.instructor?.fullName || "No instructor"}</p>
          </div>
        </div>
        <div className={`rounded-full px-3 py-1 text-[10px] font-bold ${course.isActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{course.isActive ? "Published" : "Draft"}</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Units", value: units.length, color: "text-blue-500" },
          { label: "Lessons", value: totalLessons, color: "text-emerald-500" },
          { label: "Videos", value: units.reduce((s, u) => s + (u.lessons?.filter((l) => l.videoUrl)?.length || 0), 0), color: "text-purple-500" },
          { label: "Final Exam", value: course.exams?.filter(e => e.courseId === course.id).length || 0, color: "text-amber-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/8 dark:bg-[#1A1A22]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
            <p className={`mt-1 text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Left: Curriculum Tree */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Curriculum</h2>
            <button onClick={handleAddUnit} className="inline-flex items-center gap-1.5 rounded-lg bg-[#B91C1C] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#991B1B]"><Plus className="h-3 w-3" /> Add Unit</button>
          </div>

          {/* Course Root Node */}
          <button 
            onClick={() => setSelectedNode({ type: 'course', id: course.id, data: course })}
            className={`flex w-full items-center gap-3 rounded-xl border p-4 text-start transition-all ${selectedNode?.type === 'course' ? 'border-[#B91C1C] bg-[#B91C1C]/5 ring-1 ring-[#B91C1C]/10' : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-white/8 dark:bg-[#1A1A22]'}`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${selectedNode?.type === 'course' ? 'bg-[#B91C1C] text-white' : 'bg-slate-100 text-slate-500 dark:bg-white/10'}`}><Info className="h-5 w-5" /></div>
            <div>
              <p className={`text-sm font-bold ${selectedNode?.type === 'course' ? 'text-[#B91C1C]' : 'text-slate-900 dark:text-white'}`}>Course Settings</p>
              <p className="text-[11px] text-slate-500">Metadata & Final Exam</p>
            </div>
          </button>

          {units.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center dark:border-white/10"><BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" /><p className="text-sm font-bold text-slate-500">No units yet</p></div>
          ) : (
            units.map((unit) => (
              <UnitAccordion
                key={unit.id}
                unit={unit}
                isSelected={selectedNode?.type === 'unit' && selectedNode?.id === unit.id}
                onSelect={(u) => setSelectedNode({ type: 'unit', id: u.id, data: u })}
                selectedLessonId={selectedNode?.type === 'lesson' ? selectedNode.id : null}
                onSelectLesson={(l) => setSelectedNode({ type: 'lesson', id: l.id, data: l })}
                onDeleteUnit={handleDeleteUnit}
                onDeleteLesson={handleDeleteLesson}
                onAddLesson={handleAddLesson}
                onRenameUnit={handleRenameUnit}
                isAddingLesson={createLessonMutation.isPending}
              />
            ))
          )}
        </div>

        {/* Right: Detail Editor */}
        <div className="min-h-[500px] rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
          {selectedNode ? (
            <DetailEditor
              key={selectedNode.type + selectedNode.id}
              node={selectedNode}
              onClose={() => setSelectedNode({ type: 'course', id: course.id, data: course })}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-400"><BookOpen className="h-10 w-10 mb-2" /><p>Select an item to edit</p></div>
          )}
        </div>
      </div>
    </section>
  );
}