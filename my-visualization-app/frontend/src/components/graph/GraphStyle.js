class GraphStyle {
  constructor() {
    this.colorScheme = '#0000FF';
    this.markerStyle = { size: 8, color: '#0000FF' };
    this.lineStyle = { width: 2, dash: 'solid' };
    this.layoutSize = { width: 600, height: 400 };
    this.backgroundColor = '#FFFFFF';
  }

  /**
   * Setting the colour scheme
   */
  setColorScheme(colorScheme) {
    this.colorScheme = colorScheme;
    this.markerStyle.color = colorScheme;
  }

  /**
   * Change colour
   */
  changeColor(newColor) {
    this.setColorScheme(newColor);
  }

  /**
   * Get the current markup style
   */
  getMarkerStyle() {
    return this.markerStyle;
  }
}

export default GraphStyle;
