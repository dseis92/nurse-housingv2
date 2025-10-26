import { useParams } from "react-router-dom"
export default function ChatThreadPage() {
  const { id } = useParams()
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-3">Chat #{id}</h1>
      <div className="rounded-2xl border h-96 bg-white" />
    </div>
  )
}
