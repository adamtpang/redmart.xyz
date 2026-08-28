import PublicPage from '../components/PublicPage'

export default function AboutPage() {
  return (
    <PublicPage
      title="About RedMart | Community Marketplace"
      description="Learn how the RedMart open-source prototype explores community commerce through a catalog, demand board, and conversational product helper."
      path="/about"
    >
      <h1 className="font-display text-3xl font-bold mb-6">About RedMart</h1>
      <div className="space-y-5 text-sm text-text-secondary leading-relaxed">
        <p>
          RedMart is an open-source community marketplace prototype maintained through its public GitHub repository. The project explores how a small community can place a product catalog, demand signals, and a conversational helper in one understandable interface without pretending that the prototype is a finished retail platform.
        </p>
        <p>
          The homepage shows eight sample catalog entries across six example vendor profiles. The demand board lets visitors create and vote on requests inside their own browser, while the Red chat compares a submitted request with the prototype catalog and returns a conversational response.
        </p>
        <p>
          RedMart does not currently process payments, complete purchases, or automatically publish vendor applications. Source code, implementation history, and technical feedback are available in the public repository, giving visitors a concrete way to inspect how the prototype works and how its claims are implemented.
        </p>
      </div>
      <a
        href="https://github.com/adamtpang/redmart.xyz"
        className="inline-block mt-8 text-accent-light hover:underline"
        rel="noreferrer"
      >
        View the RedMart source code
      </a>
    </PublicPage>
  )
}
