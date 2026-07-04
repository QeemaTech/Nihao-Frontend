import { useMemo, useState } from "react";
import { Loader2, Edit, Trash2, Calendar, Award } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import EmptyState from "../../components/dashboard/EmptyState";
import Notice from "../../components/dashboard/Notice";
import PageHeader from "../../components/dashboard/PageHeader";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { getErrorMessage } from "../../api/error";
import {
  useGradeHomeworkSubmission,
  useInstructorHomeworkQueue,
  usePatchHomeworkReviewStatus,
  useInstructorHomeworks,
  useUpdateInstructorHomework,
  useDeleteInstructorHomework,
} from "../../features/instructor/homework/hooks";

const TABS = ["all", "notOpened", "opened", "closed"];

function tabMatches(tab, sub) {
  const graded = sub.status === "GRADED";
  const closed = graded || sub.instructorReviewStatus === "CLOSED";
  const opened = sub.instructorReviewStatus === "OPENED";
  const notOpened = sub.instructorReviewStatus === "NOT_OPENED" && !graded;

  if (tab === "all") return true;
  if (tab === "closed") return closed;
  if (tab === "opened") return !graded && opened;
  if (tab === "notOpened") return notOpened;
  return true;
}

function Homework() {
  const { t } = useTranslation();
  
  // Main view toggle: "submissions" or "assignments"
  const [activeView, setActiveView] = useState("submissions");

  // Submissions queue hooks & state
  const { data: queueData, isLoading: isQueueLoading } = useInstructorHomeworkQueue();
  const submissions = queueData?.submissions ?? [];
  const counts = queueData?.counts ?? { notOpened: 0, opened: 0, closed: 0 };
  const gradeMutation = useGradeHomeworkSubmission();
  const reviewMutation = usePatchHomeworkReviewStatus();

  // Homework assignments list hooks & state
  const { data: homeworks = [], isLoading: isHwListLoading } = useInstructorHomeworks();
  const updateHwMutation = useUpdateInstructorHomework();
  const deleteHwMutation = useDeleteInstructorHomework();

  // Dialog and Edit states
  const [notice, setNotice] = useState(null);
  const [tab, setTab] = useState("all");
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");

  const [editHw, setEditHw] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  
  const [deleteHwId, setDeleteHwId] = useState(null);

  const filteredSubmissions = useMemo(() => submissions.filter((s) => tabMatches(tab, s)), [submissions, tab]);

  const openGrade = async (sub) => {
    setNotice(null);
    setActiveSubmission(sub);
    setGrade(sub.grade != null ? String(sub.grade) : "");
    setFeedback(sub.feedback || "");
    if (sub.instructorReviewStatus === "NOT_OPENED" && sub.status === "PENDING") {
      try {
        await reviewMutation.mutateAsync({ submissionId: sub.id, instructorReviewStatus: "OPENED" });
      } catch {
        /* queue still usable */
      }
    }
  };

  const submitGrade = async (e) => {
    e.preventDefault();
    if (!activeSubmission) return;
    const g = Number(grade);
    if (Number.isNaN(g) || g < 0) {
      setNotice({ type: "error", message: "Enter a valid grade." });
      return;
    }
    setNotice(null);
    try {
      await gradeMutation.mutateAsync({
        submissionId: activeSubmission.id,
        grade: g,
        feedback: feedback || "",
      });
      setNotice({ type: "success", message: "Submission graded." });
      setActiveSubmission(null);
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err, "Grading failed.") });
    }
  };

  const setReviewState = async (submissionId, instructorReviewStatus) => {
    setNotice(null);
    try {
      await reviewMutation.mutateAsync({ submissionId, instructorReviewStatus });
      setNotice({ type: "success", message: t("dashboard.instructor.homework.queue.stateUpdated") });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err, "Update failed.") });
    }
  };

  // Edit / Delete handlers
  const handleOpenEdit = (hw) => {
    setEditHw(hw);
    setEditTitle(hw.title || "");
    setEditDesc(hw.description || "");
    // Format to YYYY-MM-DDThh:mm for local datetime input
    if (hw.dueDate) {
      const d = new Date(hw.dueDate);
      const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setEditDueDate(iso);
    } else {
      setEditDueDate("");
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editHw) return;
    if (!editTitle.trim()) {
      toast.error("Title is required.");
      return;
    }
    try {
      await updateHwMutation.mutateAsync({
        homeworkId: editHw.id,
        body: {
          title: editTitle.trim(),
          description: editDesc.trim(),
          dueDate: editDueDate ? new Date(editDueDate).toISOString() : undefined,
        },
      });
      toast.success("Homework updated successfully.");
      setEditHw(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update homework."));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteHwId) return;
    try {
      await deleteHwMutation.mutateAsync(deleteHwId);
      toast.success("Homework deleted successfully.");
      setDeleteHwId(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete homework."));
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title={t("dashboard.instructor.pages.homework.title")}
          subtitle={t("dashboard.instructor.pages.homework.subtitle")}
        />
        {/* Toggle between Submissions Queue and Assignments list */}
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-white/5 self-start">
          <button
            type="button"
            onClick={() => setActiveView("submissions")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              activeView === "submissions"
                ? "bg-white text-slate-900 shadow-sm dark:bg-[#1A1A22] dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Submissions Queue
          </button>
          <button
            type="button"
            onClick={() => setActiveView("assignments")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              activeView === "assignments"
                ? "bg-white text-slate-900 shadow-sm dark:bg-[#1A1A22] dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            My Assignments
          </button>
        </div>
      </div>

      <Notice type={notice?.type} message={notice?.message} />

      {activeView === "submissions" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setTab("notOpened")}
              className={`rounded-2xl border p-4 text-start shadow-sm transition-colors ${
                tab === "notOpened"
                  ? "border-nihao-red-normal bg-red-50 dark:border-nihao-red-normal dark:bg-red-950/30"
                  : "border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#1A1A22]"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("dashboard.instructor.homework.queue.notOpened")}
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{counts.notOpened}</p>
            </button>
            <button
              type="button"
              onClick={() => setTab("opened")}
              className={`rounded-2xl border p-4 text-start shadow-sm transition-colors ${
                tab === "opened"
                  ? "border-nihao-red-normal bg-red-50 dark:border-nihao-red-normal dark:bg-red-950/30"
                  : "border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#1A1A22]"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("dashboard.instructor.homework.queue.opened")}
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{counts.opened}</p>
            </button>
            <button
              type="button"
              onClick={() => setTab("closed")}
              className={`rounded-2xl border p-4 text-start shadow-sm transition-colors ${
                tab === "closed"
                  ? "border-nihao-red-normal bg-red-50 dark:border-nihao-red-normal dark:bg-red-950/30"
                  : "border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#1A1A22]"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("dashboard.instructor.homework.queue.closed")}
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{counts.closed}</p>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {TABS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  tab === key
                    ? "bg-nihao-red-normal text-white"
                    : "border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-[#1A1A22] dark:text-slate-200"
                }`}
              >
                {key === "all" ? t("dashboard.instructor.homework.queue.all") : t(`dashboard.instructor.homework.queue.${key}`)}
              </button>
            ))}
          </div>

          {isQueueLoading ? (
            <p className="text-slate-500 dark:text-slate-400">{t("dashboard.common.loading")}</p>
          ) : !filteredSubmissions.length ? (
            <EmptyState
              title={submissions.length ? t("dashboard.instructor.homework.queue.all") : t("dashboard.instructor.homework.queue.emptyTitle")}
              message={
                submissions.length
                  ? t("dashboard.instructor.homework.queue.emptyFilter")
                  : t("dashboard.instructor.homework.queue.emptyAll")
              }
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredSubmissions.map((sub) => {
                const courseTitle = sub.homework?.cohort?.course?.title || "";
                const cohortName = sub.homework?.cohort?.name || "";
                const ctx = t("dashboard.instructor.homework.queue.courseLine", {
                  course: courseTitle || "—",
                  cohort: cohortName || "—",
                });
                return (
                  <article
                    key={sub.id}
                    className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1A1A22]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{sub.homework?.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {ctx} · {sub.student?.fullName} · Max {sub.homework?.totalPoints} pts
                          {sub.status === "GRADED" && sub.grade != null && (
                            <span className="ms-1 font-semibold text-nihao-red-normal">
                              · Graded: {sub.grade}/{sub.homework?.totalPoints}
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openGrade(sub)}
                        className="rounded-xl bg-nihao-red-normal px-3 py-1.5 text-sm font-semibold text-white"
                      >
                        Review & grade
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {t("dashboard.instructor.homework.queue.stateLabel")}:
                      </span>
                      <select
                        value={sub.instructorReviewStatus || "NOT_OPENED"}
                        disabled={sub.status === "GRADED" || reviewMutation.isPending}
                        onChange={(e) => setReviewState(sub.id, e.target.value)}
                        className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                      >
                        <option value="NOT_OPENED">{t("dashboard.instructor.homework.queue.notOpened")}</option>
                        <option value="OPENED">{t("dashboard.instructor.homework.queue.opened")}</option>
                        <option value="CLOSED">{t("dashboard.instructor.homework.queue.closed")}</option>
                      </select>
                    </div>
                    <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-300">
                      {sub.content && <p className="whitespace-pre-wrap">{sub.content}</p>}
                      {sub.fileUrl && (
                        <a
                          href={sub.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block text-nihao-red-normal underline"
                        >
                          Open submitted file
                        </a>
                      )}
                      {!sub.content && !sub.fileUrl && <span className="text-slate-400">No content submitted.</span>}
                    </div>
                    {sub.feedback && sub.status === "GRADED" && (
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">Feedback: </span>
                        {sub.feedback}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-slate-400">
                      Submitted {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "—"}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* My Assignments View */
        <>
          {isHwListLoading ? (
            <p className="text-slate-500 dark:text-slate-400">{t("dashboard.common.loading")}</p>
          ) : !homeworks.length ? (
            <EmptyState
              title="No Homework Assigned"
              message="You haven't assigned any homework to your classes yet."
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {homeworks.map((hw) => {
                const courseTitle = hw.cohort?.course?.title || "";
                const cohortName = hw.cohort?.name || "";
                return (
                  <article
                    key={hw.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1A1A22]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">{hw.title}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {courseTitle} ({cohortName})
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(hw)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteHwId(hw.id)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {hw.description && (
                        <p className="mt-3 text-xs text-slate-600 line-clamp-3 dark:text-slate-300">
                          {hw.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-white/5 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {hw.dueDate ? new Date(hw.dueDate).toLocaleDateString() : "No due date"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" />
                        {hw.totalPoints} pts
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Grade submission Modal */}
      {activeSubmission && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={submitGrade}
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#1A1A22]"
          >
            <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">Grade submission</h3>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{activeSubmission.homework?.title}</p>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Grade (0–{activeSubmission.homework?.totalPoints ?? 100})
              <input
                type="number"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                min={0}
                max={activeSubmission.homework?.totalPoints ?? 100}
                required
              />
            </label>
            <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Feedback
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveSubmission(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-white/10 dark:text-slate-200"
              >
                {t("dashboard.common.cancel")}
              </button>
              <button
                type="submit"
                disabled={gradeMutation.isPending || activeSubmission.status === "GRADED"}
                className="inline-flex items-center gap-2 rounded-xl bg-nihao-red-normal px-4 py-2 text-sm font-semibold text-white"
              >
                {gradeMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("dashboard.common.submit")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Homework Modal */}
      {editHw && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#1A1A22]"
          >
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Edit Homework</h3>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Title
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Description
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Due Date
                <input
                  type="datetime-local"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditHw(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-white/10 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateHwMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-nihao-red-normal px-4 py-2 text-sm font-semibold text-white"
              >
                {updateHwMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Homework Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteHwId}
        title="Delete Homework Assignment"
        message="Are you sure you want to delete this homework assignment? All student submissions for it will be permanently deleted."
        confirmLabel={deleteHwMutation.isPending ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteHwId(null)}
      />
    </section>
  );
}

export default Homework;
