/**
 * Structured data emitter.
 *
 * `data` is always built from our own constants in `@/lib/seo`, never from
 * user input, so serialising it into the document is safe.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
