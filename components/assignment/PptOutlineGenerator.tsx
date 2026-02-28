'use client'

import { useState } from 'react'
import { generatePptAction } from '@/actions/assignment.actions'
import type { PptOutlineResult } from '@/lib/ai/types'
import { Sparkles, Presentation, Clock, Layers, Download, Plus, Trash2 } from 'lucide-react'
import pptxgen from 'pptxgenjs'

export default function PptOutlineGenerator({
    assignmentId,
    initialPpt,
    topic,
}: {
    assignmentId: string
    initialPpt?: { content_json: PptOutlineResult; version_no: number } | null
    topic: string
}) {
    const [ppt, setPpt] = useState<PptOutlineResult | null>(initialPpt?.content_json || null)
    const [isLoading, setIsLoading] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)

    const handleGenerate = async () => {
        setIsLoading(true)
        try {
            const res = await generatePptAction(assignmentId, topic)
            if (res.ok && res.data) {
                setPpt(res.data.content_json as PptOutlineResult)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const layoutColors: Record<string, string> = {
        title: 'bg-blue-100 text-blue-700',
        content: 'bg-gray-100 text-gray-700',
        'two-column': 'bg-purple-100 text-purple-700',
        image: 'bg-green-100 text-green-700',
        conclusion: 'bg-orange-100 text-orange-700',
    }

    // ─── 슬라이드별 고유 그라데이션 팔레트 (PPT 파일용) ───
    const slideThemes = [
        { bg1: '0D47A1', bg2: '1565C0', accent: '42A5F5', icon: '90CAF9' }, // Deep Blue
        { bg1: '1B5E20', bg2: '2E7D32', accent: '66BB6A', icon: 'A5D6A7' }, // Forest Green
        { bg1: '4A148C', bg2: '6A1B9A', accent: 'AB47BC', icon: 'CE93D8' }, // Rich Purple
        { bg1: 'B71C1C', bg2: 'C62828', accent: 'EF5350', icon: 'EF9A9A' }, // Vivid Red
        { bg1: 'E65100', bg2: 'EF6C00', accent: 'FF9800', icon: 'FFCC80' }, // Orange
        { bg1: '006064', bg2: '00838F', accent: '26C6DA', icon: '80DEEA' }, // Teal
        { bg1: '263238', bg2: '37474F', accent: '78909C', icon: 'B0BEC5' }, // Blue-Gray
        { bg1: '3E2723', bg2: '4E342E', accent: '8D6E63', icon: 'BCAAA4' }, // Brown
        { bg1: '1A237E', bg2: '283593', accent: '5C6BC0', icon: '9FA8DA' }, // Indigo
        { bg1: '880E4F', bg2: 'AD1457', accent: 'EC407A', icon: 'F48FB1' }, // Pink
    ]

    const handleDownload = async () => {
        if (!ppt) return;
        setIsDownloading(true);
        try {
            const pres = new pptxgen();
            pres.layout = 'LAYOUT_16x9';
            pres.title = ppt.presentationTitle || topic;
            pres.author = 'Nursing Learning Hub';

            // ═══════════════════════════════════════════
            // 1. TITLE SLIDE — 풀 블리드 그라데이션 + 센터 타이틀
            // ═══════════════════════════════════════════
            const ts = pres.addSlide();
            // 진한 배경
            ts.background = { color: '0D47A1' };
            // 상단 장식 바
            ts.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.15, fill: { color: '1565C0' } });
            // 하단 그라데이션 바
            ts.addShape(pres.ShapeType.rect, { x: 0, y: 4.95, w: '100%', h: 0.68, fill: { color: '0A3D91' } });
            // 하단 세로줄 장식
            ts.addShape(pres.ShapeType.rect, { x: 0.6, y: 5.0, w: 1.5, h: 0.08, fill: { color: '42A5F5' } });
            ts.addText('Nursing Learning Hub', { x: 2.3, y: 5.0, w: 4, h: 0.4, fontSize: 11, color: '90CAF9', fontFace: 'Malgun Gothic' });
            // 중앙 큰 타이틀 영역 — 반투명 사각형
            ts.addShape(pres.ShapeType.roundRect, { x: 0.8, y: 1.2, w: 8.4, h: 2.8, fill: { color: 'FFFFFF', transparency: 90 }, rectRadius: 0.15 });
            // 메인 타이틀
            ts.addText(ppt.presentationTitle || topic, {
                x: 1.2, y: 1.5, w: 7.6, h: 1.6,
                fontSize: 42, bold: true, align: 'center', valign: 'middle', color: 'FFFFFF',
                fontFace: 'Malgun Gothic',
                shadow: { type: 'outer', color: '000000', blur: 6, offset: 2, opacity: 0.4 }
            });
            // 부제
            ts.addText('발표 과제 준비 자료', {
                x: 1.2, y: 3.1, w: 7.6, h: 0.6,
                fontSize: 18, align: 'center', color: '90CAF9', fontFace: 'Malgun Gothic'
            });
            // 슬라이드 개수 정보
            ts.addText(`총 ${ppt.totalSlides}장 슬라이드  |  예상 발표 시간: ${ppt.estimatedDuration || '10분'}`, {
                x: 1.2, y: 3.7, w: 7.6, h: 0.4,
                fontSize: 12, align: 'center', color: '64B5F6', fontFace: 'Malgun Gothic'
            });

            // ═══════════════════════════════════════════
            // 2. CONTENT SLIDES — 각 슬라이드마다 고유 색상 테마
            // ═══════════════════════════════════════════
            ppt.slides.forEach((slide, idx) => {
                const theme = slideThemes[idx % slideThemes.length];
                const s = pres.addSlide();

                // 배경
                s.background = { color: 'FFFFFF' };

                // 상단 헤더 배경 (풀 너비, 기울임 효과)
                s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.4, fill: { color: theme.bg1 } });
                // 헤더 하단 장식 라인
                s.addShape(pres.ShapeType.rect, { x: 0, y: 1.4, w: '100%', h: 0.06, fill: { color: theme.accent } });

                // 슬라이드 번호 뱃지
                s.addShape(pres.ShapeType.ellipse, { x: 0.4, y: 0.3, w: 0.7, h: 0.7, fill: { color: theme.accent } });
                s.addText(`${slide.slideNumber}`, {
                    x: 0.4, y: 0.3, w: 0.7, h: 0.7,
                    fontSize: 22, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', fontFace: 'Malgun Gothic'
                });

                // 슬라이드 제목 (뱃지 옆)
                s.addText(slide.title, {
                    x: 1.3, y: 0.3, w: 8, h: 0.8,
                    fontSize: 26, bold: true, color: 'FFFFFF', fontFace: 'Malgun Gothic', align: 'left', valign: 'middle'
                });

                // 좌측 포인트 바
                s.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.7, w: 0.08, h: 3.0, fill: { color: theme.accent } });

                // 글머리 기호 영역
                const bulletList = slide.bullets.map((b) => ({
                    text: b,
                    options: {
                        bullet: { characterCode: '25B8', color: theme.accent }, // Using hex code for '▸' (U+25B8)
                        color: '333333',
                        fontFace: 'Malgun Gothic',
                        fontSize: 18,
                        breakLine: true,
                        paraSpaceAfter: 10,
                    }
                }));

                s.addText(bulletList, {
                    x: 0.9, y: 1.8, w: 8.5, h: 3.0,
                    valign: 'top', align: 'left', lineSpacingMultiple: 1.3,
                    autoFit: true
                });

                // 하단 바
                s.addShape(pres.ShapeType.rect, { x: 0, y: 5.1, w: '100%', h: 0.53, fill: { color: theme.bg2 } });
                s.addText('Nursing Learning Hub', { x: 0.5, y: 5.15, w: 3, h: 0.35, fontSize: 9, color: theme.icon, fontFace: 'Malgun Gothic' });
                // 페이지 번호
                s.addText(`${slide.slideNumber} / ${ppt.totalSlides}`, {
                    x: 8, y: 5.15, w: 1.5, h: 0.35,
                    fontSize: 10, color: theme.icon, fontFace: 'Malgun Gothic', align: 'right'
                });
            });

            // ═══════════════════════════════════════════
            // 3. THANK YOU SLIDE
            // ═══════════════════════════════════════════
            const endSlide = pres.addSlide();
            endSlide.background = { color: '0D47A1' };
            endSlide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.15, fill: { color: '1565C0' } });
            endSlide.addShape(pres.ShapeType.rect, { x: 0, y: 4.95, w: '100%', h: 0.68, fill: { color: '0A3D91' } });
            endSlide.addText('감사합니다', {
                x: 1, y: 1.5, w: 8, h: 1.5,
                fontSize: 52, bold: true, align: 'center', valign: 'middle', color: 'FFFFFF',
                fontFace: 'Malgun Gothic',
                shadow: { type: 'outer', color: '000000', blur: 6, offset: 2, opacity: 0.3 }
            });
            endSlide.addText('Q & A', {
                x: 1, y: 3.2, w: 8, h: 0.8,
                fontSize: 28, align: 'center', color: '64B5F6', fontFace: 'Malgun Gothic'
            });

            await pres.writeFile({ fileName: `${topic}_PPT_초안.pptx` });
        } catch (error) {
            console.error('PPT generation failed:', error);
            alert('PPT 다운로드 중 오류가 발생했습니다.');
        } finally {
            setIsDownloading(false);
        }
    }

    // ─── 편집 핸들러 ───
    const handlePresentationTitleChange = (newTitle: string) => {
        if (!ppt) return;
        setPpt({ ...ppt, presentationTitle: newTitle });
    }

    const handleSlideTitleChange = (slideIndex: number, newTitle: string) => {
        if (!ppt) return;
        const newSlides = [...ppt.slides];
        newSlides[slideIndex] = { ...newSlides[slideIndex], title: newTitle };
        setPpt({ ...ppt, slides: newSlides });
    }

    const handleBulletChange = (slideIndex: number, bulletIndex: number, newText: string) => {
        if (!ppt) return;
        const newSlides = [...ppt.slides];
        const newBullets = [...newSlides[slideIndex].bullets];
        newBullets[bulletIndex] = newText;
        newSlides[slideIndex] = { ...newSlides[slideIndex], bullets: newBullets };
        setPpt({ ...ppt, slides: newSlides });
    }

    const handleAddBullet = (slideIndex: number) => {
        if (!ppt) return;
        const newSlides = [...ppt.slides];
        newSlides[slideIndex] = { ...newSlides[slideIndex], bullets: [...newSlides[slideIndex].bullets, ''] };
        setPpt({ ...ppt, slides: newSlides });
    }

    const handleRemoveBullet = (slideIndex: number, bulletIndex: number) => {
        if (!ppt) return;
        const newSlides = [...ppt.slides];
        const newBullets = [...newSlides[slideIndex].bullets];
        newBullets.splice(bulletIndex, 1);
        newSlides[slideIndex] = { ...newSlides[slideIndex], bullets: newBullets };
        setPpt({ ...ppt, slides: newSlides });
    }

    // ─── 슬라이드 카드 배경 색상 (Canvas 미리보기) ───
    const canvasSlideColors = [
        'from-blue-600 to-blue-800',
        'from-green-700 to-green-900',
        'from-purple-600 to-purple-800',
        'from-red-600 to-red-800',
        'from-orange-500 to-orange-700',
        'from-teal-600 to-teal-800',
        'from-gray-600 to-gray-800',
        'from-amber-700 to-amber-900',
        'from-indigo-600 to-indigo-800',
        'from-pink-600 to-pink-800',
    ]

    return (
        <div className="space-y-6">
            <div className="bg-white border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Presentation size={18} className="text-orange-500" />
                        PPT 슬라이드 구조
                    </h3>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        <Sparkles size={14} />
                        {isLoading ? '생성 중...' : ppt ? '재생성' : 'PPT 구조 생성'}
                    </button>
                </div>

                {ppt ? (
                    <div className="space-y-4">
                        {/* 메타 정보 */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 pb-3 border-b">
                            <span className="flex items-center gap-1">
                                <Layers size={14} /> {ppt.totalSlides}장
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock size={14} /> 예상 {ppt.estimatedDuration}
                            </span>
                        </div>

                        {/* Canvas 편집 영역: 프레젠테이션 제목 */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-5 rounded-xl shadow-md">
                            <label className="text-xs font-bold text-blue-200 mb-2 block">📝 프레젠테이션 제목</label>
                            <input
                                type="text"
                                value={ppt.presentationTitle || topic}
                                onChange={(e) => handlePresentationTitleChange(e.target.value)}
                                className="w-full font-bold text-xl text-white bg-white/10 border border-white/20 rounded-lg focus:border-white/60 focus:ring-1 focus:ring-white/40 px-4 py-3 transition placeholder-white/40 backdrop-blur-sm"
                                placeholder="프레젠테이션 제목을 입력하세요."
                            />
                        </div>

                        {/* Canvas 편집 영역: 슬라이드 카드 목록 */}
                        <div className="space-y-5">
                            {ppt.slides.map((slide, i) => (
                                <div key={slide.slideNumber} className="rounded-xl overflow-hidden shadow-md border border-gray-100">
                                    {/* 슬라이드 헤더 (컬러 그라데이션) */}
                                    <div className={`bg-gradient-to-r ${canvasSlideColors[i % canvasSlideColors.length]} p-4`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="w-8 h-8 bg-white/20 text-white rounded-full flex items-center justify-center text-sm font-bold backdrop-blur-sm">
                                                {slide.slideNumber}
                                            </span>
                                            {slide.layoutHint && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-white/20 text-white/90">
                                                    {slide.layoutHint}
                                                </span>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            value={slide.title}
                                            onChange={(e) => handleSlideTitleChange(i, e.target.value)}
                                            className="w-full font-bold text-lg text-white bg-white/10 border border-white/20 rounded-lg focus:border-white/60 focus:ring-1 focus:ring-white/40 px-3 py-2 transition placeholder-white/40 backdrop-blur-sm"
                                            placeholder="슬라이드 제목..."
                                        />
                                    </div>
                                    {/* 슬라이드 본문 (하얀 영역) */}
                                    <div className="bg-white p-4 space-y-2">
                                        {slide.bullets.map((bullet, j) => (
                                            <div key={j} className="flex items-start gap-2 group/bullet">
                                                <span className="text-blue-500 mt-2.5 text-base leading-none flex-shrink-0">▸</span>
                                                <input
                                                    type="text"
                                                    value={bullet}
                                                    onChange={(e) => handleBulletChange(i, j, e.target.value)}
                                                    className="flex-1 text-sm text-gray-700 bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 rounded-md px-2 py-1.5 transition"
                                                    placeholder="내용 입력..."
                                                />
                                                <button
                                                    onClick={() => handleRemoveBullet(i, j)}
                                                    className="opacity-0 group-hover/bullet:opacity-100 p-1 text-gray-300 hover:text-red-500 transition"
                                                    title="삭제"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => handleAddBullet(i)}
                                            className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 mt-1 px-2 py-1 rounded hover:bg-blue-50 transition"
                                        >
                                            <Plus size={12} /> 항목 추가
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t">
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition flex items-center gap-2 shadow-lg disabled:opacity-50"
                            >
                                <Download size={18} />
                                {isDownloading ? 'PPT 생성 중...' : '💎 PPT 파일 다운로드'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 bg-gray-50 border border-dashed rounded-xl text-center text-gray-500 text-sm">
                        과제 주제를 바탕으로 발표 슬라이드 구조를 자동 생성합니다.
                    </div>
                )}
            </div>
        </div>
    )
}
