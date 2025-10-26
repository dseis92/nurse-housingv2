import { useParams } from "react-router-dom"
export default function ListingDetailPage() {
  const { id } = useParams()
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-3">Listing #{id}</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border aspect-video bg-neutral-50" />
        <div className="space-y-2">
          <p className="text-sm text-neutral-600">Price/week • Commute @ shift times • Min stay</p>
          <p className="text-sm text-neutral-600">Safety badges • Pet & parking rules • 10s video</p>
        </div>
      </div>
    </div>
  )
}
