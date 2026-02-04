import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WishlistBot/1.0)",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch URL" }, { status: 400 })
    }

    const html = await response.text()

    // Extract metadata using regex (simple approach)
    const getMetaContent = (name: string): string | null => {
      const patterns = [
        new RegExp(`<meta[^>]*property=["']og:${name}["'][^>]*content=["']([^"']+)["']`, "i"),
        new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${name}["']`, "i"),
        new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["']`, "i"),
        new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${name}["']`, "i"),
      ]

      for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match) return match[1]
      }
      return null
    }

    // Get title
    let title = getMetaContent("title")
    if (!title) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      title = titleMatch ? titleMatch[1] : null
    }

    // Get description
    const description = getMetaContent("description")

    // Get image
    const image = getMetaContent("image")

    // Try to extract price (common patterns)
    let price: number | null = null
    const pricePatterns = [
      /"price":\s*"?(\d+\.?\d*)"?/,
      /\$(\d+\.?\d*)/,
      /"amount":\s*"?(\d+\.?\d*)"?/,
    ]

    for (const pattern of pricePatterns) {
      const match = html.match(pattern)
      if (match) {
        price = parseFloat(match[1])
        break
      }
    }

    return NextResponse.json({
      title: title?.trim(),
      description: description?.trim(),
      image,
      price,
    })
  } catch (error) {
    console.error("Error fetching metadata:", error)
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 })
  }
}
