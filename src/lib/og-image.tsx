import fs from 'node:fs/promises';
import path from 'node:path';
import satori from 'satori';

interface OGImageOptions {
  title: string;
  description?: string;
  scale?: number;
}

function OGImage({ title, description, scale = 1 }: OGImageOptions) {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        backgroundColor: 'hsl(0 0% 7%)',
        padding: `${80 * scale}px`,
        gap: `${32 * scale}px`,
      }}
    >
      <div
        style={{
          fontSize: `${72 * scale}px`,
          fontWeight: 700,
          color: '#fff',
          lineHeight: 1.2,
          whiteSpace: 'pre-wrap',
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </div>
      {description && (
        <div
          style={{
            fontSize: `${32 * scale}px`,
            fontWeight: 400,
            color: 'hsl(0 0% 60%)',
            lineHeight: 1.4,
            whiteSpace: 'pre-wrap',
          }}
        >
          {description}
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          bottom: `${80 * scale}px`,
          left: `${80 * scale}px`,
          display: 'flex',
          alignItems: 'center',
          gap: `${16 * scale}px`,
        }}
      >
        <div
          style={{
            fontSize: `${32 * scale}px`,
            fontWeight: 700,
            color: '#fff',
          }}
        >
          jq.codes
        </div>
      </div>
    </div>
  );
}

export async function generateOGImage(
  options: OGImageOptions,
): Promise<string> {
  // Load the Geist variable font file
  const fontRegular = await fs.readFile(
    path.join(process.cwd(), 'public/fonts/Geist-Regular.ttf'),
  );

  const scale = options.scale || 1;

  const svg = await satori(
    <OGImage
      title={options.title}
      description={options.description}
      scale={scale}
    />,
    {
      width: 1200 * scale,
      height: 630 * scale,
      fonts: [
        {
          name: 'Geist',
          data: fontRegular,
          weight: 400,
          style: 'normal',
        },
      ],
    },
  );

  return svg;
}
