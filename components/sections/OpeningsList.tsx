import { ChevronDown } from "lucide-react";
import { ButtonExternalLink } from "@/components/ui/Button";
import type { Opening } from "@/data/careers";
import { applicationMessage, whatsappHref } from "@/lib/whatsapp";

/**
 * Open positions as a short list: each role shows its title and four facts;
 * opening it reveals the summary, what the work involves, what we look for,
 * and an Apply action. Native <details>, so it works without JavaScript.
 */
export function OpeningsList({ openings }: { openings: readonly Opening[] }) {
  return (
    <ul className="grid gap-3">
      {openings.map((opening) => (
        <li key={opening.id}>
          <details className="group rounded-[1.5rem] bg-surface-raised ring-1 ring-line transition-shadow duration-500 ease-calm open:shadow-card hover:shadow-card">
            <summary className="flex cursor-pointer list-none items-center gap-4 rounded-[1.5rem] p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:p-6 md:px-8 [&::-webkit-details-marker]:hidden">
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg leading-snug text-balance text-brand md:text-xl">{opening.title}</h3>
                <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink-3" aria-label="Role details">
                  <li className="font-medium text-accent-ink">{opening.area}</li>
                  <li>{opening.type}</li>
                  <li>{opening.location}</li>
                  <li>{opening.experience}</li>
                </ul>
              </div>
              <span className="hidden text-sm font-medium text-brand sm:inline">
                <span className="group-open:hidden">View role</span>
                <span className="hidden group-open:inline">Close</span>
              </span>
              <span
                aria-hidden="true"
                className="grid size-10 shrink-0 place-items-center rounded-full border border-brand/20 text-brand transition-[transform,background-color,color] duration-500 ease-calm group-open:rotate-180 group-open:bg-brand group-open:text-on-brand"
              >
                <ChevronDown className="size-4" />
              </span>
            </summary>

            <div className="border-t border-line px-5 pt-6 pb-6 sm:px-6 md:px-8 md:pb-8">
              <p className="max-w-2xl leading-relaxed text-pretty text-ink-2">{opening.summary}</p>
              <div className="mt-7 grid gap-8 md:grid-cols-2 md:gap-12">
                <RoleList title="What you will do" items={opening.responsibilities} />
                <RoleList title="What we look for" items={opening.requirements} />
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <ButtonExternalLink href={whatsappHref(applicationMessage(opening.title))}>
                  Apply on WhatsApp
                </ButtonExternalLink>
                <p className="text-sm text-ink-3">Share a short note about your training. Our coordinator will reply.</p>
              </div>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}

function RoleList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold tracking-[0.14em] text-accent-ink uppercase">{title}</h4>
      <ul className="mt-4 grid gap-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink-2">
            <span aria-hidden="true" className="mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-tertiary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
