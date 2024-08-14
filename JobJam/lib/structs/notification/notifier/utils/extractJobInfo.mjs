export function extractJobInfo(job) {
  return {
    title: job.Title.S,
    department: job.Department.S,
    location: job.Location.S,
    hiringManagerEmail: job.Contact.M.email.S,
    interviewerEmail: job.Interviewer?.M?.email?.S || null,
  };
}
