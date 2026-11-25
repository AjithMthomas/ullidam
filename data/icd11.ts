/**
 * Common ICD-11 (Chapter 6, mental, behavioural or neurodevelopmental
 * disorders, plus chronic insomnia) for the session-note picker. A starting
 * list for quick entry; clinicians can type any code and label. Verify codes
 * against the WHO ICD-11 browser (icd.who.int) before relying on them.
 */
export const ICD11_COMMON: readonly { code: string; label: string }[] = [
  { code: "6A70", label: "Single episode depressive disorder" },
  { code: "6A71", label: "Recurrent depressive disorder" },
  { code: "6A72", label: "Dysthymic disorder" },
  { code: "6A60", label: "Bipolar type I disorder" },
  { code: "6A61", label: "Bipolar type II disorder" },
  { code: "6B00", label: "Generalised anxiety disorder" },
  { code: "6B01", label: "Panic disorder" },
  { code: "6B03", label: "Specific phobia" },
  { code: "6B04", label: "Social anxiety disorder" },
  { code: "6B20", label: "Obsessive-compulsive disorder" },
  { code: "6B40", label: "Post traumatic stress disorder" },
  { code: "6B41", label: "Complex post traumatic stress disorder" },
  { code: "6B42", label: "Prolonged grief disorder" },
  { code: "6B43", label: "Adjustment disorder" },
  { code: "6A05", label: "Attention deficit hyperactivity disorder" },
  { code: "6A20", label: "Schizophrenia" },
  { code: "6B80", label: "Anorexia nervosa" },
  { code: "6B81", label: "Bulimia nervosa" },
  { code: "6B82", label: "Binge eating disorder" },
  { code: "6C40", label: "Disorders due to use of alcohol" },
  { code: "6D10", label: "Personality disorder" },
  { code: "7A00", label: "Chronic insomnia" },
];

export const MODALITIES = ["CBT", "ACT", "DBT skills", "EFT", "Gottman Method", "MBCT", "Psychodynamic", "Supportive", "Psychoeducation", "Motivational interviewing", "EMDR", "Medication review"] as const;
