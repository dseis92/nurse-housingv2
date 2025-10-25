import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold mb-2">404 Not Found</h1>
        <p className="text-neutral-600 mb-6">
          We couldn’t find that page. Check the URL or head back home.
        </p>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    </div>
  )
}
