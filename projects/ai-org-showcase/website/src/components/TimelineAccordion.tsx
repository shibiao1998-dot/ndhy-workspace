import { useState, useCallback, useId, type KeyboardEvent } from 'react';
import type { TimelineStep } from '../data/timeline-steps';

interface Props {
  steps: TimelineStep[];
}

export default function TimelineAccordion({ steps }: Props) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const baseId = useId();

  const toggleStep = useCallback((step: number) => {
    setExpandedStep((prev) => (prev === step ? null : step));
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, step: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleStep(step);
      }
    },
    [toggleStep],
  );

  return (
    <div className="timeline-accordion" role="list">
      {steps.map((step) => {
        const isExpanded = expandedStep === step.step;
        const triggerId = `${baseId}-trigger-${step.step}`;
        const panelId = `${baseId}-panel-${step.step}`;

        return (
          <div key={step.step} className="timeline-card" role="listitem">
            {/* ─── Trigger ─── */}
            <button
              id={triggerId}
              type="button"
              role="button"
              aria-expanded={isExpanded}
              aria-controls={panelId}
              onClick={() => toggleStep(step.step)}
              onKeyDown={(e) => handleKeyDown(e, step.step)}
              className="timeline-trigger"
            >
              {/* Step number circle */}
              <span className={`timeline-step-circle ${isExpanded ? 'timeline-step-circle--active' : ''}`}>
                {step.step}
              </span>

              {/* Middle: info */}
              <span className="timeline-content">
                <span className="timeline-role-line">
                  <span>{step.emoji}</span>
                  <span>{step.role}</span>
                  <span className="timeline-dot">·</span>
                  <span className="timeline-title">{step.title}</span>
                </span>
                <span className="timeline-meta">
                  产出：{step.output}
                </span>
              </span>

              {/* Arrow */}
              <span
                className={`timeline-arrow ${isExpanded ? 'timeline-arrow--expanded' : ''}`}
                aria-hidden="true"
              >
                →
              </span>
            </button>

            {/* ─── Expandable Panel ─── */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className={`timeline-panel ${isExpanded ? 'timeline-panel--expanded' : ''}`}
            >
              <div className="timeline-panel-inner">
                <div className="timeline-panel-content">
                  {step.detail}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
