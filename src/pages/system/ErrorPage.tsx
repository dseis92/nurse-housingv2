import { isRouteErrorResponse, useRouteError, Link } from 'react-router-dom'

export default function ErrorPage() {
  const error = useRouteError()
  const status = isRouteErrorResponse(error) ? error.status : 500
  const statusText = isRouteErrorResponse(error) ? error.statusText : 'Unexpected Error'

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold mb-2">{status} {statusText}</h1>
        <p className="text-neutral-600 mb-6">
          Something went off-route. You can go back home and try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="btn btn-primary">Go Home</Link>
          <button className="btn" onClick={()=>location.reload()}>Reload</button>
        </div>
      </div>
    </div>
  )
}
