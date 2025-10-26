import { useParams } from "react-router-dom"
export default function HoldPage() {
  const { id } = useParams()
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-3">Soft hold #{id}</h1>
      <p className="text-neutral-600">24-hour timer • Identity check • Refundable intent fee</p>
    </div>
  )
}
