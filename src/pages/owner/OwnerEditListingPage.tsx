import { useParams } from "react-router-dom"
export default function OwnerEditListingPage() {
  const { id } = useParams()
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-3">Edit Listing #{id}</h1>
    </div>
  )
}
