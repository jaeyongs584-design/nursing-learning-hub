import type { Metadata } from "next"
import { Noto_Sans_KR } from "next/font/google"
import "./globals.css"

const notoSansKR = Noto_Sans_KR({
    variable: "--font-noto-sans-kr",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    display: "swap",
})

export const metadata: Metadata = {
    title: "Nursing Hub — 간호대학생 학습 관리",
    description: "간호대학생을 위한 올인원 학습 관리 플랫폼. 과목 관리, 퀴즈, 오답 노트, 과제 관리 등.",
    keywords: ["간호대학생", "학습관리", "퀴즈", "오답노트", "과제관리"],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ko" className={notoSansKR.variable}>
            <body className="antialiased">
                {children}
            </body>
        </html>
    )
}
