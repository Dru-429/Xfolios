'use server'

import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { prisma } from '@/src/db'

type MetadataResult = {
  url: string
  previewUrl: string
  title: string
  oneLiner: string
}

function normalizeUrl(value: string) {
  const url = new URL(value.trim())

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Use an HTTP or HTTPS website URL.')
  }

  return url.toString()
}

function getMetaContent(html: string, property: string) {
  const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = html.match(
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${escapedProperty}["'][^>]+content=["']([^"']*)["'][^>]*>`,
      'i'
    )
  )

  return match?.[1]?.trim() ?? ''
}

function getTitle(html: string) {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? ''
}

export async function fetchWebsiteMetadata(value: string): Promise<MetadataResult> {
  const url = normalizeUrl(value)
  const response = await fetch(url, {
    headers: { 'user-agent': 'Xfolios metadata fetcher' },
    signal: AbortSignal.timeout(10000),
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error(`Could not fetch that website (${response.status}).`)
  }

  const html = await response.text()
  const title =
    getMetaContent(html, 'og:title') ||
    getMetaContent(html, 'twitter:title') ||
    getTitle(html) ||
    new URL(url).hostname
  const oneLiner =
    getMetaContent(html, 'og:description') ||
    getMetaContent(html, 'description') ||
    getMetaContent(html, 'twitter:description')
  const previewUrl =
    getMetaContent(html, 'og:image') || getMetaContent(html, 'twitter:image')

  return { url, previewUrl, title, oneLiner }
}

export async function createPage(formData: FormData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error('You must be signed in to submit a page.')
  }

  const websiteUrl = normalizeUrl(String(formData.get('websiteUrl') ?? ''))
  const title = String(formData.get('title') ?? '').trim()
  const oneLiner = String(formData.get('oneLiner') ?? '').trim()
  const coverUrl = String(formData.get('coverUrl') ?? '').trim()
  const rawTags = String(formData.get('tags') ?? '')
  const tags = rawTags
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)
    .slice(0, 8)

  if (!title) {
    throw new Error('Add a title before submitting.')
  }

  const page = await prisma.page.create({
    data: {
      userId: session.user.id,
      websiteUrl,
      coverUrl: coverUrl || null,
      title,
      oneLiner: oneLiner || null,
      elo: 1000,
      tags
    }
  })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { totalPage: { increment: 1 } }
  })

  redirect(`/page/${page.id}`)
}
