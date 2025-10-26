import DeckLocal from '../components/swipe/DeckLocal'

export default function SwipePage() {
  return (
    <div className="px-3">
      <div className="mx-auto max-w-xl">
        <h1 className="text-xl font-semibold mb-3">Match &amp; Book</h1>
        <p className="text-sm text-neutral-600 mb-4">
          Swipe to build your shortlist. Tap a card to see safety, commute &amp; rules.
        </p>
      </div>
      <DeckLocal />
    </div>
  )
}
