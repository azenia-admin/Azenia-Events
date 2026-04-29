import PreviewClient from './PreviewClient';

export const dynamic = 'force-dynamic';

export default async function EventPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PreviewClient slug={slug} />;
}
