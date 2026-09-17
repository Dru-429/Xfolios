'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, ChevronDown, Trash2, X } from 'lucide-react'

import { deletePage, updatePage } from '@/app/page/[pageId]/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type EditablePage = {
  id: string
  websiteUrl: string
  coverUrl: string | null
  title: string
  oneLiner: string | null
  elo: number
  tags: string[]
}

type EditPageProps = {
  page: EditablePage
  onClose: () => void
}

const tagOptions = ['AI', 'SaaS', 'Portfolio', 'Hardware', 'Design', 'Developer tools']

export default function EditPage ({ page, onClose }: EditPageProps) {
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [tags, setTags] = useState<string[]>(page.tags)
  const [tagValue, setTagValue] = useState('')

  const remainingTags = useMemo(
    () => tagOptions.filter(tag => !tags.includes(tag)),
    [tags]
  )

  async function handleSubmit (formData: FormData) {
    setError('')
    setIsSaving(true)

    try {
      await updatePage(page.id, formData)
      window.location.reload() 
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not update this page.'
      )
      setIsSaving(false)
    }
  }

  function handleTagChange (value: string) {
    setTagValue('')
    if (value && !tags.includes(value)) {
      setTags(current => [...current, value])
    }
  }

  function removeTag (tag: string) {
    setTags(current => current.filter(item => item !== tag))
  }

  async function handleDelete () {
    if (deleteConfirmation !== 'DELETE') {
      setError('Type DELETE exactly to confirm removal.')
      return
    }

    setError('')
    setIsDeleting(true)

    try {
      const result = await deletePage(page.id)
      window.location.href = result.redirectTo
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Could not delete this page.'
      )
      setIsDeleting(false)
    }
  }

  return (
    <div
      className='fixed inset-0 z-[120] overflow-y-auto bg-black/50 p-5'
      role='dialog'
      aria-modal='true'
      aria-labelledby='edit-page-title'
    >
      <form
        action={handleSubmit}
        className='mx-auto my-6 w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-xl sm:p-8'
      >
        <input type='hidden' name='tags' value={tags.join(',')} />
        <div className='flex items-start justify-between gap-4 border-b border-border pb-5'>
          <div>
            <p className='font-mono text-[10px] uppercase tracking-[0.16em] text-primary'>
              Page settings
            </p>
            <h2 id='edit-page-title' className='mt-2 font-display text-2xl'>
              Edit folio
            </h2>
          </div>
          <Button
            type='button'
            variant='outline'
            size='icon'
            onClick={onClose}
            aria-label='Close edit page form'
            className='shrink-0 rounded-md'
          >
            <X aria-hidden='true' />
          </Button>
        </div>

        <div className='mt-6 space-y-5'>
          <div>
            <label
              htmlFor='edit-website-url'
              className='mb-2 block text-sm font-medium'
            >
              Website URL
            </label>
            <Input
              id='edit-website-url'
              name='websiteUrl'
              type='url'
              defaultValue={page.websiteUrl}
              required
            />
          </div>

          <div>
            <label
              htmlFor='edit-cover-url'
              className='mb-2 block text-sm font-medium'
            >
              Preview URL
            </label>
            <Input
              id='edit-cover-url'
              name='coverUrl'
              type='url'
              defaultValue={page.coverUrl ?? ''}
            />
          </div>

          <div>
            <label
              htmlFor='edit-title'
              className='mb-2 block text-sm font-medium'
            >
              Title
            </label>
            <Input
              id='edit-title'
              name='title'
              defaultValue={page.title}
              required
            />
          </div>

          <div>
            <label
              htmlFor='edit-one-liner'
              className='mb-2 block text-sm font-medium'
            >
              One-liner
            </label>
            <Textarea
              id='edit-one-liner'
              name='oneLiner'
              defaultValue={page.oneLiner ?? ''}
              rows={3}
            />
          </div>

          <div>
            <label
              htmlFor='folio-tags'
              className='mb-2 block text-sm font-medium'
            >
              Tags
            </label>
            <div className='relative'>
              <select
                id='folio-tags'
                value={tagValue}
                onChange={event => handleTagChange(event.target.value)}
                className='flex h-11 w-full appearance-none rounded-md border border-input bg-transparent px-3 pr-10 text-sm text-foreground outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring'
              >
                <option value=''>Choose a tag</option>
                {remainingTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
              <ChevronDown
                className='pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-muted-foreground'
                aria-hidden='true'
              />
            </div>
            <div className='mt-3 flex min-h-7 flex-wrap gap-2'>
              {tags.map(tag => (
                <button
                  type='button'
                  key={tag}
                  onClick={() => removeTag(tag)}
                  className='inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground'
                  aria-label={`Remove ${tag} tag`}
                >
                  {tag} <span aria-hidden='true'>x</span>
                </button>
              ))}
              {tags.length === 0 ? (
                <span className='text-xs text-muted-foreground'>
                  No tags selected yet.
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {error ? (
          <p className='mt-5 text-sm text-destructive' role='alert'>
            {error}
          </p>
        ) : null}
                <div className='mt-8 border-t border-destructive/30 pt-5'>
          <div className='flex items-start gap-3'>
            <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-destructive' aria-hidden='true' />
            <div>
              <p className='text-sm font-medium text-destructive'>Delete this page</p>
              <p className='mt-1 text-xs leading-5 text-muted-foreground'>
                This action permanently removes the page.
              </p>
            </div>
          </div>
          <Button
            type='button'
            variant='destructive'
            onClick={() => {
              setError('')
              setDeleteConfirmation('')
              setShowDeleteConfirmation(true)
            }}
            disabled={isSaving || isDeleting}
            className='mt-4 rounded-md'
          >
            <Trash2 aria-hidden='true' />
            Delete page
          </Button>
        </div>

        <div className='mt-7 flex justify-end gap-2 border-t border-border pt-5'>
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            disabled={isSaving}
            className="rounded-md"
          >
            Cancel
          </Button>
          <Button 
            type='submit' 
            disabled={isSaving}
            className="rounded-md"
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>

      {showDeleteConfirmation ? (
        <div
          className='fixed inset-0 z-[130] grid place-items-center bg-black/60 p-5'
          role='dialog'
          aria-modal='true'
          aria-labelledby='confirm-delete-page-title'
        >
          <div className='w-full max-w-md rounded-lg border border-destructive/40 bg-card p-6 shadow-xl'>
            <h3 id='confirm-delete-page-title' className='font-display text-xl'>
              Delete this page?
            </h3>
            <p className='mt-3 text-sm leading-6 text-muted-foreground'>
              Type <strong className='font-mono text-foreground'>DELETE</strong> to permanently remove this page.
            </p>
            <Input
              value={deleteConfirmation}
              onChange={event => setDeleteConfirmation(event.target.value)}
              placeholder='DELETE'
              autoFocus
              className='mt-4 bg-destructive/20 border-destructive/40 ring-destructive/20 dark:hover:bg-destructive/30 dark:ring-destructive/40'
              aria-label='Type DELETE to confirm page deletion'
            />
            <div className='mt-6 flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setShowDeleteConfirmation(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type='button'
                variant='destructive'
                onClick={() => void handleDelete()}
                disabled={isDeleting || deleteConfirmation !== 'DELETE'}
              >
                {isDeleting ? 'Deleting...' : 'Yes'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      </form>
    </div>
  )
}
