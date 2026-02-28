// PPT Export 유틸리티
// HTML 기반 PPT 다운로드 생성기 (pptxgenjs 없이 순수 HTML/JS로 구현)

import type { PptOutlineResult, PptSlide } from './types'

/** PPT 아웃라인을 HTML 프레젠테이션으로 변환 */
export function generatePptHtml(outline: PptOutlineResult): string {
    const slideStyles: Record<string, { bg: string; titleColor: string }> = {
        title: { bg: 'linear-gradient(135deg, #1e3a5f, #2563eb)', titleColor: '#ffffff' },
        content: { bg: '#ffffff', titleColor: '#1e3a5f' },
        'two-column': { bg: '#f8fafc', titleColor: '#1e3a5f' },
        conclusion: { bg: 'linear-gradient(135deg, #1e3a5f, #4338ca)', titleColor: '#ffffff' },
    }

    const slides = outline.slides.map((slide, i) => {
        const style = slideStyles[slide.layoutHint || 'content']
        const isWhiteBg = style.bg.startsWith('#f') || style.bg === '#ffffff'
        const textColor = isWhiteBg ? '#334155' : '#e2e8f0'

        return `
        <div class="slide" style="background: ${style.bg}; page-break-after: always; min-height: 100vh; padding: 60px; display: flex; flex-direction: column; justify-content: center;">
            <div style="position: absolute; top: 20px; right: 30px; font-size: 12px; color: ${isWhiteBg ? '#94a3b8' : '#94a3b8'};">
                ${i + 1} / ${outline.slides.length}
            </div>
            <h1 style="color: ${style.titleColor}; font-size: 32px; font-weight: 700; margin-bottom: 30px; line-height: 1.3;">
                ${slide.title}
            </h1>
            <ul style="color: ${textColor}; font-size: 18px; line-height: 2; list-style: none; padding: 0;">
                ${slide.bullets.map(b => `<li style="padding: 8px 0; padding-left: 24px; position: relative;">
                    <span style="position: absolute; left: 0; color: ${isWhiteBg ? '#2563eb' : '#60a5fa'};">●</span>
                    ${b}
                </li>`).join('')}
            </ul>
        </div>`
    }).join('')

    return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>${outline.presentationTitle}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        .slide { position: relative; }
        @media print {
            .slide { page-break-after: always; height: 100vh; }
        }
    </style>
</head>
<body>
    ${slides}
</body>
</html>`
}

/** PPT 아웃라인을 Markdown 텍스트로 변환 (복사/붙여넣기용) */
export function generatePptMarkdown(outline: PptOutlineResult): string {
    let md = `# ${outline.presentationTitle}\n\n`
    md += `> 총 ${outline.totalSlides}슬라이드 | 예상 발표 시간: ${outline.estimatedDuration}\n\n---\n\n`

    for (const slide of outline.slides) {
        md += `## 슬라이드 ${slide.slideNumber}: ${slide.title}\n\n`
        for (const bullet of slide.bullets) {
            md += `- ${bullet}\n`
        }
        md += `\n`
        if (slide.speakerNotes) {
            md += `> 🎤 발표 노트: ${slide.speakerNotes}\n\n`
        }
        md += `---\n\n`
    }

    return md
}
