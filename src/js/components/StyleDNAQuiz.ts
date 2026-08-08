import { STYLE_DNA_QUIZ } from '../data/collections';

export function renderStyleDNAQuizModal(stepIndex = 0, userAnswers: string[] = []): string {
  const isComplete = stepIndex >= STYLE_DNA_QUIZ.length;

  if (isComplete) {
    // Calculate predominant style profile
    const countMap: Record<string, number> = {};
    userAnswers.forEach((ans) => {
      countMap[ans] = (countMap[ans] || 0) + 1;
    });

    let topStyle = 'MINIMAL';
    let maxCount = 0;
    Object.keys(countMap).forEach((key) => {
      if (countMap[key] > maxCount) {
        maxCount = countMap[key];
        topStyle = key;
      }
    });

    const titleMap: Record<string, string> = {
      MINIMAL: 'MODERN FEMININE MINIMALIST',
      CONFIDENT: 'POWER TAILORED STRUCTURE',
      ROMANTIC: 'ETHEREAL SILK ROMANTIC',
      BOLD: 'NOCTURNE HIGH GLAMOUR'
    };

    return `
      <div class="modal-overlay active" id="quiz-modal-overlay">
        <div class="quiz-card" style="text-align: center;">
          <button class="modal-close-btn" id="close-quiz-btn"><i class="fa-solid fa-xmark"></i></button>

          <i class="fa-solid fa-wand-magic-sparkles text-gold" style="font-size: 3rem; margin-bottom: 16px;"></i>
          <div class="subtitle">YOUR PERSONALIZED STYLE DNA</div>
          <h2 class="heading-2 font-serif text-gold" style="margin: 10px 0 16px;">${titleMap[topStyle]}</h2>
          
          <p style="font-size: 0.9rem; color: var(--color-muted); max-width: 480px; margin: 0 auto 24px;">
            Based on your curated choices, your style profile is <strong>84% ${topStyle}</strong>. We have curated a personalized edit tailored exclusively for your silhouette.
          </p>

          <div class="flex gap-md justify-center">
            <button class="btn btn-primary" id="view-dna-curated-btn" data-mood="${topStyle}">EXPLORE YOUR CURATED EDIT</button>
            <button class="btn btn-secondary" id="save-dna-btn">SAVE TO MY ACCOUNT</button>
          </div>
        </div>
      </div>
    `;
  }

  const currentQ = STYLE_DNA_QUIZ[stepIndex];

  return `
    <div class="modal-overlay active" id="quiz-modal-overlay">
      <div class="quiz-card">
        <button class="modal-close-btn" id="close-quiz-btn"><i class="fa-solid fa-xmark"></i></button>
        
        <div class="flex justify-between items-center" style="margin-bottom: 20px;">
          <div class="subtitle">FIND YOUR STYLE DNA</div>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--color-gold);">STEP 0${stepIndex + 1} / 0${STYLE_DNA_QUIZ.length}</span>
        </div>

        <h3 class="heading-3 font-serif" style="margin-bottom: 24px;">${currentQ.question}</h3>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${currentQ.options
            .map(
              (opt) => `
            <button class="quiz-option-btn" data-quiz-type="${opt.type}" data-next-step="${stepIndex + 1}">
              <span>${opt.text}</span>
              <i class="fa-solid fa-arrow-right" style="font-size: 0.8rem; color: var(--color-gold);"></i>
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}
