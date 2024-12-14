import type { Data, Layout } from 'plotly.js';
import React from 'react';
import type { PlotParams } from 'react-plotly.js';

interface VectorPlotProps {
  events: {
    id: string;
    name: string;
    description: string;
    vector: number[];
    score: number;
  }[];
  outdoor: number;
  tech: number;
  art: number;
}

function PlotComponent({
  data,
  layout,
  style,
}: {
  data: Data[];
  layout: Partial<Layout>;
  style: React.CSSProperties;
}) {
  const [Plot, setPlot] =
    React.useState<React.ComponentType<PlotParams> | null>(null);

  if (typeof window !== 'undefined') {
    import('react-plotly.js').then((module) => {
      setPlot(() => module.default);
    });
  }

  if (!Plot) {
    return <div>Loading plot...</div>;
  }

  return (
    <Plot
      data={data}
      layout={{ ...layout, autosize: true }}
      useResizeHandler
      style={style}
      config={{ responsive: true, displayModeBar: false }}
    />
  );
}

export function VectorPlot({ events, outdoor, tech, art }: VectorPlotProps) {
  const [mounted, setMounted] = React.useState(false);
  const [colors, setColors] = React.useState<{
    foreground: string;
    background: string;
    border: string;
    mutedForeground: string;
  }>({
    foreground: 'hsl(0, 0%, 0%)',
    background: 'hsl(0, 0%, 100%)',
    border: 'hsl(0, 0%, 85%)',
    mutedForeground: 'hsl(0, 0%, 45%)',
  });

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  React.useEffect(() => {
    const style = getComputedStyle(document.documentElement);

    const fg = `hsl(${style.getPropertyValue('--foreground').trim()})`;
    const bg = `hsl(${style.getPropertyValue('--background').trim()})`;
    const bd = `hsl(${style.getPropertyValue('--border').trim()})`;
    const mf = `hsl(${style.getPropertyValue('--muted-foreground').trim()})`;

    setColors({
      foreground: fg,
      background: bg,
      border: bd,
      mutedForeground: mf,
    });
  }, []);

  if (!mounted || events.length === 0) {
    return <div style={{ color: colors.foreground }}>Loading plot...</div>;
  }

  // Calculate positions for each event based on similarity score
  const eventPoints = events.map((evt, i) => {
    // Convert similarity score (0-1) to radius (1-0)
    // This way, more similar items are closer to the center
    const radius = 1 - evt.score;

    // Calculate angle based on index
    // Distribute events evenly around the circle
    const angle = (i * 2 * Math.PI) / events.length;

    // Convert to cartesian coordinates
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    return {
      ...evt,
      x,
      y,
    };
  });

  // Prepare data for the plot
  const data: Data[] = [
    {
      type: 'scatter',
      mode: 'text+markers',
      name: 'Events',
      x: eventPoints.map((p) => p.x),
      y: eventPoints.map((p) => p.y),
      text: eventPoints.map((p) => p.name),
      textposition: 'top center',
      hovertext: eventPoints.map((p) => `Score: ${p.score.toFixed(2)}`),
      hoverinfo: 'text',
      marker: {
        size: 12,
        color: eventPoints.map((p) => p.score),
        colorscale: 'Viridis',
        showscale: true,
        colorbar: {
          title: 'Similarity Score',
          titlefont: {
            color: colors.foreground,
            size: 12,
            family: 'Geist, sans-serif',
            weight: 400,
            shadow: 'none',
          },
          tickfont: {
            color: colors.foreground,
            size: 12,
            family: 'Geist, sans-serif',
            weight: 400,
            shadow: 'none',
          },
          bordercolor: colors.border,
          len: 0.5,
          bgcolor: 'rgba(0,0,0,0)',
        },
      },
      textfont: {
        color: colors.foreground,
        family: 'Geist, sans-serif',
      },
    },
    {
      type: 'scatter',
      mode: 'markers',
      name: 'Your Preference',
      x: [0],
      y: [0],
      marker: {
        size: 15,
        symbol: 'diamond',
        color: 'hsl(0, 84%, 60%)',
      },
      hoverinfo: 'text',
      hovertext: [
        `Your Preference\nOutdoor: ${(outdoor * 100).toFixed()}%\nTech: ${(
          tech * 100
        ).toFixed()}%\nArt: ${(art * 100).toFixed()}%`,
      ],
    },
  ];

  const axisStyle = {
    showgrid: true,
    zeroline: true,
    showline: false,
    showticklabels: false,
    gridcolor: colors.border,
    zerolinecolor: colors.border,
    range: [-1.2, 1.2],
  };

  const layout: Partial<Layout> = {
    title: {
      text: 'Event Similarity Map',
      font: {
        color: colors.foreground,
        family: 'Geist, sans-serif',
        size: 20,
      },
    },
    showlegend: false,
    autosize: true,
    height: 500,
    paper_bgcolor: colors.background,
    plot_bgcolor: colors.background,
    font: {
      color: colors.foreground,
      family: 'Geist, sans-serif',
    },
    xaxis: axisStyle,
    yaxis: { ...axisStyle, scaleanchor: 'x', scaleratio: 1 },
    margin: {
      l: 40,
      r: 40,
      b: 40,
      t: 60,
    },
  };

  return (
    <div
      style={{
        width: '100%',
        height: '500px',
        backgroundColor: 'transparent',
      }}
    >
      <PlotComponent
        key={`plot-${outdoor}-${tech}-${art}`}
        data={data}
        layout={layout}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
