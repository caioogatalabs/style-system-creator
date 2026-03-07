import { TypographyPreview } from './sections/TypographyPreview';
import { ColorSwatchPreview } from './sections/ColorSwatchPreview';
import { SurfacePreview } from './sections/SurfacePreview';

export function OverviewPreview() {
  return (
    <div>
      <TypographyPreview />
      <ColorSwatchPreview />
      <SurfacePreview />
    </div>
  );
}
