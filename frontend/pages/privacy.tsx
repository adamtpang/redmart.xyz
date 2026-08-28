import PublicPage from '../components/PublicPage'

export default function PrivacyPage() {
  return (
    <PublicPage
      title="RedMart Privacy Policy | Data Use"
      description="Read how the RedMart prototype handles chat text, browser-local demand data, vendor form fields, hosting logs, cookies, and tracking."
      path="/privacy"
    >
      <h1 className="font-display text-3xl font-bold mb-6">Privacy policy</h1>
      <div className="space-y-8 text-sm text-text-secondary leading-relaxed">
        <section aria-labelledby="chat-data">
          <h2 id="chat-data" className="font-display text-xl font-semibold text-text-primary mb-3">Red chat</h2>
          <p>
            When a visitor submits text through the Red chat, RedMart sends that text and the recent chat context to its server. The server adds prototype catalog context and sends the request to Anthropic&rsquo;s API to generate a response. Visitors should not enter confidential, financial, medical, or identifying information in the chat.
          </p>
        </section>
        <section aria-labelledby="local-data">
          <h2 id="local-data" className="font-display text-xl font-semibold text-text-primary mb-3">Browser-local data</h2>
          <p>
            Demand-board requests, vote records, and a randomly generated voter identifier are stored in the visitor&rsquo;s browser using local storage. That data is not transmitted by the current demand-board implementation. Clearing the site&rsquo;s local storage removes those locally saved requests and vote records from that browser.
          </p>
        </section>
        <section aria-labelledby="seller-data">
          <h2 id="seller-data" className="font-display text-xl font-semibold text-text-primary mb-3">Seller form</h2>
          <p>
            The current seller-onboarding form is a prototype. Information entered there remains in the page&rsquo;s temporary browser state and is not submitted to a RedMart server or automatically published. Closing or refreshing the page discards that temporary form state.
          </p>
        </section>
        <section aria-labelledby="infrastructure-data">
          <h2 id="infrastructure-data" className="font-display text-xl font-semibold text-text-primary mb-3">Hosting, cookies, and tracking</h2>
          <p>
            RedMart is hosted on Vercel, which may process ordinary request metadata such as IP address, browser information, requested path, and request time for delivery and security. The public homepage does not currently load advertising trackers, third-party analytics scripts, or set an application cookie in its initial response.
          </p>
        </section>
        <section aria-labelledby="privacy-contact">
          <h2 id="privacy-contact" className="font-display text-xl font-semibold text-text-primary mb-3">Questions and changes</h2>
          <p>
            Privacy questions or correction requests can be raised through the RedMart public GitHub issue tracker without including sensitive personal information. This policy will be updated when the prototype&rsquo;s collection, storage, or third-party processing changes.
          </p>
        </section>
      </div>
    </PublicPage>
  )
}
