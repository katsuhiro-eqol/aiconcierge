import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import md5 from 'md5'
import { decode } from 'html-entities'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const MAX_CHILD_PAGES = 5
const MAX_TEXT_CHARS  = 8000

function extractText(html: string): string {
    return decode(
        html
            .replace(/<(script|style|head|nav|footer)[^>]*>[\s\S]*?<\/\1>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
    )
}

const SKIP_EXT = /\.(png|jpe?g|gif|svg|webp|ico|css|js|json|woff2?|ttf|map)$/i
const SKIP_PATH = /^\/_next\//

function extractChildLinks(html: string, baseUrl: string): string[] {
    const base = new URL(baseUrl)
    const regex = /href=["']([^"']+)["']/gi
    const seen = new Set<string>()
    let match
    while ((match = regex.exec(html)) !== null) {
        try {
            const resolved = new URL(match[1], base.origin)
            if (resolved.origin !== base.origin) continue
            if (SKIP_EXT.test(resolved.pathname)) continue
            if (SKIP_PATH.test(resolved.pathname)) continue
            const key = resolved.origin + resolved.pathname
            if (key !== base.origin + base.pathname) seen.add(resolved.href.split('#')[0])
        } catch { /* 無効なURL */ }
    }
    return [...seen].slice(0, MAX_CHILD_PAGES)
}

async function fetchHtml(url: string): Promise<string> {
    const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SummaryBot/1.0)' },
        signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) throw new Error(`fetch failed: ${res.status} ${url}`)
    return res.text()
}

async function summarizePage(text: string): Promise<string> {
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: '与えられたWebページの本文を1000文字以内で日本語で要約してください。箇条書きは使わず、自然な文章でまとめてください。',
            },
            { role: 'user', content: text.slice(0, MAX_TEXT_CHARS) },
        ],
        max_tokens: 800,
    })
    return completion.choices[0].message.content ?? ''
}

export async function POST(req: NextRequest) {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 })

    try {
        const mainHtml = await fetchHtml(url)
        const childUrls = extractChildLinks(mainHtml, url)
        const allUrls = [url, ...childUrls]

        // 親・子ページのHTMLを並列取得（親は取得済み）
        const htmlResults = await Promise.allSettled([
            Promise.resolve(mainHtml),
            ...childUrls.map(fetchHtml),
        ])

        // 各ページを個別に要約（並列）
        const summaryResults = await Promise.allSettled(
            htmlResults.map(async (r, i) => {
                if (r.status === 'rejected') return null
                const html = r.value
                const text = extractText(html)
                const hash = md5(html)
                const summary = await summarizePage(text)
                return { summary, url: allUrls[i], hash }
            })
        )

        const results = summaryResults
            .filter((r): r is PromiseFulfilledResult<{ summary: string; url: string; hash: string } | null> =>
                r.status === 'fulfilled'
            )
            .map(r => r.value)
            .filter((v): v is { summary: string; url: string; hash: string } => v !== null)

        return NextResponse.json({ results })

    } catch (error) {
        console.error('[summarizeUrl]', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
