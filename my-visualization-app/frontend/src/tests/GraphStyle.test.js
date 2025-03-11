import GraphStyle from '../components/graph/GraphStyle';

describe('GraphStyle Class', () => {
  let graphStyle;

  beforeEach(() => {
    graphStyle = new GraphStyle();
  });

  test('should initialize with default values', () => {
    expect(graphStyle.colorScheme).toBe('#0000FF');
    expect(graphStyle.markerStyle).toEqual({ size: 8, color: '#0000FF' });
    expect(graphStyle.lineStyle).toEqual({ width: 2, dash: 'solid' });
    expect(graphStyle.layoutSize).toEqual({ width: 600, height: 400 });
    expect(graphStyle.backgroundColor).toBe('#FFFFFF');
  });

  test('should set a new color scheme', () => {
    const newColorScheme = '#FF0000';
    graphStyle.setColorScheme(newColorScheme);

    expect(graphStyle.colorScheme).toBe(newColorScheme);
    expect(graphStyle.markerStyle.color).toBe(newColorScheme);
  });

  test('should change color using changeColor method', () => {
    const newColor = '#00FF00';
    graphStyle.changeColor(newColor);

    expect(graphStyle.colorScheme).toBe(newColor);
    expect(graphStyle.markerStyle.color).toBe(newColor);
  });

  test('should return the current marker style', () => {
    const markerStyle = graphStyle.getMarkerStyle();
    expect(markerStyle).toEqual({ size: 8, color: '#0000FF' });
  });
});
