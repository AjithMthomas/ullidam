/**
 * Open clinical positions on /careers. Edit, add or remove roles here; the
 * page lists whatever is in OPENINGS. No pay figures (Zero-Price standard):
 * terms are discussed with each applicant.
 */
export interface Opening {
  id: string;
  title: string;
  /** Which service track or programme the role serves. */
  area: string;
  type: "Full-time" | "Part-time" | "Contract";
  location: string;
  experience: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
}

export const OPENINGS: readonly Opening[] = [
  {
    id: "clinical-psychologist",
    title: "Clinical Psychologist, Individual Therapy",
    area: "Individual Counselling",
    type: "Full-time",
    location: "Remote, India",
    experience: "2+ years",
    summary:
      "Provide one-to-one therapy for adults facing anxiety, low mood, burnout and life transitions, in Malayalam and English.",
    responsibilities: [
      "Run weekly online sessions with adult clients",
      "Use evidence-informed approaches such as CBT and ACT",
      "Keep clear session notes and treatment plans",
    ],
    requirements: [
      "M.Phil in Clinical Psychology with RCI registration",
      "At least 2 years of supervised adult therapy",
      "Fluent Malayalam and English",
    ],
  },
  {
    id: "consultant-psychiatrist",
    title: "Consultant Psychiatrist, Tele-psychiatry",
    area: "Psychiatric Services",
    type: "Part-time",
    location: "Remote, India",
    experience: "3+ years after MD",
    summary:
      "Lead online psychiatric consultations: assessment, diagnosis, medication management and follow-up, alongside our psychologists.",
    responsibilities: [
      "Assess and diagnose adults over secure video",
      "Prescribe and review medication within telemedicine guidelines",
      "Coordinate care with each client's therapist",
    ],
    requirements: [
      "MD or DNB in Psychiatry with valid medical council registration",
      "At least 3 years of practice after your postgraduate degree",
      "Fluent Malayalam and English",
    ],
  },
  {
    id: "couples-counsellor",
    title: "Couple and Relationship Counsellor",
    area: "Couple Counselling",
    type: "Part-time",
    location: "Remote, evenings IST",
    experience: "3+ years",
    summary:
      "Work with engaged, married and committed couples on communication, conflict and trust, including NRI and long-distance couples.",
    responsibilities: [
      "Run joint and individual sessions with partners",
      "Offer premarital counselling for engaged couples",
      "Use structured approaches such as the Gottman Method or EFT",
    ],
    requirements: [
      "Master's in Psychology or Counselling; RCI registration preferred",
      "Training in Gottman Method, EFT or systemic therapy",
      "At least 3 years of work with couples",
    ],
  },
  {
    id: "divorce-counsellor",
    title: "Pre-divorce and Divorce Counsellor",
    area: "Divorce Counselling",
    type: "Part-time",
    location: "Remote, India",
    experience: "4+ years",
    summary:
      "Support people before, during and after separation: clarity in deciding, legal stress, co-parenting and rebuilding self-worth.",
    responsibilities: [
      "Guide clarity sessions for people still deciding",
      "Support clients through proceedings and co-parenting plans",
      "Help clients adjust and rebuild after divorce",
    ],
    requirements: [
      "Master's in Clinical or Counselling Psychology",
      "At least 4 years in marital or family counselling",
      "Sensitivity to family and social stigma in Kerala",
    ],
  },
  {
    id: "nri-counsellor",
    title: "Counselling Psychologist, NRI and Gulf Support",
    area: "NRI Care",
    type: "Contract",
    location: "Remote, Gulf and UK hours",
    experience: "1+ year",
    summary:
      "Counsel Malayalis living abroad, with sessions timed for Gulf and UK evenings and weekends.",
    responsibilities: [
      "Offer online counselling across time zones",
      "Work with migration stress, loneliness and family distance",
      "Refer to psychiatry or crisis support when needed",
    ],
    requirements: [
      "Master's in Counselling or Clinical Psychology",
      "At least 1 year of supervised counselling",
      "Available in Gulf and UK evening hours",
    ],
  },
];
