import PublicPage from '../components/PublicPage'

export default function ContactPage() {
  return (
    <PublicPage
      title="Contact RedMart | Project Support"
      description="Contact the RedMart project maintainers through the public GitHub issue tracker for technical questions, privacy requests, or corrections."
      path="/contact"
    >
      <h1 className="font-display text-3xl font-bold mb-6">Contact RedMart</h1>
      <div className="space-y-5 text-sm text-text-secondary leading-relaxed">
        <p>
          RedMart project questions, bug reports, privacy requests, and factual corrections can be submitted through the public GitHub issue tracker. That channel keeps project support transparent and avoids publishing a maintainer&rsquo;s private phone number, address, or personal email on the website.
        </p>
        <p>
          A GitHub issue is public, so visitors should not include passwords, payment details, identity documents, private contact information, or sensitive conversation text. The issue title should briefly name the affected page, and the description should include only the minimum information needed to reproduce the problem.
        </p>
        <p>
          Product availability and transactions are not handled through the project issue tracker. The current public site is a prototype, does not process payments, and does not provide a private customer-support inbox.
        </p>
      </div>
      <a
        href="https://github.com/adamtpang/redmart.xyz/issues"
        className="inline-block mt-8 bg-accent text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-accent-light"
        rel="noreferrer"
      >
        Contact the project maintainers
      </a>
    </PublicPage>
  )
}
