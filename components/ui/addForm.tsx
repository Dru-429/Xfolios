'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronDown, LoaderCircle, Plus, Sparkles } from 'lucide-react'

import { createPage, fetchWebsiteMetadata } from '@/app/add/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const tagOptions = ['AI', 'SaaS', 'Portfolio', 'Hardware', 'Design', 'Developer tools']

type AddFormProps = {
  userName: string
}

export default function AddForm({ userName }: AddFormProps) {
  const [url, setUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [title, setTitle] = useState('')
  const [oneLiner, setOneLiner] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagValue, setTagValue] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [submitError, setSubmitError] = useState('')

  const remainingTags = useMemo(
    () => tagOptions.filter(tag => !tags.includes(tag)),
    [tags]
  )

  async function handleFetch() {
    setFetchError('')

    if (!url.trim()) {
      setFetchError('Add a website URL first.')
      return
    }

    setIsFetching(true)
    try {
      const metadata = await fetchWebsiteMetadata(url)
      setUrl(metadata.url)
      setPreviewUrl(metadata.previewUrl)
      setTitle(metadata.title)
      setOneLiner(metadata.oneLiner)
    } catch (error) {
      setFetchError(
        error instanceof Error ? error.message : 'We could not fetch that website.'
      )
    } finally {
      setIsFetching(false)
    }
  }

  function handleTagChange(value: string) {
    setTagValue('')
    if (value && !tags.includes(value)) {
      setTags(current => [...current, value])
    }
  }

  function removeTag(tag: string) {
    setTags(current => current.filter(item => item !== tag))
  }

  return (
    <form
      action={async formData => {
        setSubmitError('')
        try {
          await createPage(formData)
        } catch (error) {
          if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
            throw error
          }
          setSubmitError(
            error instanceof Error ? error.message : 'Could not submit this page.'
          )
        }
      }}
      className='rounded-xl border border-border bg-card p-5 shadow-sm sm:p-7'
    >
      <input type='hidden' name='tags' value={tags.join(',')} />
      <div className='mb-7 flex items-center justify-between gap-4 border-b border-border pb-5'>
        <div>
          <p className='font-display text-xl'>New folio</p>
          <p className='mt-1 text-sm text-muted-foreground'>Submitting as @{userName}</p>
        </div>
        <span className='font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground'>
          01 / 01
        </span>
      </div>

      <div className='space-y-5'>
        <div>
          <label htmlFor='website-url' className='mb-2 block text-sm font-medium'>
            Website URL
          </label>
          <div className='flex gap-2'>
            <Input
              id='website-url'
              name='websiteUrl'
              type='url'
              value={url}
              onChange={event => setUrl(event.target.value)}
              placeholder='https://yourwebsite.com'
              required
              className='h-11'
            />
            <Button type='button' onClick={handleFetch} disabled={isFetching} className='h-11 shrink-0 px-4 sm:px-5 rounded-md'>
              {isFetching ? <LoaderCircle className='animate-spin' aria-hidden='true' /> : <Sparkles aria-hidden='true' />}
              <span>{isFetching ? 'Fetching' : 'Fetch'}</span>
            </Button>
          </div>
          {fetchError ? <p className='mt-2 text-xs text-destructive' role='alert'>{fetchError}</p> : null}
        </div>

        <div>
          <label htmlFor='preview-url' className='mb-2 block text-sm font-medium'>Preview URL</label>
          <Input
            id='preview-url'
            name='coverUrl'
            type='url'
            value={previewUrl}
            onChange={event => setPreviewUrl(event.target.value)}
            placeholder='https://.../og-image.png'
            className='h-11'
          />
          <p className='mt-2 text-xs text-muted-foreground'>An Open Graph image or preview image for your listing.</p>
        </div>

        <div>
          <label htmlFor='folio-title' className='mb-2 block text-sm font-medium'>Title</label>
          <Input
            id='folio-title'
            name='title'
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder='Your name or studio'
            required
            className='h-11'
          />
        </div>

        <div>
          <label htmlFor='one-liner' className='mb-2 block text-sm font-medium'>One-liner</label>
          <Textarea
            id='one-liner'
            name='oneLiner'
            value={oneLiner}
            onChange={event => setOneLiner(event.target.value)}
            placeholder='A short description of what you make'
            rows={3}
            className='resize-none'
          />
        </div>

        <div>
          <label htmlFor='folio-tags' className='mb-2 block text-sm font-medium'>Tags</label>
          <div className='relative'>
            <select
              id='folio-tags'
              value={tagValue}
              onChange={event => handleTagChange(event.target.value)}
              className='flex h-11 w-full appearance-none rounded-md border border-input bg-transparent px-3 pr-10 text-sm text-foreground outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring'
            >
              <option value=''>Choose a tag</option>
              {remainingTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </select>
            <ChevronDown className='pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-muted-foreground' aria-hidden='true' />
          </div>
          <div className='mt-3 flex min-h-7 flex-wrap gap-2'>
            {tags.map(tag => (
              <button type='button' key={tag} onClick={() => removeTag(tag)} className='inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground' aria-label={`Remove ${tag} tag`}>
                {tag} <span aria-hidden='true'>x</span>
              </button>
            ))}
            {tags.length === 0 ? <span className='text-xs text-muted-foreground'>No tags selected yet.</span> : null}
          </div>
        </div>
      </div>

      <div className='mt-8 border-t border-border pt-5'>
        <Button type='submit' className='h-11 w-full rounded-md px-6 sm:w-auto'>
          <Check aria-hidden='true' />
          Submit folio
        </Button>
        {submitError ? <p className='mt-3 text-xs text-destructive' role='alert'>{submitError}</p> : null}
      </div>
    </form>
  )
}
