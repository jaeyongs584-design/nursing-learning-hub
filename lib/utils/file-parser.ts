import * as pdfjsLib from 'pdfjs-dist'

// Worker 설정 (Next.js public 폴더 또는 CDN 활용)
// pdfjsLib 3.11.174 버전용 worker CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

/**
 * 텍스트 파일(.txt) 파싱
 */
export async function parseTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = (e) => reject(new Error('텍스트 파일을 읽는 중 오류가 발생했습니다.'))
        reader.readAsText(file)
    })
}

/**
 * PDF 문서 파싱 (브라우저 사이드)
 * 주의: 표, 정교한 레이아웃 보다는 순수 텍스트 컨텐츠 추출 목적
 */
export async function parsePDFFile(file: File): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer()

        // CMap(단어 렌더링 폰트맵) 처리를 위해 CDN 연결 필요 
        // 용량이 제한적환경에서는 기본 파싱만 시도
        const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
            cMapPacked: true,
        })

        const pdfApp = await loadingTask.promise
        const numPages = pdfApp.numPages

        let fullText = ''

        for (let i = 1; i <= numPages; i++) {
            const page = await pdfApp.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ')
            fullText += pageText + '\n\n'
        }

        return fullText.trim()
    } catch (error) {
        console.error('PDF parsing error:', error)
        throw new Error('PDF 파일에서 텍스트를 추출하는데 실패했습니다. 텍스트가 복사 불가능한 이미지 PDF일 수 있습니다.')
    }
}

/**
 * 파일 확장자에 따라 적절한 파서 라우팅
 */
export async function extractTextFromFile(file: File): Promise<string> {
    if (!file) throw new Error('파일이 제공되지 않았습니다.')

    const type = file.type
    const sizeMB = file.size / (1024 * 1024)

    // 안전 장치: 너무 큰 파일은 브라우저 터짐 방지
    if (sizeMB > 10) {
        throw new Error('10MB 이하의 파일만 첨부할 수 있습니다.')
    }

    if (type === 'text/plain') {
        return parseTextFile(file)
    } else if (type === 'application/pdf') {
        return parsePDFFile(file)
    } else {
        throw new Error(`지원하지 않는 파일 형식입니다: ${type} (.txt 또는 .pdf만 지원)`)
    }
}
