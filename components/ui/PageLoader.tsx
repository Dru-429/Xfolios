import LogoLoader from '@/components/svg/LogoLoader'

export default function PageLoader () {
  return (
    <div className='flex min-h-screen items-center justify-center bg-transparent text-black dark:text-white'>
      <LogoLoader className='h-24 w-24' />
    </div>
  )
}
