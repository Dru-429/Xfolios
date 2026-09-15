import Landing from "@/components/landing";
import { auth } from "@/auth"

const page = async () => {
  const session = await auth()

  return (
    <div>
      <Landing user={session?.user ?? null} />
    </div>
  )
}

export default page