import { OverviewPreview } from '@/components/preview/OverviewPreview';
import { URLConfigLoader } from '@/components/URLConfigLoader';
import { deserializeConfig } from '@/lib/url-serializer';
import { generateInitialStyles } from '@/lib/token-css-server';

// URL params that signal a shared config is present
const CONFIG_PARAMS = ['p', 's', 'a', 'n', 't', 'hf', 'bf', 'hw', 'bw', 'r', 'el'];

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function OverviewPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const hasUrlConfig = CONFIG_PARAMS.some((k) => k in params);

  if (!hasUrlConfig) {
    return <OverviewPreview />;
  }

  // Parse the URL config server-side and generate its exact CSS vars.
  // This <style> overrides the default styles from layout so the first
  // paint already reflects the shared config — no flash.
  const urlParams = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v ?? '')]),
  );
  const config = deserializeConfig(urlParams);
  const urlStyles = generateInitialStyles(config);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: urlStyles }} />
      <URLConfigLoader params={params} />
      <OverviewPreview />
    </>
  );
}
